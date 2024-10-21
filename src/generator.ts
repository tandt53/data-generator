import {z, ZodNullable, ZodOptional, ZodType, ZodObject, ZodTypeAny} from 'zod';
import {TestCase} from "./types";
import {GeneratorRegistry} from "./registry";
import {tc} from "./testCaseUtils";

const optionalCase = (isValid: boolean) => {
    return tc(z.string().optional(), `${isValid? 'valid' : 'invalid'} undefined for optional`, undefined)
};
const nullableCase = (isValid: boolean) => {
    return tc(z.string().nullable(), `${isValid? 'valid' : 'invalid'} null for nullable`, null)
};

export class TestCaseGenerator {
    private registry: GeneratorRegistry;

    constructor(registry: GeneratorRegistry) {
        this.registry = registry;
    }

    valid(schema: ZodType): TestCase[] {
        const testCases: TestCase[] = [];
        if (schema instanceof ZodOptional) {
            testCases.push(optionalCase(true));
            testCases.push(...this.valid(schema.unwrap()));
        } else if (schema instanceof ZodNullable) {
            testCases.push(nullableCase(true));
            testCases.push(...this.valid(schema.unwrap()));
        } else if (schema instanceof ZodObject) {
            testCases.push(...this.validObject(schema));
        } else {
            const generator = this.registry.getGeneratorForSchema(schema);
            if (!generator) {
                throw new Error(`No generator found for schema type: ${schema.constructor.name}`);
            }
            testCases.push(...generator.valid(schema));
        }
        return testCases;
    }

    invalid(schema: ZodType): TestCase[] {

        if (schema instanceof ZodOptional) {
             return this.invalid(schema.unwrap());
        }
        if (schema instanceof ZodNullable) {
            return this.invalid(schema.unwrap());
        }
        if (schema instanceof ZodObject) {
            return this.invalidObject(schema);
        }

        const generator = this.registry.getGeneratorForSchema(schema);
        if (!generator) {
            throw new Error(`No generator found for schema type: ${schema.constructor.name}`);
        }

        return generator.invalid(schema);
    }

    private validObject(schema: ZodObject<any>): TestCase[] {
        const shape = schema.shape;
        const propertyTestCases: Record<string, TestCase[]> = {};

        // Generate valid test cases for each property
        for (const [key, propertySchema] of Object.entries(shape)) {
            if (this.isZodType(propertySchema)) {
                propertyTestCases[key] = this.valid(propertySchema);
            }
        }

        // Combine property test cases into object test cases
        const objectTestCases = this.combinePropertyTestCases(propertyTestCases);

        // Create TestCase objects for each combined object
        return objectTestCases.map(obj => tc(schema, "valid object", obj)).filter(tc => tc.isValid);
    }

    private combinePropertyTestCases(propertyTestCases: Record<string, TestCase[]>): any[] {
        const keys = Object.keys(propertyTestCases);
        if (keys.length === 0) return [{}];

        const [firstKey, ...restKeys] = keys;
        const firstPropertyCases = propertyTestCases[firstKey].map(tc => tc.value);

        const restCombinations = this.combinePropertyTestCases(
            Object.fromEntries(restKeys.map(key => [key, propertyTestCases[key]]))
        );

        return firstPropertyCases.flatMap(firstValue =>
            restCombinations.map(restCombination => ({
                [firstKey]: firstValue,
                ...restCombination
            }))
        );
    }

    private invalidObject(schema: ZodObject<any>): TestCase[] {
        const testCases: TestCase[] = [];
        const shape = schema.shape;

        // Generate invalid cases by making each required property invalid
        for (const [key, propertySchema] of Object.entries(shape)) {
            if (this.isZodType(propertySchema) && !(propertySchema instanceof ZodOptional)) {
                const invalidCases = this.invalid(propertySchema);
                for (const invalidCase of invalidCases) {
                    const invalidObject = this.generateValidObjectExcept(shape, key, invalidCase.value);
                    testCases.push(tc(schema, `invalid object with invalid ${key}: ${invalidCase.description}`, invalidObject));
                }
            }
        }

        // Generate an invalid case by omitting a required property
        for (const [key, propertySchema] of Object.entries(shape)) {
            if (this.isZodType(propertySchema) && !(propertySchema instanceof ZodOptional)) {
                const invalidObject = this.generateValidObjectExcept(shape, key);
                testCases.push(tc(schema, `invalid object missing required property: ${key}`, invalidObject));
            }
        }

        // Generate an invalid case with an extra property
        const invalidObject = this.generateValidObject(shape);
        const invalidObjectWithExtra = {...invalidObject, extraProperty: "extra"};
        testCases.push(tc(schema, "invalid object with extra property", invalidObjectWithExtra));

        return testCases.filter(testCase => !testCase.isValid);
    }

    private generateValidObject(shape: z.ZodRawShape): Record<string, any> {
        const validObject: Record<string, any> = {};
        for (const [key, propertySchema] of Object.entries(shape)) {
            if (this.isZodType(propertySchema)) {
                const validCases = this.valid(propertySchema);
                if (validCases.length > 0) {
                    validObject[key] = validCases[0].value;
                }
            }
        }
        return validObject;
    }

    private generateValidObjectExcept(shape: z.ZodRawShape, exceptKey: string, exceptValue?: any): Record<string, any> {
        const validObject: Record<string, any> = {};
        for (const [key, propertySchema] of Object.entries(shape)) {
            if (key !== exceptKey && this.isZodType(propertySchema)) {
                const validCases = this.valid(propertySchema);
                if (validCases.length > 0) {
                    validObject[key] = validCases[0].value;
                }
            } else if (key === exceptKey && exceptValue !== undefined) {
                validObject[key] = exceptValue;
            }
        }
        return validObject;
    }

    private isZodType(schema: unknown): schema is ZodTypeAny {
        return schema instanceof ZodType;
    }
}