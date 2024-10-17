import { TestCase } from "./types";
import { ZGenerator } from "./registry";
import { z } from "zod";

export class BooleanGenerator implements ZGenerator<z.ZodBoolean> {
    valid(schema: z.ZodBoolean): TestCase[] {
        return [
            {
                description: `Valid boolean: true`,
                value: true,
                isValid: true,
            },
            {
                description: `Valid boolean: false`,
                value: false,
                isValid: true,
            },
        ];
    }

    invalid(schema: z.ZodBoolean): TestCase[] {
        return [
            {
                description: `Invalid boolean: string "true"`,
                value: "true",
                isValid: false,
            },
            {
                description: `Invalid boolean: string "false"`,
                value: "false",
                isValid: false,
            },
            {
                description: `Invalid boolean: number 1`,
                value: 1,
                isValid: false,
            },
            {
                description: `Invalid boolean: number 0`,
                value: 0,
                isValid: false,
            },
            {
                description: `Invalid boolean: null`,
                value: null,
                isValid: false,
            },
            {
                description: `Invalid boolean: undefined`,
                value: undefined,
                isValid: false,
            },
            {
                description: `Invalid boolean: object`,
                value: {},
                isValid: false,
            },
            {
                description: `Invalid boolean: array`,
                value: [],
                isValid: false,
            },
            {
                description: `Invalid boolean: NaN`,
                value: NaN,
                isValid: false,
            },
            {
                description: `Invalid boolean: Infinity`,
                value: Infinity,
                isValid: false,
            },
            {
                description: `Invalid boolean: -Infinity`,
                value: -Infinity,
                isValid: false,
            },
        ];
    }
}