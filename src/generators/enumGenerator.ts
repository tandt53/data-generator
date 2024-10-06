
import {z} from "zod";
import {TestCase} from "../types";

export class EnumGenerator {
    // Method to generate valid test cases for a Zod enum
    public static generateValidCases(schema: z.ZodEnum<any>): TestCase[] {
        const testCases: TestCase[] = [];
        const enumValues = schema._def.values;

        // Generate valid cases using each enum value
        enumValues.forEach((value: any) => {
            testCases.push({
                description: `valid enum value: ${value}`,
                input: value,
                isValid: true
            });
        });

        return testCases;
    }

    // Method to generate invalid test cases for a Zod enum
    public static generateInvalidCases(schema: z.ZodEnum<any>): TestCase[] {
        const testCases: TestCase[] = [];
        const enumValues = schema._def.values;

        // Generate invalid cases using values that are not part of the enum
        const invalidValues = [
            "not-a-valid-enum", // A completely invalid string
            "VALUE3",           // Assuming the enum only has VALUE1 and VALUE2
            123,                // A number
            null,               // Null value
            undefined           // Undefined value
        ];

        // Add invalid cases
        invalidValues.forEach(value => {
            testCases.push({
                description: `invalid enum value: ${value}`,
                input: value,
                isValid: false
            });
        });

        return testCases;
    }
}