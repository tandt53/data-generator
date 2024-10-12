import {z, ZodString} from "zod";
import {TestCase} from "../types";
import {faker} from "@faker-js/faker";
import {createId} from '@paralleldrive/cuid2';
import {ulid} from 'ulid';
import RandExp from "randexp";


export class StringGenerator {

    public static valid(schema: ZodString): TestCase[] {
        const testCases: TestCase[] = [];
        const checks = this.getSchemaChecks(schema);
        let min = -1;
        let max = Number.MAX_SAFE_INTEGER;
        let isEmail = false;
        let isUrl = false;
        let isUuid = false;
        let isEmoji = false;
        let isNanoid = false;
        let isCuid = false;
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
                case "nanoid":
                    isNanoid = true;
                    break;
                case "cuid":
                    isCuid = true;
                    break;
                case "ulid":
                    isUlid = true;
                    break;
                case "base64":
                    isBase64 = true;
                    break;
                case "ip":
                    isIp = true;
                    break;
                case "datetime":
                    isDatetime = true;
                    break;
                case "date":
                    isDate = true;
                    break;
                case "time":
                    isTime = true;
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
            }
        }

        if (isEmail) {
            testCases.push({description: "valid email", input: faker.internet.email(), isValid: true});
        } else if (isUrl) {
            testCases.push({description: "valid URL", input: faker.internet.url(), isValid: true});
        } else if (isUuid) {
            testCases.push({description: "valid UUID", input: faker.string.uuid(), isValid: true});
        } else if (isEmoji) {
            testCases.push({description: "valid emoji", input: faker.internet.emoji(), isValid: true});
        } else if (isNanoid) {
            testCases.push({description: "valid nanoid", input: faker.string.nanoid(), isValid: true});
        } else if (isCuid) {
            testCases.push({description: "valid cuid2", input: createId(), isValid: true});
        } else if (isUlid) {
            testCases.push({description: "valid ulid", input: ulid(), isValid: true});
        } else if (isBase64) {
            testCases.push({description: "valid base64", input: btoa("Hello, World!"), isValid: true});
        } else if (isIp) {
            testCases.push({description: "valid IP", input: faker.internet.ip(), isValid: true});
        } else if (isDatetime) {
            testCases.push({
                description: "valid datetime",
                input: faker.date.recent().toISOString(),
                isValid: true
            });
        } else if (isDate) {
            testCases.push({
                description: "valid date",
                input: faker.date.recent().toISOString().split('T')[0],
                isValid: true
            });
        } else if (isTime) {
            testCases.push({
                description: "valid time",
                input: faker.date.recent().toISOString().split('T')[1].split('.')[0],
                isValid: true
            });
        } else if (regex) {
            try {
                const randexp = new RandExp(regex);
                randexp.max = Math.min(20, max); // Limit the length of generated strings
                const validInput = randexp.gen();
                testCases.push({
                    description: `valid regex match for ${regex}`,
                    input: validInput,
                    isValid: true
                });
            } catch (error) {
                testCases.push({
                    description: `unable to generate valid regex match for ${regex}`,
                    input: "regex_generation_failed",
                    isValid: true
                });
            }
        } else {
            let input = faker.string.alpha({
                length: Math.max(min, Math.min(faker.number.int({
                    min: min,
                    max: max
                }), 20))
            });
            if (startsWith) input = startsWith + input;
            if (endsWith) input = input.slice(0, -endsWith.length) + endsWith;
            testCases.push({description: `valid string`, input, isValid: true});
        }
        return testCases;
    }

    public static invalid(schema: ZodString): TestCase[] {

        const testCases: TestCase[] = [];
            const checks = this.getSchemaChecks(schema);

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
                    case "nanoid":
                        isNanoid = true;
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
                    case "base64":
                        isBase64 = true;
                        break;
                    case "ip":
                        isIp = true;
                        break;
                    case "datetime":
                        isDatetime = true;
                        break;
                    case "date":
                        isDate = true;
                        break;
                    case "time":
                        isTime = true;
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
                }
            }

            if (isEmail) {
                testCases.push({description: "invalid email", input: "not-an-email", isValid: false});
            } else if (isUrl) {
                testCases.push({description: "invalid URL", input: "not-a-url", isValid: false});
            } else if (isUuid) {
                testCases.push({description: "invalid UUID", input: "not-a-uuid", isValid: false});
            } else if (isEmoji) {
                testCases.push({description: "invalid emoji", input: "not-an-emoji", isValid: false});
            } else if (isNanoid || isCuid || isCuid2 || isUlid) {
                testCases.push({description: "invalid ID", input: "invalid-id", isValid: false});
            } else if (isBase64) {
                testCases.push({description: "invalid base64", input: "not-base64!", isValid: false});
            } else if (isIp) {
                testCases.push({description: "invalid IP", input: "999.999.999.999", isValid: false});
            } else if (isDatetime) {
                testCases.push({description: "invalid datetime", input: "not-a-datetime", isValid: false});
            } else if (isDate) {
                testCases.push({description: "invalid date", input: "not-a-date", isValid: false});
            } else if (isTime) {
                testCases.push({description: "invalid time", input: "not-a-time", isValid: false});
            } else if (regex) {
                let invalidInput = '';
                const charPool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                do {
                    invalidInput = faker.string.sample({min: min, max: Math.min(20, max)});
                } while (regex.test(invalidInput));

                testCases.push({
                    description: `invalid regex match for ${regex}`,
                    input: invalidInput,
                    isValid: false
                });
            } else {
                if (min > -1) {
                    testCases.push({
                        description: `string too short (length < ${min})`,
                        input: faker.string.alpha(Math.max(0, min - 1)),
                        isValid: false,
                    });
                }
                if (max < Number.MAX_SAFE_INTEGER) {
                    testCases.push({
                        description: `string too long (length > ${max})`,
                        input: faker.string.alpha(max + 1),
                        isValid: false,
                    });
                }
                if (startsWith) {
                    testCases.push({
                        description: `string not starting with "${startsWith}"`,
                        input: "x" + faker.string.alpha(),
                        isValid: false,
                    });
                }
                if (endsWith) {
                    testCases.push({
                        description: `string not ending with "${endsWith}"`,
                        input: faker.string.alpha() + "x",
                        isValid: false,
                    });
                }
            }
        testCases.push({description: "not a string", input: 123, isValid: false});
        return testCases;
    }

    private static getSchemaChecks(schema: z.ZodString): any[] {
        return schema._def.checks || [];
    }
}