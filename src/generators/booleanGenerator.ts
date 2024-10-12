import {TestCase} from "../types";

export class BooleanGenerator {
    static valid(schema: any): TestCase[] {
        return [
            {
                description: `Valid boolean: true`,
                input: true,
                isValid: true,
            },
            {
                description: `Valid boolean: false`,
                input: false,
                isValid: true,
            },
        ];
    }

    static invalid(schema: any): TestCase[] {
        return [
            {
                description: `Invalid boolean: string "true"`,
                input: "true",
                isValid: false,
            },
            {
                description: `Invalid boolean: string "false"`,
                input: "false",
                isValid: false,
            },
            {
                description: `Invalid boolean: number 1`,
                input: 1,
                isValid: false,
            },
            {
                description: `Invalid boolean: number 0`,
                input: 0,
                isValid: false,
            },
            {
                description: `Invalid boolean: null`,
                input: null,
                isValid: false,
            },
            {
                description: `Invalid boolean: undefined`,
                input: undefined,
                isValid: false,
            },
            {
                description: `Invalid boolean: object`,
                input: {},
                isValid: false,
            },
            {
                description: `Invalid boolean: array`,
                input: [],
                isValid: false,
            },
            {
                description: `Invalid boolean: NaN`,
                input: NaN,
                isValid: false,
            },
            {
                description: `Invalid boolean: Infinity`,
                input: Infinity,
                isValid: false,
            },
            {
                description: `Invalid boolean: -Infinity`,
                input: -Infinity,
                isValid: false,
            },
        ];
    }
}