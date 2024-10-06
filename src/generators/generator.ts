import {TestCase} from "../types";
import {z, ZodType} from "zod";
import {EnumGenerator} from "./enumGenerator";
import {ZodEffectsGenerator} from "./zodEffectsGenerator";
import {StringGenerator} from "./stringGenerator";
import {NumberGenerator} from "./numberGenerator";

export interface Generator<S, T> {
    valid(schema: S): T[];

    invalid(schema: S): T[];
}

export class TestCaseGenerator implements Generator<ZodType, TestCase> {

    valid(schema: ZodType): TestCase[] {
        if (schema instanceof z.ZodString) {
            // if schema is ZodString, then add optional and nullable test cases after generating string test cases
            return StringGenerator.valid(schema);
        } else if (schema instanceof z.ZodNumber) {
            return NumberGenerator.valid(schema);
            console.log('number');
        } else if (schema instanceof z.ZodBoolean) {
            // if schema is ZodBoolean, then add optional and nullable test cases after generating boolean test cases
            console.log('boolean');
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
        }
        return [];
    }

    invalid(schema: ZodType): TestCase[] {
        if (schema instanceof z.ZodString) {
            console.log('string');
        } else if (schema instanceof z.ZodNumber) {
            console.log('number');
        } else if (schema instanceof z.ZodBoolean) {
            console.log('boolean');
        } else if (schema instanceof z.ZodDate) {
            console.log('date');
        } else if (schema instanceof z.ZodArray) {
            console.log('array');
        } else if (schema instanceof z.ZodObject) {
            console.log('object');
        } else if (schema instanceof z.ZodOptional) {
            console.log('optional');
            // parseZodSchema(schema._def.innerType);
            this.invalid(schema.unwrap());
        } else if (schema instanceof z.ZodNullable) {
            console.log('nullable');
            // parseZodSchema(schema._def.innerType);
            this.invalid(schema.unwrap());
        } else if (schema instanceof z.ZodEffects) {
            console.log('effects');
            this.invalid(schema._def.schema);
            // parseZodSchema(schema.unwrap());
        } else if (schema instanceof z.ZodEnum) {
            console.log('enum');
            return EnumGenerator.generateValidCases(schema);
        }
        return [];
    }
}