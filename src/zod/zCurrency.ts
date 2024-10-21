// import {z} from "zod";
// import {TestCase} from "@/types";
//
// // Create a function that generates a Zod schema for currency codes
// export const zCurrencyCode = (allowedValues?: string[]) => {
//     if (allowedValues && allowedValues.length > 0) {
//         return z.enum(allowedValues as [string, ...string[]])
//             .describe("currency.code");
//     } else {
//         return z.string()
//             .length(3)
//             .regex(/^[A-Z]{3}$/)
//             .describe("currency.code");
//     }
// };
//
// // Type for currency codes
// export type CurrencyCode = z.infer<ReturnType<typeof zCurrencyCode>>;
//
// // Valid generator method
// export const zCurrencyCodeValidGenerator = (allowedValues?: string[]): TestCase[] => {
//     const testCases: TestCase[] = [];
//
//     if (allowedValues && allowedValues.length > 0) {
//         // Generate valid cases based on allowed values
//         allowedValues.forEach(value => {
//             testCases.push({
//                 description: `valid currency code: ${value}`,
//                 value: value,
//                 isValid: true
//             });
//         });
//     } else {
//         // Generate valid cases for any 3-letter uppercase codes
//         const validCodes = ["USD", "EUR", "JPY", "AUD", "CAD"];
//         validCodes.forEach(code => {
//             testCases.push({
//                 description: `valid currency code: ${code}`,
//                 value: code,
//                 isValid: true
//             });
//         });
//     }
//
//     return testCases;
// };
//
// // Invalid generator method
// export const zCurrencyCodeInvalidGenerator = (allowedValues?: string[]): TestCase[] => {
//     const testCases: TestCase[] = [];
//
//     if (allowedValues && allowedValues.length > 0) {
//         // Generate invalid cases based on allowed values
//         const invalidCodes = ["usd", "ID", "USDD", "INVALID", "123", "$$$"];
//         invalidCodes.forEach(code => {
//             testCases.push({
//                 description: `invalid currency code: ${code}`,
//                 value: code,
//                 isValid: false
//             });
//         });
//     } else {
//         // Generate invalid cases for any 3-letter uppercase codes
//         const invalidCodes = ["idR", "US", "USDD", "INVALID", "123", "$$$"];
//         invalidCodes.forEach(code => {
//             testCases.push({
//                 description: `invalid currency code: ${code}`,
//                 value: code,
//                 isValid: false
//             });
//         });
//     }
//
//     return testCases;
// };
//
