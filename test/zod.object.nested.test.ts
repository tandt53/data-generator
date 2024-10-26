import {expect} from 'chai';
import {z} from 'zod';
import {GeneratorRegistry} from "@/registry";
import {StringGenerator} from "@/stringGenerator";
import {NumberGenerator} from "@/numberGenerator";
import {BooleanGenerator} from "@/booleanGenerator";
import {EnumGenerator} from "@/enumGenerator";
import {TestCaseGenerator} from "@/generator";
import {TestCase} from "@/types";

describe('ZodObject - Nested Objects', () => {
    let registry: GeneratorRegistry;
    let generator: TestCaseGenerator;

    beforeEach(() => {
        registry = new GeneratorRegistry();
        registry.register('ZodString', new StringGenerator());
        registry.register('ZodNumber', new NumberGenerator());
        registry.register('ZodBoolean', new BooleanGenerator());
        registry.register('ZodEnum', new EnumGenerator());
        generator = new TestCaseGenerator(registry);
    });

    describe('Required Nested Object', () => {
        it('with simple nested object', () => {
            const nestedSchema = z.object({
                name: z.string(),
                age: z.number()
            });

            const schema = z.object({
                user: nestedSchema
            });

            const objectValidCases = generator.valid(schema);
            const nestedValidCases = generator.valid(nestedSchema);

            // Number of test cases should match nested object plus one for the container
            expect(objectValidCases.length).to.equal(nestedValidCases.length + 1);

            // All nested object test descriptions should be included with proper path
            nestedValidCases.forEach(nestedCase => {
                const expectedDescription = nestedCase.description.replace(
                    "for '",
                    "for 'user."
                );
                expect(objectValidCases.some(objCase =>
                    objCase.description.includes(expectedDescription)
                )).to.be.true;
            });
        });

        it('with optional nested object', () => {
            const nestedSchema = z.object({
                name: z.string(),
                age: z.number()
            });

            const schema = z.object({
                user: nestedSchema.optional()
            });

            const objectValidCases = generator.valid(schema);
            const nestedValidCases = generator.valid(nestedSchema);

            // Should include undefined case
            expect(objectValidCases.some(tc => tc.value.user === undefined)).to.be.true;

            // Should include all nested cases when present
            nestedValidCases.forEach(nestedCase => {
                const expectedDescription = nestedCase.description.replace(
                    "for '",
                    "for 'user."
                );
                expect(objectValidCases.some(objCase =>
                    objCase.description.includes(expectedDescription)
                )).to.be.true;
            });
        });

        it('should handle deeply nested optional objects', () => {
            const schema = z.object({
                user: z.object({
                    profile: z.object({
                        address: z.object({
                            city: z.string()
                        }).optional()
                    })
                })
            });

            const validCases = generator.valid(schema);

            // Should have undefined case with correct path
            expect(validCases.some(tc =>
                tc.description === "Should accept undefined for optional object in 'user.profile.address'"
            )).to.be.true;

            // Should have cases for the nested property when present
            expect(validCases.some(tc =>
                tc.description === "Should accept a valid string for 'user.profile.address.city'"
            )).to.be.true;
        });

        it('should handle combination of optional and nullable nested objects', () => {
            const schema = z.object({
                user: z.object({
                    profile: z.object({
                        address: z.object({
                            city: z.string()
                        }).nullable()
                    }).optional()
                })
            });

            const validCases = generator.valid(schema);

            // Should have undefined case for optional object
            expect(validCases.some(tc =>
                tc.description === "Should accept undefined for optional object in 'user.profile'"
            )).to.be.true;

            // Should have null case for nullable object
            expect(validCases.some(tc =>
                tc.description === "Should accept null value for nullable object in 'user.profile.address'"
            )).to.be.true;

            // Should have cases for the nested property when present
            expect(validCases.some(tc =>
                tc.description === "Should accept a valid string for 'user.profile.address.city'"
            )).to.be.true;
        });

        it('should handle nested object schemas', () => {
            const schema = z.object({
                user: z.object({
                    name: z.string().min(2),
                    contact: z.object({
                        email: z.string().email(),
                        phone: z.string().optional()
                    })
                })
            });

            const invalidCases = generator.invalid(schema);

            expect(invalidCases).to.have.length.at.least(1);

            const hasInvalidUser = invalidCases.some(tc =>
                !tc.value.user || typeof tc.value.user !== 'object'
            );
            expect(hasInvalidUser).to.be.true;

            const hasInvalidName = invalidCases.some(tc =>
                tc.value.user &&
                (!tc.value.user.name || typeof tc.value.user.name !== 'string' || tc.value.user.name.length < 2)
            );
            expect(hasInvalidName).to.be.true;

            const hasInvalidEmail = invalidCases.some(tc =>
                tc.value.user &&
                tc.value.user.contact &&
                (!tc.value.user.contact.email || typeof tc.value.user.contact.email !== 'string' || !tc.value.user.contact.email.includes('@'))
            );
            expect(hasInvalidEmail).to.be.true;

        });
    });

    describe('integration with Zod', () => {
        it('should generate cases that align with Zod validation', () => {
            const schema = z.object({
                user: z.object({
                    name: z.string().min(2),
                    contact: z.object({
                        email: z.string().email(),
                        phone: z.string().optional()
                    })
                })
            });
            const allCases = [...generator.valid(schema), ...generator.invalid(schema)];

            allCases.forEach((testCase: TestCase) => {
                const result = schema.safeParse(testCase.value);
                expect(result.success).to.equal(testCase.isValid);
            });
        });
    });
});