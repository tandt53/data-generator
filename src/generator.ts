import {z, ZodNullable, ZodOptional, ZodType} from 'zod';
import {TestCase} from "./types";
import {GeneratorRegistry} from "./registry";
import {tc} from "./testCaseUtils";

export class TestCaseGenerator {
    private registry: GeneratorRegistry;

    constructor(registry: GeneratorRegistry) {
        this.registry = registry;
    }

    valid(schema: ZodType): TestCase[] {
        const testCases: TestCase[] = [];
        if (schema instanceof ZodOptional) {
            testCases.push(tc(schema, "valid undefined for optional", undefined));
            testCases.push(...this.valid(schema.unwrap()));
        } else if (schema instanceof ZodNullable) {
            testCases.push(tc(schema, "valid null for nullable", null));
            testCases.push(...this.valid(schema.unwrap()));
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

        const generator = this.registry.getGeneratorForSchema(schema);
        if (!generator) {
            throw new Error(`No generator found for schema type: ${schema.constructor.name}`);
        }

        return generator.invalid(schema);
    }

}



