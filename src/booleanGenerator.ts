import { TestCase } from "./types";
import { ZGenerator } from "./registry";
import { z } from "zod";

export class BooleanGenerator implements ZGenerator<z.ZodBoolean> {
    valid(schema: z.ZodBoolean): TestCase[] {
        return [
            {
                description: `Should accept boolean true value`,
                value: true,
                isValid: true,
            },
            {
                description: `Should accept boolean false value`,
                value: false,
                isValid: true,
            },
        ];
    }

    invalid(schema: z.ZodBoolean): TestCase[] {
        return [
            {
                description: `Should reject string 'true' as invalid boolean`,
                value: "true",
                isValid: false,
            },
            {
                description: `Should reject string 'false' as invalid boolean`,
                value: "false",
                isValid: false,
            },
            {
                description: `Should reject number 1 as invalid boolean`,
                value: 1,
                isValid: false,
            },
            {
                description: `Should reject number 0 as invalid boolean`,
                value: 0,
                isValid: false,
            },
            // {
            //     description: `Should reject null as invalid boolean`,
            //     value: null,
            //     isValid: false,
            // },
            // {
            //     description: `Invalid boolean: undefined`,
            //     value: undefined,
            //     isValid: false,
            // },
            {
                description: `Should reject object value as invalid boolean`,
                value: {},
                isValid: false,
            },
            {
                description: `Should reject array value as invalid boolean`,
                value: [],
                isValid: false,
            },
            {
                description: `Should reject NaN as invalid boolean`,
                value: NaN,
                isValid: false,
            },
            {
                description: `Should reject number Infinity as invalid boolean`,
                value: Infinity,
                isValid: false,
            },
            {
                description: `Should reject number -Infinity as invalid boolean`,
                value: -Infinity,
                isValid: false,
            },
        ];
    }
}