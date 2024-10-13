import {z, ZodType} from 'zod';
import {TestCase} from "./types";
import {GeneratorRegistry} from "./registry";

export class TestCaseGenerator {
    private registry: GeneratorRegistry;

    constructor(registry: GeneratorRegistry) {
        this.registry = registry;
    }

    valid(schema: ZodType): TestCase[] {
        const generator = this.registry.getGeneratorForSchema(schema);
        if (!generator) {
            throw new Error(`No generator found for schema type: ${schema.constructor.name}`);
        }
        return generator.valid(schema);
    }

    invalid(schema: ZodType): TestCase[] {
        const generator = this.registry.getGeneratorForSchema(schema);
        if (!generator) {
            throw new Error(`No generator found for schema type: ${schema.constructor.name}`);
        }
        return generator.invalid(schema);
    }
}



