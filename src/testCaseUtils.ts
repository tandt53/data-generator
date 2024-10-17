import {ZodType} from 'zod';
import {TestCase} from './types';

// export const addTestCase = <T extends ZodType>(
//     schema: T,
//     testCases: TestCase[],
//     description: string,
//     value: any
// ): void => {
//     const result = schema.safeParse(value);
//     if (!result.success) {
//         testCases.push({
//             description,
//             value,
//             isValid: false,
//             expectedMessage: result.error.errors[0].message
//         });
//     }
// };

export const tc = <T extends ZodType>(
    schema: T,
    description: string,
    value: any
): TestCase => {
    const result = schema.safeParse(value);
    if (result.success) {
        return {
            description,
            value,
            isValid: true
        };
    } else {
        return {
            description,
            value,
            isValid: false,
            expectedMessage: result.error.errors[0].message
        }
    }
};
