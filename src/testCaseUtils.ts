
import { ZodType } from 'zod';
import { TestCase } from './types';

export const addTestCase = <T extends ZodType>(
    schema: T,
    testCases: TestCase[],
    description: string,
    value: any
): void => {
    const result = schema.safeParse(value);
    if (!result.success) {
        testCases.push({
            description,
            value,
            isValid: false,
            expectedMessage: result.error.errors[0].message
        });
    }
};

export const addValidTestCase = <T extends ZodType>(
    schema: T,
    testCases: TestCase[],
    description: string,
    value: any
): void => {
    const result = schema.safeParse(value);
    if (result.success) {
        testCases.push({
            description,
            value,
            isValid: true
        });
    }
};