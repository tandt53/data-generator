import { expect } from 'chai';
import { z } from 'zod';
import { TestCaseGenerator } from '@/generator';
import { GeneratorRegistry } from '@/registry';
import { StringGenerator } from '@/stringGenerator';
import { NumberGenerator } from '@/numberGenerator';
import { BooleanGenerator } from '@/booleanGenerator';

describe('TestCaseGenerator - ZodObject', () => {
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
                        email: z.string(),
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

            console.log(JSON.stringify(invalidCases, null, 2));
        });
    });
});