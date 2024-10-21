import { expect } from 'chai';
import { z } from 'zod';
import { EnumGenerator } from '@/enumGenerator';

describe('EnumGenerator', () => {
    let generator: EnumGenerator;

    beforeEach(() => {
        generator = new EnumGenerator();
    });

    describe('valid', () => {
        it('should generate valid cases for all enum values', () => {
            const schema = z.enum(['Red', 'Green', 'Blue']);
            const result = generator.valid(schema);

            expect(result).to.have.lengthOf(3);
            expect(result.map(tc => tc.value)).to.have.members(['Red', 'Green', 'Blue']);
            expect(result.every(tc => tc.isValid)).to.be.true;
        });

        it('should handle single-value enums', () => {
            const schema = z.enum(['SingleValue']);
            const result = generator.valid(schema);

            expect(result).to.have.lengthOf(1);
            expect(result[0].value).to.equal('SingleValue');
            expect(result[0].isValid).to.be.true;
        });
    });

    describe('invalid', () => {
        it('should generate invalid cases', () => {
            const schema = z.enum(['Red', 'Green', 'Blue']);
            const result = generator.invalid(schema);

            expect(result).to.have.lengthOf.at.least(6);
            expect(result.some(tc => tc.value === 'invalid_enum_value')).to.be.true;
            expect(result.some(tc => typeof tc.value === 'number')).to.be.true;
            expect(result.some(tc => typeof tc.value === 'boolean')).to.be.true;
            expect(result.some(tc => typeof tc.value === 'object')).to.be.true;
            expect(result.some(tc => Array.isArray(tc.value))).to.be.true;
            expect(result.some(tc => typeof tc.value === 'string' && !['Red', 'Green', 'Blue'].includes(tc.value))).to.be.true;
            expect(result.every(tc => !tc.isValid)).to.be.true;
        });

        it('should not generate any valid enum values as invalid cases', () => {
            const schema = z.enum(['Red', 'Green', 'Blue']);
            const result = generator.invalid(schema);

            expect(result.every(tc => !['Red', 'Green', 'Blue'].includes(tc.value))).to.be.true;
        });
    });
});