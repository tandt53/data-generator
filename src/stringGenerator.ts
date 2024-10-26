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

        testCases.push(tc(schema, "Should reject a non-string (number)", 123));

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

        return testCases;
    }
}