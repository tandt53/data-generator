// import {z} from 'zod';
// import {faker} from '@faker-js/faker';
//
// interface TestCase {
//     description: string;
//     input: any;
//     isValid: boolean;
//     expected: string;
// }
//
// function generateTestCases(schema: z.ZodType<any>): TestCase[] {
//     const testCases: TestCase[] = [];
//
//     testCases.push(...generateValidTestCases(schema));
//     testCases.push(...generateInvalidTestCases(schema));
//
//     return testCases;
// }
//
// function generateValidTestCases(schema: z.ZodType<any>): TestCase[] {
//     const validCases: TestCase[] = [];
//
//     if (schema instanceof z.ZodString) {
//         validCases.push(...generateValidStringCases(schema));
//     } else if (schema instanceof z.ZodNumber) {
//         validCases.push(...generateValidNumberCases(schema));
//     } else if (schema instanceof z.ZodBoolean) {
//         validCases.push({
//             description: 'Valid boolean',
//             input: faker.datatype.boolean(),
//             isValid: true,
//             expected: 'Should be a valid boolean',
//         });
//     } else if (schema instanceof z.ZodObject) {
//         validCases.push(...generateValidObjectCases(schema));
//     }
//
//     return validCases;
// }
//
// function generateInvalidTestCases(schema: z.ZodType<any>): TestCase[] {
//     const invalidCases: TestCase[] = [];
//
//     if (schema instanceof z.ZodString) {
//         invalidCases.push(...generateInvalidStringCases(schema));
//     } else if (schema instanceof z.ZodNumber) {
//         invalidCases.push(...generateInvalidNumberCases(schema));
//     } else if (schema instanceof z.ZodBoolean) {
//         invalidCases.push({
//             description: 'Invalid boolean (string)',
//             input: faker.lorem.word(),
//             isValid: false,
//             expected: 'Should be invalid (not a boolean)',
//         });
//     } else if (schema instanceof z.ZodObject) {
//         invalidCases.push(...generateInvalidObjectCases(schema));
//     }
//
//     return invalidCases;
// }
//
// // ... (previous code)
//
// function generateValidStringCases(schema: z.ZodString): TestCase[] {
//     const cases: TestCase[] = [];
//     const checks = schema._def.checks;
//
//     if (checks.some(check => check.kind === 'email')) {
//         cases.push({
//             description: 'Valid email',
//             input: faker.internet.email(),
//             isValid: true,
//             expected: 'Should be a valid email',
//         });
//     } else if (checks.some(check => check.kind === 'url')) {
//         cases.push({
//             description: 'Valid URL',
//             input: faker.internet.url(),
//             isValid: true,
//             expected: 'Should be a valid URL',
//         });
//     } else {
//         const minLength = checks.find(check => check.kind === 'min')?.value ?? 0;
//         const maxLength = checks.find(check => check.kind === 'max')?.value ?? 100;
//
//         cases.push({
//             description: 'Valid string',
//             input: faker.lorem.words(faker.number.int({min: minLength, max: maxLength})),
//             isValid: true,
//             expected: 'Should be a valid string',
//         });
//     }
//
//     return cases;
// }
//
// function generateInvalidStringCases(schema: z.ZodString): TestCase[] {
//     const cases: TestCase[] = [];
//     const checks = schema._def.checks;
//
//     if (checks.some(check => check.kind === 'email')) {
//         cases.push({
//             description: 'Invalid email',
//             input: faker.lorem.word(),
//             isValid: false,
//             expected: 'Should be invalid (not an email)',
//         });
//     } else if (checks.some(check => check.kind === 'url')) {
//         cases.push({
//             description: 'Invalid URL',
//             input: faker.lorem.word(),
//             isValid: false,
//             expected: 'Should be invalid (not a URL)',
//         });
//     }
//
//     const minCheck = checks.find(check => check.kind === 'min');
//     if (minCheck) {
//         cases.push({
//             description: 'Invalid string (too short)',
//             input: faker.lorem.word(Math.max(1, minCheck.value - 1)),
//             isValid: false,
//             expected: `Should be invalid (shorter than ${minCheck.value} characters)`,
//         });
//     }
//
//     const maxCheck = checks.find(check => check.kind === 'max');
//     if (maxCheck) {
//         cases.push({
//             description: 'Invalid string (too long)',
//             input: faker.lorem.words(maxCheck.value + 1),
//             isValid: false,
//             expected: `Should be invalid (longer than ${maxCheck.value} characters)`,
//         });
//     }
//
//     return cases;
// }
//
// function generateValidNumberCases(schema: z.ZodNumber): TestCase[] {
//     const cases: TestCase[] = [];
//     const checks = schema._def.checks;
//
//     const min = checks.find(check => check.kind === 'min')?.value ?? Number.MIN_SAFE_INTEGER;
//     const max = checks.find(check => check.kind === 'max')?.value ?? Number.MAX_SAFE_INTEGER;
//
//     cases.push({
//         description: 'Valid number',
//         input: faker.number.int({min, max}),
//         isValid: true,
//         expected: 'Should be a valid number',
//     });
//
//     return cases;
// }
//
// function generateInvalidNumberCases(schema: z.ZodNumber): TestCase[] {
//     const cases: TestCase[] = [];
//     const checks = schema._def.checks;
//
//     cases.push({
//         description: 'Invalid number (string)',
//         input: faker.lorem.word(),
//         isValid: false,
//         expected: 'Should be invalid (not a number)',
//     });
//
//     const minCheck = checks.find(check => check.kind === 'min');
//     if (minCheck) {
//         cases.push({
//             description: 'Invalid number (too small)',
//             input: minCheck.value - 1,
//             isValid: false,
//             expected: `Should be invalid (smaller than ${minCheck.value})`,
//         });
//     }
//
//     const maxCheck = checks.find(check => check.kind === 'max');
//     if (maxCheck) {
//         cases.push({
//             description: 'Invalid number (too large)',
//             input: maxCheck.value + 1,
//             isValid: false,
//             expected: `Should be invalid (larger than ${maxCheck.value})`,
//         });
//     }
//
//     return cases;
// }
//
// function generateValidObjectCases(schema: z.ZodObject<any>): TestCase[] {
//     const cases: TestCase[] = [];
//     const shape = schema.shape;
//
//     const validObject: Record<string, any> = {};
//     for (const [key, fieldSchema] of Object.entries(shape)) {
//         if (fieldSchema instanceof z.ZodType) {
//             validObject[key] = generateValidValue(fieldSchema);
//         }
//     }
//
//     cases.push({
//         description: 'Valid object',
//         input: validObject,
//         isValid: true,
//         expected: 'Should be a valid object',
//     });
//
//     return cases;
// }
//
// function generateInvalidObjectCases(schema: z.ZodObject<any>): TestCase[] {
//     const cases: TestCase[] = [];
//     const shape = schema.shape;
//
//     for (const [key, fieldSchema] of Object.entries(shape)) {
//         const invalidObject = {...generateValidObject(schema)};
//         if (fieldSchema instanceof z.ZodType) {
//             invalidObject[key] = generateInvalidValue(fieldSchema);
//         }
//         cases.push({
//             description: `Invalid object (invalid ${key})`,
//             input: invalidObject,
//             isValid: false,
//             expected: `Should be invalid (${key} is invalid)`,
//         });
//     }
//
//     return cases;
// }
//
// function generateValidValue(schema: z.ZodType<any>): any {
//     if (schema instanceof z.ZodString) return faker.lorem.word();
//     if (schema instanceof z.ZodNumber) return faker.number.int();
//     if (schema instanceof z.ZodBoolean) return faker.datatype.boolean();
//     if (schema instanceof z.ZodObject) return generateValidObject(schema);
//     // Add more types as needed
//     return null;
// }
//
// function generateInvalidValue(schema: z.ZodType<any>): any {
//     if (schema instanceof z.ZodString) return faker.number.int();
//     if (schema instanceof z.ZodNumber) return faker.lorem.word();
//     if (schema instanceof z.ZodBoolean) return faker.lorem.word();
//     if (schema instanceof z.ZodObject) return faker.lorem.word();
//     // Add more types as needed
//     return undefined;
// }
//
// function generateValidObject(schema: z.ZodObject<any>): Record<string, any> {
//     const validObject: Record<string, any> = {};
//     const shape = schema.shape;
//
//     for (const [key, fieldSchema] of Object.entries(shape)) {
//         if (fieldSchema instanceof z.ZodType) {
//             validObject[key] = generateValidValue(fieldSchema);
//         }
//     }
//
//     return validObject;
// }
//
//
// const userSchema = z.object({
//     id: z.number().min(1).max(1000),
//     name: z.string().min(2).max(50),
//     email: z.string().email(),
//     age: z.number().min(18).max(120),
//     isActive: z.boolean(),
//     website: z.string().url().optional(),
// });
//
// const testCases = generateTestCases(userSchema);
// console.log(JSON.stringify(testCases, null, 2));