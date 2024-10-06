import {z} from 'zod';
import {faker} from '@faker-js/faker';

// Test value generators for different field types
export const TestValues: {[index: string]:any} = {
    // String types
    string: {
        valid: [
            faker.lorem.word(),
            faker.lorem.words(3),
            'Normal string',
            ' Padded string ',
            'Special @#$% chars',
        ],
        invalid: [
            '',
            ' ',
            null,
            undefined,
            123,
            true,
            [],
            {},
        ]
    },

    // Number types
    number: {
        valid: [
            0,
            1,
            -1,
            1.5,
            -1.5,
            Number.MAX_SAFE_INTEGER,
            Number.MIN_SAFE_INTEGER,
        ],
        invalid: [
            null,
            undefined,
            '',
            'abc',
            NaN,
            Infinity,
            -Infinity,
            [],
            {},
        ]
    },

    // Boolean types
    boolean: {
        valid: [
            true,
            false,
        ],
        invalid: [
            null,
            undefined,
            0,
            1,
            '',
            'true',
            'false',
            [],
            {},
        ]
    },

    // Date types
    date: {
        valid: [
            new Date(),
            new Date('2023-01-01'),
            new Date(2023, 0, 1),
        ],
        invalid: [
            null,
            undefined,
            '',
            'not a date',
            '2023-01-01',
            123456789,
            {},
        ]
    },

    // Email types
    email: {
        valid: [
            'test@example.com',
            'user.name+tag@example.co.uk',
            '123@domain.com',
        ],
        invalid: [
            null,
            undefined,
            '',
            'notanemail',
            '@domain.com',
            'user@',
            'user@.com',
            {},
        ]
    },

    // URL types
    url: {
        valid: [
            'https://example.com',
            'http://sub.domain.co.uk/path?query=1',
            'https://localhost:3000',
        ],
        invalid: [
            null,
            undefined,
            '',
            'notaurl',
            'http://',
            'https://',
            'example.com',
        ]
    },

    // Array types
    array: {
        valid: [
            [],
            [1, 2, 3],
            ['a', 'b', 'c'],
        ],
        invalid: [
            null,
            undefined,
            '',
            'not an array',
            123,
            {},
        ]
    },

    // Object types
    object: {
        valid: [
            {},
            {key: 'value'},
            {nested: {key: 'value'}},
        ],
        invalid: [
            null,
            undefined,
            '',
            'not an object',
            123,
            [],
        ]
    },
};

// Utility type for test cases
export interface TestCase<T> {
    description: string;
    input: any;
    expected: {
        isValid: boolean;
        value?: T;
        error?: string;
    };
}

// Generic test case generator
export function generateTestCases<T>(
    fieldName: string,
    schema: z.ZodType<T>,
    customValidCases: any[] = [],
    customInvalidCases: any[] = []
): TestCase<T>[] {
    const fieldType = getFieldType(schema);
    const standardTests = TestValues[fieldType] || TestValues.string;

    const testCases: TestCase<T>[] = [];

    // Add valid test cases
    [...standardTests.valid, ...customValidCases].forEach((input) => {
        testCases.push({
            description: `${fieldName} should accept valid ${fieldType}: ${JSON.stringify(input)}`,
            input,
            expected: {
                isValid: true,
                value: input,
            },
        });
    });

    // Add invalid test cases
    [...standardTests.invalid, ...customInvalidCases].forEach((input) => {
        testCases.push({
            description: `${fieldName} should reject invalid input: ${JSON.stringify(input)}`,
            input,
            expected: {
                isValid: false,
                error: 'Invalid input',
            },
        });
    });

    return testCases;
}

// Helper function to determine field type from Zod schema
function getFieldType(schema: z.ZodType<any>): string {
    if (schema instanceof z.ZodString) return 'string';
    if (schema instanceof z.ZodNumber) return 'number';
    if (schema instanceof z.ZodBoolean) return 'boolean';
    if (schema instanceof z.ZodDate) return 'date';
    if (schema instanceof z.ZodArray) return 'array';
    if (schema instanceof z.ZodObject) return 'object';
    return 'string'; // default
}

// Test executor function
export async function runApiTests<T>(
    testCases: TestCase<T>[],
    testFn: (input: any) => Promise<T>
): Promise<void> {
    for (const testCase of testCases) {
        try {
            const result = await testFn(testCase.input);

            if (testCase.expected.isValid) {
                console.log(`✅ Passed: ${testCase.description}`);
            } else {
                console.error(`❌ Failed: ${testCase.description} - Expected invalid input to throw`);
            }
        } catch (error) {
            if (testCase.expected.isValid) {
                // @ts-ignore
                console.error(`❌ Failed: ${testCase.description} - ${error.message}`);
            } else {
                console.log(`✅ Passed: ${testCase.description} - Correctly rejected invalid input`);
            }
        }
    }
}