import {z} from "zod";
import {TestCase} from "./types";
import {ZGenerator} from "./registry";
import {addTestCase, addValidTestCase} from "./testCaseUtils";

export class NumberGenerator implements ZGenerator<z.ZodNumber> {
    valid(schema: z.ZodNumber): TestCase[] {
        const testCases: TestCase[] = [];
        const checks = schema._def.checks;

        const isInt = checks.some(check => check.kind === "int");
        const isFinite = checks.some(check => check.kind === "finite");
        let min = -Infinity;
        let max = Infinity;
        let multipleOf: number | undefined;

        for (const check of checks) {
            switch (check.kind) {
                case "min":
                    min = check.value;
                    break;
                case "max":
                    max = check.value;
                    break;
                case "multipleOf":
                    multipleOf = check.value;
                    break;
            }
        }

        addValidTestCase(schema, testCases, "valid number within range",
            this.generateValidNumber(min, max, isInt, multipleOf));

        if (isFinite) {
            addValidTestCase(schema, testCases, "valid finite number", 1000000);
        }

        if (min !== -Infinity) {
            addValidTestCase(schema, testCases, `valid number equals to minimum`, min);
        }
        if (max !== Infinity) {
            addValidTestCase(schema, testCases, `valid number equals to maximum`, max);
        }

        if (min !== max) {
            const midpoint = (min + max) / 2;
            addValidTestCase(schema, testCases, `valid number (midpoint)`,
                isInt ? Math.floor(midpoint) : midpoint);

            if (!isInt) {
                addValidTestCase(schema, testCases, `valid floating number (near min)`,
                    this.roundToTwoDecimals(min + 0.01));
                addValidTestCase(schema, testCases, `valid floating number (near max)`,
                    this.roundToTwoDecimals(max - 0.01));
            }
        }

        if (multipleOf !== undefined) {
            addValidTestCase(schema, testCases, `valid number (multiple of ${multipleOf})`,
                this.generateValidMultipleOf(min, max, multipleOf, isInt));
        }

        return testCases;
    }

    invalid(schema: z.ZodNumber): TestCase[] {
        const testCases: TestCase[] = [];
        const checks = schema._def.checks;

        const isInt = checks.some(check => check.kind === "int");
        const isFinite = checks.some(check => check.kind === "finite");
        let min = -Infinity;
        let max = Infinity;
        let multipleOf: number | undefined;

        for (const check of checks) {
            switch (check.kind) {
                case "min":
                    min = check.value;
                    break;
                case "max":
                    max = check.value;
                    break;
                case "multipleOf":
                    multipleOf = check.value;
                    break;
            }
        }

        addTestCase(schema, testCases, "invalid string", "not-a-number");
        addTestCase(schema, testCases, "invalid boolean", true);
        addTestCase(schema, testCases, "invalid array", [1, 2, 3]);
        addTestCase(schema, testCases, "invalid object", {value: 1});
        addTestCase(schema, testCases, "invalid null", null);
        addTestCase(schema, testCases, "invalid undefined", undefined);

        if (isFinite) {
            addTestCase(schema, testCases, "invalid Infinity", Infinity);
            addTestCase(schema, testCases, "invalid -Infinity", -Infinity);
            addTestCase(schema, testCases, "invalid NaN", NaN);
        }

        if (isInt) {
            addTestCase(schema, testCases, "invalid float", 1.5);
        }

        if (min !== -Infinity) {
            addTestCase(schema, testCases, `invalid number less than minimum`,
                this.roundToTwoDecimals(min - 1));
        }

        if (max !== Infinity) {
            addTestCase(schema, testCases, `invalid number greater than maximum`,
                this.roundToTwoDecimals(max + 1));
        }

        if (multipleOf !== undefined) {
            addTestCase(schema, testCases, `invalid number (not multiple of ${multipleOf})`,
                this.generateInvalidMultipleOf(min, max, multipleOf, isInt));
        }

        return testCases;
    }

    private generateValidNumber(min: number, max: number, isInt: boolean, multipleOf?: number): number {
        let value: number;
        do {
            if (min === -Infinity && max === Infinity) {
                // Generate a random number between -1e10 and 1e10
                value = Math.random() * 2e10 - 1e10;
            } else if (min === -Infinity) {
                // Generate a number less than max
                value = max - Math.random() * 1e10;
            } else if (max === Infinity) {
                // Generate a number greater than min
                value = min + Math.random() * 1e10;
            } else {
                value = Math.random() * (max - min) + min;
            }

            if (isInt) {
                value = Math.floor(value);
            } else {
                value = this.roundToTwoDecimals(value);
            }
        } while (multipleOf !== undefined && value % multipleOf !== 0);
        return value;
    }

    private generateValidMultipleOf(min: number, max: number, multipleOf: number, isInt: boolean): number {
        let minMultiple: number, maxMultiple: number;

        if (min === -Infinity) {
            minMultiple = Math.floor(-1e10 / multipleOf) * multipleOf;
        } else {
            minMultiple = Math.ceil(min / multipleOf) * multipleOf;
        }

        if (max === Infinity) {
            maxMultiple = Math.floor(1e10 / multipleOf) * multipleOf;
        } else {
            maxMultiple = Math.floor(max / multipleOf) * multipleOf;
        }

        let value = minMultiple + Math.floor(Math.random() * ((maxMultiple - minMultiple) / multipleOf + 1)) * multipleOf;
        return isInt ? Math.floor(value) : this.roundToTwoDecimals(value);
    }

    private generateInvalidMultipleOf(min: number, max: number, multipleOf: number, isInt: boolean): number {
        let value: number;
        do {
            value = this.generateValidNumber(min, max, isInt);
        } while (value % multipleOf === 0);
        return value;
    }

    private roundToTwoDecimals(num: number): number {
        return Math.round((num + Number.EPSILON) * 100) / 100;
    }
}