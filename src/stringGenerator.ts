import {z} from "zod";
import {TestCase} from "./types";
import {faker} from "@faker-js/faker";
import {createId} from '@paralleldrive/cuid2';
import {ulid} from 'ulid';
import RandExp from "randexp";
import {ZGenerator} from "./registry";
import {tc} from "./testCaseUtils";

export class StringGenerator implements ZGenerator<z.ZodString> {

    valid(schema: z.ZodString): TestCase[] {
        const testCases: TestCase[] = [];
        const checks = schema._def.checks;
        let min = -1;
        let max = Number.MAX_SAFE_INTEGER;
        let isEmail = false;
        let isUrl = false;
        let isUuid = false;
        let isEmoji = false;
        let isNanoid = false;
        let isCuid = false;
        let isCuid2 = false;
        let isUlid = false;
        let isBase64 = false;
        let isIp = false;
        let isDatetime = false;
        let isDate = false;
        let isTime = false;
        let regex: RegExp | null = null;
        let startsWith = "";
        let endsWith = "";

        for (const check of checks) {
            switch (check.kind) {
                case "datetime":
                    testCases.push(...this.generateValidDatetimeCases(schema));
                    return testCases;
                case "date":
                    testCases.push(...this.generateValidDateCases(schema));
                    return testCases;
                case "time":
                    testCases.push(...this.generateValidTimeCases(schema));
                    return testCases;
                case "min":
                    min = check.value;
                    break;
                case "max":
                    max = check.value;
                    break;
                case "length":
                    min = max = check.value;
                    break;
                case "email":
                    isEmail = true;
                    break;
                case "url":
                    isUrl = true;
                    break;
                case "uuid":
                    isUuid = true;
                    break;
                case "emoji":
                    isEmoji = true;
                    break;
                case "cuid":
                    isCuid = true;
                    break;
                case "cuid2":
                    isCuid2 = true;
                    break;
                case "ulid":
                    isUlid = true;
                    break;
                case "regex":
                    regex = check.regex;
                    break;
                case "startsWith":
                    startsWith = check.value;
                    break;
                case "endsWith":
                    endsWith = check.value;
                    break;
                // Add other checks as needed
            }
        }

        if (isEmail) {
            testCases.push(tc(schema, "Should accept a valid email", faker.internet.email()));
        } else if (isUrl) {
            testCases.push(tc(schema, "Should accept a valid URL", faker.internet.url()));
        } else if (isUuid) {
            testCases.push(tc(schema, "Should accept a valid UUID", faker.string.uuid()));
        } else if (isEmoji) {
            testCases.push(tc(schema, "Should accept a valid emoji", faker.internet.emoji()));
        } else if (isCuid) {
            testCases.push(tc(schema, "Should accept a valid cuid", createId()));
        } else if (isCuid2) {
            testCases.push(tc(schema, "Should accept a valid cuid2", createId()));
        } else if (isUlid) {
            testCases.push(tc(schema, "Should accept a valid ulid", ulid()));
        } else if (regex) {
            try {
                const randexp = new RandExp(regex);
                randexp.max = Math.min(20, max);
                const validInput = randexp.gen();
                testCases.push(tc(schema, `Should accept valid regex match for ${regex}`, validInput));
            } catch (error) {
                console.warn(`Unable to generate valid regex match for ${regex}`);
            }
        } else {
            let input = faker.string.alpha({
                length: Math.max(min, Math.min(faker.number.int({min, max}), 20))
            });
            if (startsWith) input = startsWith + input;
            if (endsWith) input = input.slice(0, -endsWith.length) + endsWith;
            testCases.push(tc(schema, `Should accept a valid string`, input));
        }

        return testCases;
    }

    invalid(schema: z.ZodString): TestCase[] {
        const testCases: TestCase[] = [];
        const checks = schema._def.checks;

        let min = -1;
        let max = Number.MAX_SAFE_INTEGER;
        let isEmail = false;
        let isUrl = false;
        let isUuid = false;
        let isEmoji = false;
        let isCuid = false;
        let isCuid2 = false;
        let isUlid = false;
        let regex: RegExp | null = null;
        let startsWith = "";
        let endsWith = "";

        for (const check of checks) {
            switch (check.kind) {
                case "datetime":
                    testCases.push(...this.generateInvalidDatetimeCases(schema));
                    break;
                case "date":
                    testCases.push(...this.generateInvalidDateCases(schema));
                    break;
                case "time":
                    testCases.push(...this.generateInvalidTimeCases(schema));
                    break;
                case "min":
                    min = check.value;
                    break;
                case "max":
                    max = check.value;
                    break;
                case "length":
                    min = max = check.value;
                    break;
                case "email":
                    isEmail = true;
                    break;
                case "url":
                    isUrl = true;
                    break;
                case "uuid":
                    isUuid = true;
                    break;
                case "emoji":
                    isEmoji = true;
                    break;
                case "cuid":
                    isCuid = true;
                    break;
                case "cuid2":
                    isCuid2 = true;
                    break;
                case "ulid":
                    isUlid = true;
                    break;
                case "regex":
                    regex = check.regex;
                    break;
                case "startsWith":
                    startsWith = check.value;
                    break;
                case "endsWith":
                    endsWith = check.value;
                    break;
                // Add other checks as needed
            }
        }

        // testCases.push(tc(schema, "Should reject a non-string (number)", 123));

        if (isEmail) {
            testCases.push(tc(schema, "Should reject an invalid email", "not-an-email"));
        } else if (isUrl) {
            testCases.push(tc(schema, "Should reject an invalid URL", "not-a-url"));
        } else if (isUuid) {
            testCases.push(tc(schema, "Should reject an invalid UUID", "not-a-uuid"));
        } else if (isEmoji) {
            testCases.push(tc(schema, "Should reject an invalid emoji", "not-an-emoji"));
        } else if (isCuid || isCuid2 || isUlid) {
            testCases.push(tc(schema, "Should reject an invalid ID", "invalid-id"));
        } else if (regex) {
            let invalidInput = '';
            do {
                invalidInput = faker.string.sample({min, max: Math.min(20, max)});
            } while (regex.test(invalidInput));
            testCases.push(tc(schema, `Should reject invalid string that is not matched with regex ${regex}`, invalidInput));
        } else {
            if (min > 0) {
                testCases.push(tc(schema, `Should reject a string that is too short (length < ${min})`,
                    faker.string.alpha(Math.max(0, min - 1))));
            }
            if (max < Number.MAX_SAFE_INTEGER) {
                testCases.push(tc(schema, `Should reject a string that is too long (length > ${max})`,
                    faker.string.alpha(max + 1)));
            }
            if (startsWith) {
                testCases.push(tc(schema, `Should reject a string that does not start with "${startsWith}"`,
                    "x" + faker.string.alpha()));
            }
            if (endsWith) {
                testCases.push(tc(schema, `Should reject a string that does not end with "${endsWith}"`,
                    faker.string.alpha() + "x"));
            }
        }

        // Add common invalid type cases
        testCases.push(...this.generateCommonInvalidCases(schema));
        return testCases;
    }

