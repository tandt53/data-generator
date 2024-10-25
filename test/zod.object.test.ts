import { expect } from 'chai';
import { z } from 'zod';
import { TestCaseGenerator } from '@/generator';
import { GeneratorRegistry } from '@/registry';
import { StringGenerator } from '@/stringGenerator';
import { NumberGenerator } from '@/numberGenerator';
import { BooleanGenerator } from '@/booleanGenerator';
import {EnumGenerator} from "@/enumGenerator";

describe.skip('TestCaseGenerator - ZodObject', () => {
    let registry: GeneratorRegistry;
    let generator: TestCaseGenerator;

    beforeEach(() => {
        registry = new GeneratorRegistry();
        registry.register('ZodString', new StringGenerator());
        registry.register('ZodNumber', new NumberGenerator());
        registry.register('ZodBoolean', new BooleanGenerator());
        generator = new TestCaseGenerator(registry);
    });

    describe('valid', () => {
        it('should generate valid cases for a simple object schema', () => {
            const schema = z.object({
                name: z.string(),
                age: z.number(),
                isStudent: z.boolean()
            });

            const validCases = generator.valid(schema);

            expect(validCases).to.have.length.at.least(1);
            validCases.forEach(testCase => {
                expect(testCase.isValid).to.be.true;
                expect(testCase.value).to.have.all.keys('name', 'age', 'isStudent');
                expect(testCase.value.name).to.be.a('string');
                expect(testCase.value.age).to.be.a('number');
                expect(testCase.value.isStudent).to.be.a('boolean');
            });
        });

        it('should generate valid cases including objects without optional properties', () => {
            const schema = z.object({
                name: z.string(),
                age: z.number().optional(),
                isStudent: z.boolean()
            });

            const validCases = generator.valid(schema);

            expect(validCases).to.have.length.at.least(2);
            expect(validCases.some(testCase => 'age' in testCase.value)).to.be.true;
            expect(validCases.some(testCase => ('age' in testCase.value && testCase.value.age === undefined))).to.be.true;
        });

        it('should handle nested object schemas', () => {
            const schema = z.object({
                user: z.object({
                    name: z.string(),
                    contact: z.object({
                        email: z.string().email(),
                        phone: z.string().optional()
                    })
                })
            });

            const validCases = generator.valid(schema);

            expect(validCases).to.have.length.at.least(1);
            validCases.forEach(testCase => {
                expect(testCase.isValid).to.be.true;
                expect(testCase.value).to.have.nested.property('user.name');
                expect(testCase.value).to.have.nested.property('user.contact.email');
            });
        });
    });

    describe('invalid', () => {
        it('should generate invalid cases for a simple object schema', () => {
            const schema = z.object({
                name: z.string(),
                age: z.number().min(18),
                isStudent: z.boolean()
            });

            const invalidCases = generator.invalid(schema);

            expect(invalidCases).to.have.length.at.least(3); // At least one for each property
            expect(invalidCases.some(testCase => typeof testCase.value.name !== 'string')).to.be.true;
            expect(invalidCases.some(testCase => typeof testCase.value.age !== 'number' || testCase.value.age < 18)).to.be.true;
            expect(invalidCases.some(testCase => typeof testCase.value.isStudent !== 'boolean')).to.be.true;
        });

        it('should generate invalid cases for missing required properties', () => {
            const schema = z.object({
                name: z.string(),
                age: z.number()
            });

            const invalidCases = generator.invalid(schema);

            expect(invalidCases.some(testCase => !('name' in testCase.value))).to.be.true;
            expect(invalidCases.some(testCase => !('age' in testCase.value))).to.be.true;
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


});

describe('TestCaseGenerator - Objects with Combined Types', () => {
    let registry: GeneratorRegistry;
    let generator: TestCaseGenerator;

    beforeEach(() => {
        registry = new GeneratorRegistry();
        registry.register('ZodString', new StringGenerator());
        registry.register('ZodNumber', new NumberGenerator());
        registry.register('ZodEnum', new EnumGenerator());
        registry.register('ZodBoolean', new BooleanGenerator());
        generator = new TestCaseGenerator(registry);
    });

    describe.skip('Enum in Objects', () => {
        const UserRole = {
            USER: 'USER',
            ADMIN: 'ADMIN',
            GUEST: 'GUEST'
        } as const;

        it('should handle objects with enum fields', () => {
            const schema = z.object({
                name: z.string(),
                role: z.enum([UserRole.USER, UserRole.ADMIN, UserRole.GUEST])
            });

            const validCases = generator.valid(schema);
            const invalidCases = generator.invalid(schema);

            console.log('\nValid cases for object with enum:');
            validCases.forEach(tc => {
                console.log('\nDescription:', tc.description);
                console.log('Value:', JSON.stringify(tc.value, null, 2));
            });

            // Valid cases should include all enum values
            expect(validCases.some(tc => tc.value.role === UserRole.USER)).to.be.true;
            expect(validCases.some(tc => tc.value.role === UserRole.ADMIN)).to.be.true;
            expect(validCases.some(tc => tc.value.role === UserRole.GUEST)).to.be.true;

            // Invalid cases should include invalid enum values
            expect(invalidCases.some(tc =>
                tc.value.role && !Object.values(UserRole).includes(tc.value.role)
            )).to.be.true;
        });

        it('should handle optional enum fields', () => {
            const schema = z.object({
                name: z.string(),
                role: z.enum([UserRole.USER, UserRole.ADMIN, UserRole.GUEST]).optional()
            });

            const validCases = generator.valid(schema);
            const invalidCases = generator.invalid(schema);

            // Valid cases should include undefined for optional enum
            expect(validCases.some(tc => tc.value.role === undefined)).to.be.true;
            // Should still include valid enum values
            expect(validCases.some(tc => Object.values(UserRole).includes(tc.value.role))).to.be.true;
        });

        it('should handle nullable enum fields', () => {
            const schema = z.object({
                name: z.string(),
                role: z.enum([UserRole.USER, UserRole.ADMIN, UserRole.GUEST]).nullable()
            });

            const validCases = generator.valid(schema);
            const invalidCases = generator.invalid(schema);

            // Valid cases should include null for nullable enum
            expect(validCases.some(tc => tc.value.role === null)).to.be.true;
            // Should still include valid enum values
            expect(validCases.some(tc => Object.values(UserRole).includes(tc.value.role))).to.be.true;
        });
    });

    describe.skip('Optional Fields', () => {
        it('should handle objects with multiple optional fields', () => {
            const schema = z.object({
                name: z.string(),
                age: z.number().optional(),
                email: z.string().email().optional(),
                phone: z.string().optional()
            });

            const validCases = generator.valid(schema);
            const invalidCases = generator.invalid(schema);

            // Should have cases with different combinations of optional fields
            expect(validCases.some(tc => tc.value.age === undefined)).to.be.true;
            expect(validCases.some(tc => tc.value.email === undefined)).to.be.true;
            expect(validCases.some(tc => tc.value.phone === undefined)).to.be.true;
            expect(validCases.some(tc => tc.value.age !== undefined)).to.be.true;

            // Required field should always be present
            expect(validCases.every(tc => typeof tc.value.name === 'string')).to.be.true;
        });

        it('should handle nested objects with optional fields', () => {
            const schema = z.object({
                user: z.object({
                    name: z.string(),
                    contact: z.object({
                        email: z.string().email().optional(),
                        phone: z.string().optional()
                    }).optional()
                })
            });

            const validCases = generator.valid(schema);
            const invalidCases = generator.invalid(schema);

            // Should handle optional nested objects
            expect(validCases.some(tc => tc.value.user.contact === undefined)).to.be.true;
            // Should handle optional fields in nested objects
            expect(validCases.some(tc =>
                tc.value.user.contact && tc.value.user.contact.email === undefined
            )).to.be.true;
        });
    });

    describe('Nullable Fields', () => {
        it.skip('should handle objects with multiple nullable fields', () => {
            const schema = z.object({
                name: z.string(),
                age: z.number().nullable(),
                email: z.string().email().nullable(),
                role: z.enum(['USER', 'ADMIN']).nullable()
            });

            const validCases = generator.valid(schema);
            const invalidCases = generator.invalid(schema);

            // Should have cases with null values
            expect(validCases.some(tc => tc.value.age === null)).to.be.true;
            expect(validCases.some(tc => tc.value.email === null)).to.be.true;
            expect(validCases.some(tc => tc.value.role === null)).to.be.true;

            // Should also have cases with non-null values
            expect(validCases.some(tc => typeof tc.value.age === 'number')).to.be.true;
            expect(validCases.some(tc => typeof tc.value.email === 'string')).to.be.true;
        });

        it('should handle nested objects with nullable fields', () => {
            const schema = z.object({
                user: z.object({
                    name: z.string(),
                    profile: z.object({
                        bio: z.string().nullable(),
                        avatar: z.string().nullable()
                    }).nullable()
                })
            });

            const validCases = generator.valid(schema);
            const invalidCases = generator.invalid(schema);

            // Should handle nullable nested objects
            expect(validCases.some(tc => tc.value.user.profile === null)).to.be.true;
            // Should handle nullable fields in nested objects
            expect(validCases.some(tc =>
                tc.value.user.profile && tc.value.user.profile.bio === null
            )).to.be.true;
        });
    });

    describe.skip('Combined Optional, Nullable and Enum', () => {
        it('should handle fields that are both optional and nullable', () => {
            const schema = z.object({
                name: z.string(),
                age: z.number().optional().nullable(),
                role: z.enum(['USER', 'ADMIN']).optional().nullable()
            });

            const validCases = generator.valid(schema);
            const invalidCases = generator.invalid(schema);

            // Should have cases with undefined
            expect(validCases.some(tc => tc.value.age === undefined)).to.be.true;
            expect(validCases.some(tc => tc.value.role === undefined)).to.be.true;

            // Should have cases with null
            expect(validCases.some(tc => tc.value.age === null)).to.be.true;
            expect(validCases.some(tc => tc.value.role === null)).to.be.true;

            // Should have cases with values
            expect(validCases.some(tc => typeof tc.value.age === 'number')).to.be.true;
            expect(validCases.some(tc => tc.value.role === 'USER' || tc.value.role === 'ADMIN')).to.be.true;
        });

        it('should handle complex nested objects with mixed types', () => {
            const schema = z.object({
                user: z.object({
                    name: z.string(),
                    role: z.enum(['USER', 'ADMIN']).nullable(),
                    settings: z.object({
                        theme: z.enum(['LIGHT', 'DARK']).optional(),
                        notifications: z.boolean().nullable().optional(),
                        language: z.string().optional().nullable()
                    }).optional()
                })
            });

            const validCases = generator.valid(schema);
            const invalidCases = generator.invalid(schema);

            // console.log('\nValid cases for complex nested object:');
            // validCases.forEach(tc => {
            //     console.log('\nDescription:', tc.description);
            //     console.log('Value:', JSON.stringify(tc.value, null, 2));
            // });

            // Check various combinations of optional/nullable fields
            expect(validCases.some(tc => tc.value.user.role === null)).to.be.true;
            expect(validCases.some(tc => tc.value.user.settings === undefined)).to.be.true;
            expect(validCases.some(tc =>
                tc.value.user.settings &&
                tc.value.user.settings.notifications === null
            )).to.be.true;
            expect(validCases.some(tc =>
                tc.value.user.settings &&
                tc.value.user.settings.language === undefined
            )).to.be.true;
        });
    });
});