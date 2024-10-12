import {TestCase} from "../types";
import {z, ZodType} from "zod";
import {EnumGenerator} from "./enumGenerator";
import {ZodEffectsGenerator} from "./zodEffectsGenerator";
import {StringGenerator} from "./stringGenerator";
import {NumberGenerator} from "./numberGenerator";
import {BooleanGenerator} from "./booleanGenerator";

export interface Generator<S, T> {
    valid(schema: S): T[];

    invalid(schema: S): T[];
}

export class TestCaseGenerator implements Generator<ZodType, TestCase> {

    valid(schema: ZodType): TestCase[] {
        console.log(schema.constructor.name);
        if (schema instanceof z.ZodString) {
            // if schema is ZodString, then add optional and nullable test cases after generating string test cases
            return StringGenerator.valid(schema);
        } else if (schema instanceof z.ZodNumber) {
            return NumberGenerator.valid(schema);
        } else if (schema instanceof z.ZodBoolean) {
            return BooleanGenerator.valid(schema)
        } else if (schema instanceof z.ZodDate) {
            // if schema is ZodDate, then add optional and nullable test cases after generating date test cases
            console.log('date');
        } else if (schema instanceof z.ZodArray) {
            // if schema is ZodArray, then add optional and nullable test cases after generating array test cases
            console.log('array');
        } else if (schema instanceof z.ZodObject) {
            // if schema is ZodObject, then add optional and nullable test cases after generating object test cases
            console.log('object');
        } else if (schema instanceof z.ZodOptional) {
            console.log('optional');
            // parseZodSchema(schema._def.innerType);
            this.valid(schema.unwrap());
        } else if (schema instanceof z.ZodNullable) {
            console.log('nullable');
            // parseZodSchema(schema._def.innerType);
            this.valid(schema.unwrap());
        } else if (schema instanceof z.ZodEffects) {
            return new ZodEffectsGenerator().valid(schema);
        } else if (schema instanceof z.ZodEnum) {
            return EnumGenerator.valid(schema);
        }
        return [];
    }

    invalid(schema: ZodType): TestCase[] {
        if (schema instanceof z.ZodString) {
            return StringGenerator.invalid(schema);
        } else if (schema instanceof z.ZodNumber) {
            return NumberGenerator.invalid(schema);
        } else if (schema instanceof z.ZodBoolean) {
            return BooleanGenerator.invalid(schema);
        } else if (schema instanceof z.ZodDate) {
            console.log('date');
        } else if (schema instanceof z.ZodArray) {
            console.log('array');
        } else if (schema instanceof z.ZodObject) {
            console.log('object');
        } else if (schema instanceof z.ZodOptional) {
            console.log('optional');
            this.invalid(schema.unwrap());
        } else if (schema instanceof z.ZodNullable) {
            console.log('nullable');
            this.invalid(schema.unwrap());
        } else if (schema instanceof z.ZodEffects) {
            return new ZodEffectsGenerator().invalid(schema);
        } else if (schema instanceof z.ZodEnum) {
            return EnumGenerator.invalid(schema);
        }
        return [];
    }
}