    private generateValidDatetimeCases(schema: z.ZodString): TestCase[] {
        const now = new Date();
        return [
            tc(schema, "Should accept current datetime", now.toISOString()),
            tc(schema, "Should accept start of year", new Date(now.getFullYear(), 0, 1).toISOString()),
            tc(schema, "Should accept end of year", new Date(now.getFullYear(), 11, 31, 23, 59, 59).toISOString()),
            tc(schema, "Should accept datetime with milliseconds", new Date(now.getTime() + 123).toISOString())
        ];
    }

    private generateInvalidDatetimeCases(schema: z.ZodString): TestCase[] {
        return [
            tc(schema, "Should reject datetime without timezone => 2024-01-01T00:00:00",
                "2024-01-01T00:00:00"),
            tc(schema, "Should reject datetime with invalid month => 2024-13-01T00:00:00Z",
                "2024-13-01T00:00:00Z"),
            tc(schema, "Should reject datetime with invalid day => 2024-01-32T00:00:00Z",
                "2024-01-32T00:00:00Z"),
            tc(schema, "Should reject datetime with invalid hour => 2024-01-01T24:00:00Z",
                "2024-01-01T24:00:00Z"),
            tc(schema, "Should reject datetime with wrong separator => 2024-01-01 00:00:00Z",
                "2024-01-01 00:00:00Z")
        ];
    }

    private generateValidDateCases(schema: z.ZodString): TestCase[] {
        const now = new Date();
        return [
            tc(schema, "Should accept current date", now.toISOString().split('T')[0]),
            tc(schema, "Should accept start of year", new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0]),
            tc(schema, "Should accept end of year", new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0]),
            tc(schema, "Should accept leap year date", new Date(2024, 1, 29).toISOString().split('T')[0]), // Leap year
            tc(schema, "Should accept middle of year", new Date(now.getFullYear(), 6, 15).toISOString().split('T')[0]) // July 15
        ];
    }

    private generateInvalidDateCases(schema: z.ZodString): TestCase[] {
        const curDate = new Date()
        const years = curDate.getFullYear();
        const months = curDate.getMonth() + 1;
        const days = curDate.getDate();
        const invalidMonth = 13;
        const invalidDay = 32;
        return [
            tc(schema, `Should reject date with invalid month => ${years}-${invalidMonth}-${days}`,
                `${years}-${invalidMonth}-${days}`),
            tc(schema, `Should reject date with invalid day => ${years}-${months}-${invalidDay}`,
                `${years}-${months}-${invalidDay}`),
            tc(schema, "Should reject non-leap year date => 2023-02-29",
                "2023-02-29"),
            tc(schema, `Should reject date without hyphens => ${years}${months}${days}`,
                `${years}${months}${days}`),
            tc(schema, `Should reject date with wrong separator => ${years}/${months}/${days}`,
                `${years}/${months}/${days}`)
        ];
    }

    private generateValidTimeCases(schema: z.ZodString): TestCase[] {
        return [
            tc(schema, "Should accept current time", new Date().toTimeString().split(' ')[0]), // HH:mm:ss
            tc(schema, "Should accept midnight", "00:00:00"),
            tc(schema, "Should accept noon", "12:00:00"),
            tc(schema, "Should accept end of day", "23:59:59"),
            tc(schema, "Should accept time with specific seconds", "15:30:45") // Example time
        ];
    }

    private generateInvalidTimeCases(schema: z.ZodString): TestCase[] {
        return [
            tc(schema, "Should reject time with invalid hour => 24:00:00",
                "24:00:00"),
            tc(schema, "Should reject time with invalid minute => 12:60:00",
                "12:60:00"),
            tc(schema, "Should reject time with invalid second => 12:00:60",
                "12:00:60"),
            tc(schema, "Should reject time without seconds => 12:00",
                "12:00"),
            tc(schema, "Should reject time with wrong separator => 12.00.00",
                "12.00.00")
        ];
    }

    private generateCommonInvalidCases(schema: z.ZodString): TestCase[] {
        return [
            tc(schema, "Should reject number instead of string", 123),
            tc(schema, "Should reject boolean instead of string", true),
            tc(schema, "Should reject object instead of string", {}),
            tc(schema, "Should reject array instead of string", [])
        ];
    }
}
