// import { z } from 'zod';
// import { generateTestCases, runApiTests } from '../src/api-test-utils';
//
// // Example API schema
// const UserSchema = z.object({
//     id: z.number(),
//     email: z.string().email(),
//     name: z.string().min(2),
//     age: z.number().min(0).max(120),
//     isActive: z.boolean(),
// });
//
// type User = z.infer<typeof UserSchema>;
//
// // Example API function
// async function createUser(userData: Partial<User>): Promise<User> {
//     const validatedData = UserSchema.parse(userData);
//     // Make API call here
//     return validatedData;
// }
//
// // Generate test cases
// const emailTests = generateTestCases('email', z.string().email());
// const nameTests = generateTestCases('name', z.string().min(2),
//     ['John Doe', 'Jane'], // additional valid cases
//     ['J'] // additional invalid cases
// );
// const ageTests = generateTestCases('age', z.number().min(0).max(120));
//
// // Run tests
// describe('User API Tests', () => {
//     it('should validate email field correctly', async () => {
//         await runApiTests(emailTests, async (input) => {
//             const result = await createUser({ email: input });
//             return result.email;
//         });
//     });
//
//     it('should validate name field correctly', async () => {
//         await runApiTests(nameTests, async (input) => {
//             const result = await createUser({ name: input });
//             return result.name;
//         });
//     });
//
//     it('should validate age field correctly', async () => {
//         await runApiTests(ageTests, async (input) => {
//             const result = await createUser({ age: input });
//             return result.age;
//         });
//     });
// });