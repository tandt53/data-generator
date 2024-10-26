import {z, ZodNullable, ZodOptional, ZodType, ZodObject} from 'zod';
import {TestCase} from "./types";
import {GeneratorRegistry} from "./registry";
import {tc} from "./testCaseUtils";

export class TestCaseGenerator {
    constructor(private registry: GeneratorRegistry) {
    }

    valid(schema: ZodType): TestCase[] {
        if (schema instanceof ZodOptional) {
            return [
                tc(schema, "Should accept undefined for optional field", undefined),
                ...this.valid(schema.unwrap())
            ];
        }

        if (schema instanceof ZodNullable) {
            return [
                tc(schema, "Should accept null for nullable field", null),
                ...this.valid(schema.unwrap())
            ];
        }

        if (schema instanceof ZodObject) {
            return this.validObject(schema);
        }

        const generator = this.registry.getGeneratorForSchema(schema);
        if (!generator) {
            throw new Error(`No generator found for schema type: ${schema.constructor.name}`);
        }
        return generator.valid(schema);
    }

    invalid(schema: ZodType): TestCase[] {
        if (schema instanceof ZodOptional || schema instanceof ZodNullable) {
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

    private validObject(schema: ZodObject<any>, parentPath: string = ''): TestCase[] {
        const testCases: TestCase[] = [];
        const shape = schema.shape;

        // Generate test cases for each field
        for (const [key, propertySchema] of Object.entries(shape)) {
            if (!this.isZodType(propertySchema)) continue;

            const currentPath = parentPath ? `${parentPath}.${key}` : key;

            // Unwrap optional/nullable to check for ZodObject
            const unwrappedSchema = this.unwrapSchema(propertySchema);

            if (unwrappedSchema instanceof ZodObject) {
                if (propertySchema instanceof ZodOptional) {
                    // Add undefined case for optional object
                    const baseObject = this.createValidObject(shape, key);
                    testCases.push(tc(
                        schema,
                        `Should accept undefined for optional object in '${currentPath}'`,
                        baseObject
                    ));
                }

                if (propertySchema instanceof ZodNullable) {
                    // Add null case for nullable object
                    const baseObject = this.createValidObject(shape, key);
                    baseObject[key] = null;
                    testCases.push(tc(
                        schema,
                        `Should accept null value for nullable object in '${currentPath}'`,
                        baseObject
                    ));
                }

                // Handle nested objects recursively with updated path
                const nestedCases = this.validObject(unwrappedSchema, currentPath);
                for (const nestedCase of nestedCases) {
                    const baseObject = this.createValidObject(shape, key);
                    baseObject[key] = nestedCase.value;
                    testCases.push(tc(
                        schema,
                        nestedCase.description,
                        baseObject
                    ));
                }
            } else {
                // Handle non-object fields
                const validCases = this.valid(propertySchema);
                for (const validCase of validCases) {
                    const baseObject = this.createValidObject(shape, key);
                    baseObject[key] = validCase.value;
                    testCases.push(tc(
                        schema,
                        `${validCase.description} for '${currentPath}'`,
                        baseObject
                    ));
                }
            }
        }

        // Add one case with random valid values
        // Add complete valid object case
        testCases.push(tc(
            schema,
            parentPath
                ? `Should accept valid complete nested object for '${parentPath}'`
                : "Should accept object with all fields containing valid values",
            this.createValidObject(shape)
        ));

        return testCases.filter(tc => tc.isValid);
    }

    private unwrapSchema(schema: ZodType): ZodType {
        if (schema instanceof ZodOptional || schema instanceof ZodNullable) {
            return this.unwrapSchema(schema.unwrap());
        }
        return schema;
    }

    private invalidObject(schema: ZodObject<any>, parentPath: string = ''): TestCase[] {
        const testCases: TestCase[] = [];
        const shape = schema.shape;

        for (const [key, propertySchema] of Object.entries(shape)) {
            if (!this.isZodType(propertySchema)) continue;

            const currentPath = parentPath ? `${parentPath}.${key}` : key;
            const unwrappedSchema = this.unwrapSchema(propertySchema);

            if (unwrappedSchema instanceof ZodObject) {
                // Handle type error for the object itself
                const baseObject = this.createValidObject(shape, key);
                baseObject[key] = "not an object";
                testCases.push(tc(
                    schema,
                    `Should reject non-object value for object field '${currentPath}'`,
                    baseObject
                ));

                // Handle nested objects recursively with updated path
                const nestedCases = this.invalidObject(unwrappedSchema, currentPath);
                for (const nestedCase of nestedCases) {
                    const baseObject = this.createValidObject(shape, key);
                    baseObject[key] = nestedCase.value;
                    testCases.push(tc(
                        schema,
                        `${nestedCase.description}`,
                        baseObject
                    ));
                }
            } else {
                // Handle missing required field case
                if (!(propertySchema instanceof ZodOptional)) {
                    const missingObject = this.createValidObject(shape, key);
                    testCases.push(tc(
                        schema,
                        `Should reject object missing required field '${currentPath}'`,
                        missingObject
                    ));
                }

                // Handle invalid values
                const invalidCases = this.invalid(propertySchema);
                for (const invalidCase of invalidCases) {
                    const baseObject = this.createValidObject(shape, key);
                    baseObject[key] = invalidCase.value;
                    testCases.push(tc(
                        schema,
                        `Should reject invalid ${this.getSchemaTypeName(propertySchema)} for '${currentPath}': ${invalidCase.description}`,
                        baseObject
                    ));
                }
            }
        }

        // Test cases for object-level validation
        testCases.push(tc(schema,
            "Should reject null instead of object",
            null
        ));

        testCases.push(tc(schema,
            "Should reject undefined instead of object",
            undefined
        ));

        testCases.push(tc(schema,
            "Should reject array instead of object",
            []
        ));

        testCases.push(tc(schema,
            "Should reject primitive instead of object",
            "not an object"
        ));

        // Add security test case
        const objectWithExtra = this.createValidObject(shape);
        objectWithExtra.isAdmin = true;
        testCases.push(tc(schema, "testing security: unexpected isAdmin field", objectWithExtra));

        return testCases.filter(tc => !tc.isValid);
    }

    private createValidObject(shape: z.ZodRawShape, excludeKey?: string): Record<string, any> {
        const obj: Record<string, any> = {};

        for (const [key, propertySchema] of Object.entries(shape)) {
            if (key === excludeKey || !this.isZodType(propertySchema)) continue;

            const validCases = this.valid(propertySchema);
            if (validCases.length > 0) {
                obj[key] = this.getRandomElement(validCases).value;
            }
        }

        return obj;
    }

    private getRandomElement<T>(array: T[]): T {
        return array[Math.floor(Math.random() * array.length)];
    }

    private isZodType(schema: unknown): schema is ZodType {
        return schema instanceof ZodType;
    }

    private getSchemaTypeName(schema: ZodType): string {
        const typeName = schema.constructor.name.replace('Zod', '').toLowerCase();
        return typeName === 'string' ? 'string value' :
            typeName === 'number' ? 'numeric value' :
                typeName === 'boolean' ? 'boolean value' :
                    typeName === 'date' ? 'date value' :
                        typeName;
    }
}