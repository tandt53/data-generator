import {z} from "zod";
import {TestCase} from "./types";
import {ZGenerator} from "./registry";
import {tc} from "./testCaseUtils";

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

        tc(schema, "valid number within range",
            this.generateValidNumber(min, max, isInt, multipleOf));

        if (isFinite) {
            tc(schema, "valid finite number", 1000000);
        }

        if (min !== -Infinity) {
            tc(schema, `valid number equals to minimum`, min);
        }
        if (max !== Infinity) {
            tc(schema, `valid number equals to maximum`, max);
        }

        if (min !== max) {
            const midpoint = (min + max) / 2;
            tc(schema, `valid number (midpoint)`,
                isInt ? Math.floor(midpoint) : midpoint);

            if (!isInt) {
                tc(schema, `valid floating number (near min)`,
                    this.roundToTwoDecimals(min + 0.01));
                tc(schema, `valid floating number (near max)`,
                    this.roundToTwoDecimals(max - 0.01));
            }
        }

        if (multipleOf !== undefined) {
            tc(schema, `valid number (multiple of ${multipleOf})`,
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

        testCases.push(tc(schema, "invalid string", "not-a-number"));
        testCases.push(tc(schema, "invalid boolean", true));
        testCases.push(tc(schema, "invalid array", [1, 2, 3]));
        testCases.push(tc(schema, "invalid object", {value: 1}));
        testCases.push(tc(schema, "invalid null", null));
        testCases.push(tc(schema, "invalid undefined", undefined));

        if (isFinite) {
            testCases.push(tc(schema, "invalid Infinity", Infinity));
            testCases.push(tc(schema, "invalid -Infinity", -Infinity));
            testCases.push(tc(schema, "invalid NaN", NaN));
        }

        if (isInt) {
            testCases.push(tc(schema, "invalid float", 1.5));
        }

        if (min !== -Infinity) {
            testCases.push(tc(schema, `invalid number less than minimum`,
                this.roundToTwoDecimals(min - 1)));
        }

        if (max !== Infinity) {
            testCases.push(tc(schema, `invalid number greater than maximum`,
                this.roundToTwoDecimals(max + 1)));
        }

        if (multipleOf !== undefined) {
            testCases.push(tc(schema, `invalid number (not multiple of ${multipleOf})`,
                this.generateInvalidMultipleOf(min, max, multipleOf, true))); // fixed isInt to true
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