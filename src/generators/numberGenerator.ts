import {z} from "zod";
import {TestCase} from "../types";
import {faker} from "@faker-js/faker";
import {isValid} from "date-fns";

export class NumberGenerator {

    // support generate floating number with 2 decimal places
    public static valid(schema: z.ZodNumber): TestCase[] {
        const testCases: TestCase[] = [];
        const checks = schema._def.checks;

        // Determine if the schema is for integers or floats
        const isInt = checks.some(check => check.kind === "int");
        const isFinite = checks.some(check => check.kind === "finite");
        let min = -Infinity;
        let max = Infinity;

        // Extract min and max values from checks
        for (const check of checks) {
            switch (check.kind) {
                case "min":
                    min = check.value;
                    break;
                case "max":
                    max = check.value;
                    break;
            }
        }

        // Handle infinite cases if finite is defined
        if (isFinite) {
            testCases.push({
                description: "invalid infinite number",
                input: Infinity,
                isValid: false
            });
            testCases.push({
                description: "invalid negative infinite number",
                input: -Infinity,
                isValid: false
            });
            testCases.push({
                description: "invalid NaN",
                input: NaN,
                isValid: false
            });
        }

        if (min === -Infinity && max === Infinity) {
            // nothing to do
        } else {
            if (min !== -Infinity) {
                testCases.push({
                    description: `valid number equals to minimum`,
                    input: min,
                    isValid: true
                });
            }
            if (max !== Infinity) {
                testCases.push({
                    description: `valid number equals to maximum`,
                    input: max,
                    isValid: true
                });
            }
            if (min !== max - 1) {
                testCases.push({
                    description: `valid number (min+1)`,
                    input: min + 1,
                    isValid: true
                });
                testCases.push({
                    description: `valid number (max-1)`,
                    input: max - 1,
                    isValid: true
                });

                if (!isInt) {
                    testCases.push({
                        description: `valid floating number (min + 0.01)`,
                        input: min + 0.01,
                        isValid: true
                    })
                    testCases.push({
                        description: `valid floating number (max-0.01)`,
                        input: max - 0.01,
                        isValid: true
                    })
                }
            }

        }

        return testCases;
    }

    public static invalid(schema: z.ZodNumber): TestCase[] {
        const testCases: TestCase[] = [];
        const checks = schema._def.checks;

        // Generate invalid cases
        testCases.push({description: "invalid string", input: "not-a-number", isValid: false});
        testCases.push({description: "invalid boolean", input: true, isValid: false});
        testCases.push({description: "invalid array", input: [1, 2, 3], isValid: false});
        testCases.push({description: "invalid object", input: {value: 1}, isValid: false});
        testCases.push({description: "invalid null", input: null, isValid: false}); //TODO: this should be checked with ZodNullable
        testCases.push({description: "invalid undefined", input: undefined, isValid: false}); // TODO: this should be checked with ZodOptional

        // Determine if the schema is for integers or floats
        const isInt = checks.some(check => check.kind === "int");
        const isFinite = checks.some(check => check.kind === "finite");
        let min = -Infinity;
        let max = Infinity;

        // Extract min and max values from checks
        for (const check of checks) {
            switch (check.kind) {
                case "min":
                    min = check.value;
                    break;
                case "max":
                    max = check.value;
                    break;
            }
        }

        if (min === -Infinity && max === Infinity) {
            // nothing to do
        } else {
            if (min !== -Infinity) {
                testCases.push({
                    description: `invalid number less than minimum (${min})`,
                    input: min - 1,
                    isValid: false
                });
                if (!isInt) {
                    testCases.push({
                        description: `invalid floating number less than minimum (${min})`,
                        input: min - 0.01,
                        isValid: false
                    });
                }
            }
            if (max !== Infinity) {
                testCases.push({
                    description: `invalid number greater than maximum (${max})`,
                    input: max + 1,
                    isValid: false
                });
                if (!isInt) {
                    testCases.push({
                        description: `invalid floating number greater than maximum (${max})`,
                        input: max + 0.01,
                        isValid: false
                    });
                }
            }

        }

        return testCases;
    }

}

