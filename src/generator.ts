import { z, ZodNullable, ZodOptional, ZodType, ZodObject } from 'zod';
import { TestCase } from "./types";
import { GeneratorRegistry } from "./registry";
import { tc } from "./testCaseUtils";

export class TestCaseGenerator {
    constructor(private registry: GeneratorRegistry) {}

    valid(schema: ZodType): TestCase[] {
        if (schema instanceof ZodOptional) {
            return [
                tc(schema, "valid undefined for optional", undefined),
                ...this.valid(schema.unwrap())
            ];
        }

        if (schema instanceof ZodNullable) {
            return [
                tc(schema, "valid null for nullable", null),
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

    private validObject(schema: ZodObject<any>): TestCase[] {
        const testCases: TestCase[] = [];
        const shape = schema.shape;

        // Generate test cases for each field
        for (const [key, propertySchema] of Object.entries(shape)) {
            if (!this.isZodType(propertySchema)) continue;

            // Get valid cases for the current field
            const validCases = this.valid(propertySchema);

            // Create test cases with each valid value for this field
            for (const validCase of validCases) {
                const baseObject = this.createValidObject(shape, key);
                baseObject[key] = validCase.value;
                testCases.push(tc(
                    schema,
                    `testing ${key}: ${validCase.description}`,
                    baseObject
                ));
            }
        }

        // Add one case with random valid values
        testCases.push(tc(schema, "all fields with valid values", this.createValidObject(shape)));

        return testCases.filter(tc => tc.isValid);
    }

    private invalidObject(schema: ZodObject<any>): TestCase[] {
        const testCases: TestCase[] = [];
        const shape = schema.shape;

        // Generate invalid cases for each field
        for (const [key, propertySchema] of Object.entries(shape)) {
            if (!this.isZodType(propertySchema)) continue;

            if (!(propertySchema instanceof ZodOptional)) {
                // Test missing required field
                const missingObject = this.createValidObject(shape, key);
                testCases.push(tc(schema, `testing ${key}: missing required field`, missingObject));
            }

            // Test invalid values for field
            const invalidCases = this.invalid(propertySchema);
            for (const invalidCase of invalidCases) {
                const baseObject = this.createValidObject(shape, key);
                baseObject[key] = invalidCase.value;
                testCases.push(tc(
                    schema,
                    `testing ${key}: ${invalidCase.description}`,
                    baseObject
                ));
            }
        }

        // Add one case with an unexpected critical field
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
}