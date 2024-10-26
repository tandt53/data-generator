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
            testCases.push(tc(schema, `Should accept a valid enum value: ${value}`, value));
        });

        return testCases;
    }

    invalid(schema: z.ZodEnum<[string, ...string[]]>): TestCase[] {
        const testCases: TestCase[] = [];
        const enumValues = schema._def.values;

        // Generate invalid cases
        testCases.push(tc(schema, "Should reject value not present in enum definition", "invalid_enum_value"));
        testCases.push(tc(schema, "Should reject number type when enum expects string", 123));
        testCases.push(tc(schema, "Should reject boolean type when enum expects string", true));
        testCases.push(tc(schema, "Should reject object type when enum expects string", {}));
        testCases.push(tc(schema, "Should reject array type when enum expects string", []));

        // Generate an invalid case by using a string that's not in the enum
        const invalidString = this.generateInvalidEnumString(enumValues);
        testCases.push(tc(schema, "Should reject a string that is not present in enum definition", invalidString));

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