import {expect} from 'chai';
import {z} from 'zod';
import {TestCaseGenerator} from '@/generator';
import {GeneratorRegistry} from '@/registry';
import {StringGenerator} from '@/stringGenerator';
import {NumberGenerator} from '@/numberGenerator';
import {OptionalGenerator} from '@/optionalGenerator';
import {NullableGenerator} from '@/nullableGenerator';

describe('TestCaseGenerator', () => {
    let registry: GeneratorRegistry;
    let generator: TestCaseGenerator;

    beforeEach(() => {
        registry = new GeneratorRegistry();
        registry.register('ZodString', new StringGenerator());
        registry.register('ZodNumber', new NumberGenerator());
        registry.register('ZodOptional', new OptionalGenerator());
        registry.register('ZodNullable', new NullableGenerator());
        generator = new TestCaseGenerator(registry);
    });

    describe('valid', () => {
        it('should generate valid cases for optional string including undefined', () => {
            const schema = z.string().optional();
            const result = generator.valid(schema);

            expect(result.some(r => r.value === undefined)).to.be.true;
            expect(result.some(r => typeof r.value === 'string')).to.be.true;
            expect(result.length).to.be.greaterThan(1);
        });

        it('should generate valid cases for nullable string including null', () => {
            const schema = z.string().nullable();
            const result = generator.valid(schema);

            expect(result.some(r => r.value === null)).to.be.true;
            expect(result.some(r => typeof r.value === 'string')).to.be.true;
            expect(result.length).to.be.greaterThan(1);
        });

        it('should generate valid cases for nullable and optional string including null and undefined', () => {
            const schema = z.string().nullable().optional();
            const result = generator.valid(schema);

            expect(result.some(r => r.value === null)).to.be.true;
            expect(result.some(r => r.value === undefined)).to.be.true;
            expect(result.some(r => typeof r.value === 'string')).to.be.true;
            expect(result.length).to.be.greaterThan(2);
        });

        it('should generate valid cases for non-optional, non-nullable types', () => {
            const schema = z.string();
            const result = generator.valid(schema);

            expect(result.every(r => typeof r.value === 'string')).to.be.true;
            expect(result.some(r => r.value === undefined)).to.be.false;
            expect(result.some(r => r.value === null)).to.be.false;
        });
    });

    describe('invalid', () => {
        it('should generate invalid cases for optional string excluding undefined', () => {
            const schema = z.string().optional();
            const result = generator.invalid(schema);

            expect(result.every(r => r.value !== undefined)).to.be.true;
            expect(result.some(r => typeof r.value !== 'string')).to.be.true;
        });

        it('should generate invalid cases for nullable string excluding null', () => {
            const schema = z.string().nullable();
            const result = generator.invalid(schema);

            expect(result.every(r => r.value !== null)).to.be.true;
            expect(result.some(r => typeof r.value !== 'string')).to.be.true;
        });

        it('should generate invalid cases for nullable and optional string excluding null and undefined', () => {
            const schema = z.string().nullable().optional();
            const result = generator.invalid(schema);

            expect(result.every(r => r.value !== null && r.value !== undefined)).to.be.true;
            expect(result.some(r => typeof r.value !== 'string')).to.be.true;
        });

        it('should generate invalid cases for non-optional, non-nullable types', () => {
            const schema = z.string();
            const result = generator.invalid(schema);

            expect(result.some(r => typeof r.value !== 'string')).to.be.true;
        });
    });
});