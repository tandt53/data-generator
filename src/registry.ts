import {ZodType} from "zod";
import {TestCase} from "../types";
import {StringGenerator} from "./stringGenerator";
import {NumberGenerator} from "./numberGenerator";
import {BooleanGenerator} from "./booleanGenerator";

export interface ZGenerator<T extends ZodType = ZodType, S = TestCase> {
    valid: (schema: T) => S[];
    invalid: (schema: T) => S[];
}

export class GeneratorRegistry {
    private generators = new Map<string, ZGenerator<ZodType>>();

    register<T extends ZodType>(key: string, generator: ZGenerator<T>): void {
        this.generators.set(key, generator as ZGenerator<ZodType>);
    }

    get(key: string): ZGenerator<ZodType> | undefined {
        return this.generators.get(key);
    }

    getGeneratorForSchema(schema: ZodType): ZGenerator<ZodType> | undefined {
        const schemaType = schema.constructor.name;
        return this.generators.get(schemaType);
    }
}


export class DefaultGeneratorRegistry extends GeneratorRegistry {
    constructor() {
        super();
        this.register('ZodString', new StringGenerator());
        this.register('ZodNumber', new NumberGenerator());
        this.register('ZodBoolean', new BooleanGenerator());
        // this.register('zDate', new DateGenerator());
        // this.register('ZodArray', new ArrayGenerator());
        // this.register('ZodObject', new ObjectGenerator());
        // this.register('ZodOptional', new OptionalGenerator());
        // this.register('ZodNullable', new NullableGenerator());
        // this.register('ZodEffects', new EffectsGenerator());
        // this.register('ZodEnum', new EnumGenerator());
    }
}