import { expect } from 'chai';
import { z } from 'zod';
import { TestCaseGenerator } from '../src/generator';
import { GeneratorRegistry } from '../src/registry';
import { StringGenerator } from '../src/stringGenerator';
import { NumberGenerator } from '../src/numberGenerator';
import { BooleanGenerator } from '../src/booleanGenerator';
import { EnumGenerator } from '../src/enumGenerator';

describe('ZodObject - Simple Objects with Single Property', () => {
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

    describe('Required Property', () => {
        it('with string property', () => {
            const schema = z.object({ name: z.string() });
            const stringSchema = z.string();

            const objectValidCases = generator.valid(schema);
            const stringValidCases = generator.valid(stringSchema);
            const objectInvalidCases = generator.invalid(schema);
            const stringInvalidCases = generator.invalid(stringSchema);

            // Number of test cases validation
            expect(objectValidCases.length).to.equal(stringValidCases.length + 1); // +1 for "all fields valid" case
            expect(objectInvalidCases.length).to.equal(stringInvalidCases.length + 5); // +1 for missing field case

            // Description validation
            stringValidCases.forEach(stringCase => {
                expect(objectValidCases.some(objCase =>
                    objCase.description.includes(stringCase.description)
                )).to.be.true;
            });
            stringInvalidCases.forEach(stringCase => {
                expect(objectInvalidCases.some(objCase =>
                    objCase.description.includes(stringCase.description)
                )).to.be.true;
            });
        });

        it('with number property', () => {
            const schema = z.object({ age: z.number() });
            const numberSchema = z.number();

            const objectValidCases = generator.valid(schema);
            const numberValidCases = generator.valid(numberSchema);
            const objectInvalidCases = generator.invalid(schema);
            const numberInvalidCases = generator.invalid(numberSchema);

            expect(objectValidCases.length).to.equal(numberValidCases.length + 1);
            expect(objectInvalidCases.length).to.equal(numberInvalidCases.length + 5);

            numberValidCases.forEach(numberCase => {
                expect(objectValidCases.some(objCase =>
                    objCase.description.includes(numberCase.description)
                )).to.be.true;
            });
        });

        it('with boolean property', () => {
            const schema = z.object({ isActive: z.boolean() });
            const boolSchema = z.boolean();

            const objectValidCases = generator.valid(schema);
            const boolValidCases = generator.valid(boolSchema);
            const objectInvalidCases = generator.invalid(schema);
            const boolInvalidCases = generator.invalid(boolSchema);

            expect(objectValidCases.length).to.equal(boolValidCases.length + 1);
            expect(objectInvalidCases.length).to.equal(boolInvalidCases.length + 5);
        });

        it('with enum property', () => {
            const UserRole = z.enum(['USER', 'ADMIN']);
            const schema = z.object({ role: UserRole });

            const objectValidCases = generator.valid(schema);
            const enumValidCases = generator.valid(UserRole);
            const objectInvalidCases = generator.invalid(schema);
            const enumInvalidCases = generator.invalid(UserRole);

            expect(objectValidCases.length).to.equal(enumValidCases.length + 1);
            expect(objectInvalidCases.length).to.equal(enumInvalidCases.length + 5);
        });
    });

    describe('Optional Property', () => {
        it('with optional string property', () => {
            const stringSchema = z.string().optional();
            const schema = z.object({ name: stringSchema });

            const objectValidCases = generator.valid(schema);
            const stringValidCases = generator.valid(stringSchema);
            const objectInvalidCases = generator.invalid(schema);
            const stringInvalidCases = generator.invalid(stringSchema);

            expect(objectValidCases.length).to.equal(stringValidCases.length + 1);
            expect(objectInvalidCases.length).to.equal(stringInvalidCases.length + 4); // 4 cases added for object: null, undefined, array, primitive
            expect(objectValidCases.some(tc => !('name' in tc.value))).to.be.false; // name: undefined is still counted as valid
        });
    });

    describe('Nullable Property', () => {
        it('with nullable string property', () => {
            const stringSchema = z.string().nullable();
            const schema = z.object({ name: stringSchema });

            const objectValidCases = generator.valid(schema);
            const stringValidCases = generator.valid(stringSchema);
            const objectInvalidCases = generator.invalid(schema);
            const stringInvalidCases = generator.invalid(stringSchema);

            expect(objectValidCases.length).to.equal(stringValidCases.length + 1);
            expect(objectInvalidCases.length).to.equal(stringInvalidCases.length + 5);
            expect(objectValidCases.some(tc => tc.value.name === null)).to.be.true;
        });

    });
});