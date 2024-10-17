import { expect } from 'chai';
import { z } from 'zod';
import { BooleanGenerator } from '@/booleanGenerator';
import { TestCase } from '@/types';

describe('BooleanGenerator', () => {
    let generator: BooleanGenerator;
    let schema: z.ZodBoolean;

    beforeEach(() => {
        generator = new BooleanGenerator();
        schema = z.boolean();
    });

    describe('valid', () => {
        it('should return two valid test cases', () => {
            const validCases = generator.valid(schema);
            expect(validCases).to.have.lengthOf(2);
        });

        it('should include true and false as valid values', () => {
            const validCases = generator.valid(schema);
            const values = validCases.map(c => c.value);
            expect(values).to.include(true);
            expect(values).to.include(false);
        });

        it('should mark all cases as valid', () => {
            const validCases = generator.valid(schema);
            expect(validCases.every(c => c.isValid)).to.be.true;
        });
    });

    describe('invalid', () => {
        it('should return the correct number of invalid test cases', () => {
            const invalidCases = generator.invalid(schema);
            expect(invalidCases).to.have.lengthOf(11);
        });

        it('should mark all cases as invalid', () => {
            const invalidCases = generator.invalid(schema);
            expect(invalidCases.every(c => !c.isValid)).to.be.true;
        });

        it('should include various invalid types', () => {
            const invalidCases = generator.invalid(schema);
            const values = invalidCases.map(c => c.value);

            expect(values).to.include('true');
            expect(values).to.include('false');
            expect(values).to.include(1);
            expect(values).to.include(0);
            expect(values).to.include(null);
            expect(values).to.include(undefined);
            expect(values).to.deep.include({});
            expect(values).to.deep.include([]);
            expect(values.some(Number.isNaN)).to.be.true;
            expect(values).to.include(Infinity);
            expect(values).to.include(-Infinity);
        });
    });

    describe('integration with Zod', () => {
        it('should generate cases that align with Zod validation', () => {
            const allCases = [...generator.valid(schema), ...generator.invalid(schema)];

            allCases.forEach((testCase: TestCase) => {
                const result = schema.safeParse(testCase.value);
                expect(result.success).to.equal(testCase.isValid);
            });
        });
    });
});