import { z } from "zod";
import { TestCase } from "./types";
import { ZGenerator } from "./registry";
import { tc } from "./testCaseUtils";

export class EnumGenerator implements ZGenerator<z.ZodEnum<[string, ...string[]]>> {
    valid(schema: z.ZodEnum<[string, ...string[]]>): TestCase[] {
        const testCases: TestCase[] = [];
        const enumValues = schema._def.values;

        // Generate a valid case for each enum value
        enumValues.forEach((value: string) => {
            testCases.push(tc(schema, `valid enum value: ${value}`, value));
        });

        return testCases;
    }

    invalid(schema: z.ZodEnum<[string, ...string[]]>): TestCase[] {
        const testCases: TestCase[] = [];
        const enumValues = schema._def.values;

        // Generate invalid cases
        testCases.push(tc(schema, "invalid: not a valid enum value", "invalid_enum_value"));
        testCases.push(tc(schema, "invalid: number instead of string", 123));
        testCases.push(tc(schema, "invalid: boolean instead of string", true));
        testCases.push(tc(schema, "invalid: object instead of string", {}));
        testCases.push(tc(schema, "invalid: array instead of string", []));

        // Generate an invalid case by using a string that's not in the enum
        const invalidString = this.generateInvalidEnumString(enumValues);
        testCases.push(tc(schema, "invalid: string not in enum", invalidString));

        return testCases;
    }

    private generateInvalidEnumString(enumValues: readonly string[]): string {
        const alphabet = 'abcdefghijklmnopqrstuvwxyz';
        let invalidString = '';
        do {
            invalidString = Array(10)
                .fill(null)
                .map(() => alphabet[Math.floor(Math.random() * alphabet.length)])
                .join('');
        } while (enumValues.includes(invalidString));
        return invalidString;
    }
}