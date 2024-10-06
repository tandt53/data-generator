import { z } from 'zod';
import { faker } from '@faker-js/faker';
import { expect } from 'chai';

type TestCase = {
    description: string;
    input: any;
    expected: {
        isValid: boolean;
        value?: any;
        error?: string;
    };
};

export class ZodTestGenerator {
    private generateValidValue(schema: z.ZodType<any>): any[] {
        if (schema instanceof z.ZodString) {
            let min = 0;
            let max = Number.MAX_SAFE_INTEGER;
            let isEmail = false;
            let isUrl = false;
            let isUuid = false;

            if (schema._def.checks) {
                for (const check of schema._def.checks) {
                    switch (check.kind) {
                        case "email":
                            isEmail = true;
                            break;
                        case "url":
                            isUrl = true;
                            break;
                        case "uuid":
                            isUuid = true;
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
                    }
                }
            }

            if (isEmail) {
                return [faker.internet.email()];
            }
            if (isUrl) {
                return [faker.internet.url()];
            }
            if (isUuid) {
                return [faker.string.uuid()];
            }

            const validValues: string[] = [];
            if (min === max) {
                validValues.push(faker.string.alpha({ length: min }));
            } else {
                validValues.push(faker.string.alpha({ length: min }));
                if (min + 1 < max) validValues.push(faker.string.alpha({ length: min + 1 }));
                if (min + 1 < max - 1) validValues.push(faker.string.alpha({ length: max - 1 }));
                if (min < max) validValues.push(faker.string.alpha({ length: max }));
            }
            return validValues;
        }

        if (schema instanceof z.ZodNumber) {
            let min = Number.MIN_SAFE_INTEGER;
            let max = Number.MAX_SAFE_INTEGER;
            let isInt = false;

            if (schema._def.checks) {
                for (const check of schema._def.checks) {
                    switch (check.kind) {
                        case "min":
                            min = check.value;
                            break;
                        case "max":
                            max = check.value;
                            break;
                        case "int":
                            isInt = true;
                            break;
                    }
                }
            }

            const validValues: number[] = [];
            validValues.push(min);
            if (min + 1 < max) validValues.push(min + 1);
            if (min < max - 1) validValues.push(max - 1);
            if (min < max) validValues.push(max);

            if (isInt) {
                return validValues.map(Math.floor);
            }
            return validValues;
        }

        if (schema instanceof z.ZodBoolean) {
            return [true, false];
        }

        if (schema instanceof z.ZodDate) {
            return [faker.date.past(), faker.date.recent(), faker.date.future()];
        }

        if (schema instanceof z.ZodEnum) {
            return schema._def.values;
        }

        if (schema instanceof z.ZodArray) {
            const elementValues = this.generateValidValue(schema._def.type);
            return [
                [],
                [elementValues[0]],
                elementValues,
                [...elementValues, ...elementValues]
            ];
        }

        if (schema instanceof z.ZodObject) {
            const result: Record<string, any> = {};
            const shape = schema.shape as { [key: string]: z.ZodType<any> };

            for (const [key, value] of Object.entries(shape)) {
                if (value instanceof z.ZodType) {
                    result[key] = this.generateValidValue(value)[0];
                }
            }
            return [result];
        }

        return [null];
    }

    private generateInvalidValue(schema: z.ZodType<any>): any[] {
        const invalidValues: any[] = [null, undefined];

        if (schema instanceof z.ZodString) {
            invalidValues.push(
                123,                    // wrong type
                '',                     // empty string
                true,                   // boolean
                [],                     // array
                {}                      // object
            );

            if (schema._def.checks) {
                for (const check of schema._def.checks) {
                    switch (check.kind) {
                        case "email":
                            invalidValues.push(
                                'invalid-email',
                                '@invalid.com',
                                'test@',
                                'test@.'
                            );
                            break;
                        case "url":
                            invalidValues.push(
                                'not-a-url',
                                'http://',
                                'https://'
                            );
                            break;
                        case "min":
                            invalidValues.push(
                                faker.string.alpha({ length: check.value - 1 })
                            );
                            break;
                        case "max":
                            invalidValues.push(
                                faker.string.alpha({ length: check.value + 1 })
                            );
                            break;
                    }
                }
            }
        }

        if (schema instanceof z.ZodNumber) {
            invalidValues.push(
                'not a number',
                '',
                true,
                [],
                {}
            );

            if (schema._def.checks) {
                for (const check of schema._def.checks) {
                    switch (check.kind) {
                        case "min":
                            invalidValues.push(check.value - 1);
                            break;
                        case "max":
                            invalidValues.push(check.value + 1);
                            break;
                        case "int":
                            invalidValues.push(3.14);
                            break;
                    }
                }
            }
        }

        if (schema instanceof z.ZodEnum) {
            invalidValues.push(
                'invalid-enum-value',
                123,
                true,
                [],
                {}
            );
        }

        return invalidValues;
    }

    generateTestCases(schema: z.ZodType<any>, fieldName: string): TestCase[] {
        const testCases: TestCase[] = [];

        // Generate valid test cases
        const validValue = this.generateValidValue(schema);
        testCases.push({
            description: `Should accept valid ${fieldName}`,
            input: validValue,
            expected: {
                isValid: true,
                value: validValue
            }
        });

        // Generate invalid test cases
        const invalidValues = this.generateInvalidValue(schema);
        invalidValues.forEach(invalidValue => {
            testCases.push({
                description: `Should reject invalid ${fieldName}: ${JSON.stringify(invalidValue)}`,
                input: invalidValue,
                expected: {
                    isValid: false,
                    error: `Invalid ${fieldName}`
                }
            });
        });

        return testCases;
    }
}

// Example usage:
const testSchema = z.object({
    id: z.number().min(1),
    email: z.string().email(),
    name: z.string().min(2).max(50),
    age: z.number().min(0).max(120),
    role: z.enum(['user', 'admin']),
    isActive: z.boolean(),
    createdAt: z.date(),
    settings: z.object({
        theme: z.enum(['light', 'dark']),
        notifications: z.boolean()
    })
});

// Usage example:
// describe('Field Validation Tests', () => {
//     const generator = new ZodTestGenerator();
//
//     // Test each field
//     Object.entries(testSchema.shape).forEach(([fieldName, fieldSchema]) => {
//         it(`should validate ${fieldName} correctly`, () => {
//             const testCases = generator.generateTestCases(fieldSchema, fieldName);
//
//             testCases.forEach(testCase => {
//                 const result = fieldSchema.safeParse(testCase.input);
//
//                 if (testCase.expected.isValid) {
//                     expect(result.success).to.eql(true);
//                 } else {
//                     expect(result.success).to.eql(false);
//                 }
//             });
//         });
//     });
// });

// Example of getting test cases for a specific field:
// const emailTestCases = new ZodTestGenerator().generateTestCases(
//     testSchema.shape.email,
//     'email'
// );

/*
emailTestCases will contain:
[
  {
    description: "Should accept valid email",
    input: "user123@example.com",
    expected: { isValid: true, value: "user123@example.com" }
  },
  {
    description: "Should reject invalid email: null",
    input: null,
    expected: { isValid: false, error: "Invalid email" }
  },
  // ... more test cases
]
*/