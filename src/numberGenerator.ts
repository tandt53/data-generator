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

        testCases.push(tc(schema, "Should accept number within valid range",
            this.generateValidNumber(min, max, isInt, multipleOf)));

        if (isFinite) {
            testCases.push(tc(schema, "Should accept finite number within safe integer range", 1000000));
        }

        if (min !== -Infinity) {
            testCases.push(tc(schema, `Should accept number equal to minimum`, min));
        }
        if (max !== Infinity) {
            testCases.push(tc(schema, `Should accept number equal to maximum`, max));
        }

        if (min !== max) {
            let midpoint: number;
            if (min === -Infinity && max === Infinity) {
                midpoint = 0;
            } else if (min === -Infinity) {
                midpoint = max - 1;
            } else if (max === Infinity) {
                midpoint = min + 1;
            } else {
                midpoint = (min + max) / 2;
            }
            testCases.push(tc(schema, `Should accept number (midpoint)`,
                isInt ? Math.floor(midpoint) : midpoint));

            if (!isInt) {
                testCases.push(tc(schema, `Should accept floating number (near min)`,
                    this.roundToTwoDecimals(min + 0.01)));
                testCases.push(tc(schema, `Should accept floating number (near max)`,
                    this.roundToTwoDecimals(max - 0.01)));
            }
        }

        if (multipleOf !== undefined) {
            testCases.push(tc(schema, `Should accept number that is multiple of ${multipleOf} within range`,
                this.generateValidMultipleOf(min, max, multipleOf, isInt)));
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

        testCases.push(tc(schema, "Should reject string as invalid number", "not-a-number"));
        testCases.push(tc(schema, "Should reject boolean as invalid number", true));
        testCases.push(tc(schema, "Should reject array as invalid number", [1, 2, 3]));
        testCases.push(tc(schema, "Should reject object as invalid number", {value: 1}));

        if (isFinite) {
            testCases.push(tc(schema, "Should reject Infinity as invalid number", Infinity));
            testCases.push(tc(schema, "Should reject -Infinity as invalid number", -Infinity));
            testCases.push(tc(schema, "Should reject NaN as invalid number", NaN));
        }

        if (isInt) {
            testCases.push(tc(schema, "Should reject float as invalid number", 1.5));
        }

        if (min !== -Infinity) {
            testCases.push(tc(schema, `Should reject number less than minimum`,
                this.roundToTwoDecimals(min - 1)));
        }

        if (max !== Infinity) {
            testCases.push(tc(schema, `should reject number greater than maximum`,
                this.roundToTwoDecimals(max + 1)));
        }

        if (multipleOf !== undefined) {
            testCases.push(tc(schema, `Should reject number (not multiple of ${multipleOf})`,
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