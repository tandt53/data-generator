import { expect } from 'chai';
import { z } from 'zod';
import { NumberGenerator } from '@/numberGenerator';

describe('NumberGenerator', () => {
    let generator: NumberGenerator;

    beforeEach(() => {
        generator = new NumberGenerator();
    });

    describe('valid', () => {
        it('should generate a valid number', () => {
            const schema = z.number();
            const result = generator.valid(schema);
            expect(result).to.have.lengthOf.at.least(1);
            expect(result[0].value).to.be.a('number');
            expect(result[0].isValid).to.be.true;
        });

        it('should generate a valid integer', () => {
            const schema = z.number().int();
            const result = generator.valid(schema);
            expect(result[0].value).to.be.a('number');
            expect(Number.isInteger(result[0].value)).to.be.true;
        });

        it('should generate a valid number within min and max', () => {
            const schema = z.number().min(10).max(20);
            const result = generator.valid(schema);
            expect(result[0].value).to.be.at.least(10);
            expect(result[0].value).to.be.at.most(20);
        });

        it('should generate a valid number that is a multiple of a given value', () => {
            const schema = z.number().multipleOf(5);
            const result = generator.valid(schema);
            expect(result[0].value % 5).to.equal(0);
        });

        it('should generate a valid finite number', () => {
            const schema = z.number().finite();
            const result = generator.valid(schema);
            expect(Number.isFinite(result[0].value)).to.be.true;
        });
    });

    describe('invalid', () => {
        it('should generate invalid non-number types', () => {
            const schema = z.number();
            const result = generator.invalid(schema);
            const types = result.map(r => typeof r.value);
            expect(types).to.include('string');
            expect(types).to.include('boolean');
            expect(types).to.include('object');
        });

        it('should generate an invalid number for integer schema', () => {
            const schema = z.number().int();
            const result = generator.invalid(schema);
            const floatCase = result.find(r => !Number.isInteger(r.value));
            expect(floatCase).to.exist;
            expect(floatCase!.isValid).to.be.false;
            expect(floatCase!.expectedMessage).to.include('Expected number');
        });

        it('should generate numbers outside of min-max range', () => {
            const schema = z.number().min(10).max(20);
            const result = generator.invalid(schema);
            const tooSmall = result.find(r => r.value < 10);
            const tooBig = result.find(r => r.value > 20);
            expect(tooSmall).to.exist;
            expect(tooSmall!.isValid).to.be.false;
            expect(tooSmall!.expectedMessage).to.include('Number must be greater than or equal to 10');
            expect(tooBig).to.exist;
            expect(tooBig!.isValid).to.be.false;
            expect(tooBig!.expectedMessage).to.include('Number must be less than or equal to 20');
        });

        it('should generate a number that is not a multiple of a given value', () => {
            const schema = z.number().multipleOf(5);
            const result = generator.invalid(schema);
            const notMultiple = result.find(r => r.value % 5 !== 0);
            expect(notMultiple).to.exist;
            expect(notMultiple!.isValid).to.be.false;
            expect(notMultiple!.expectedMessage).to.include('Number must be a multiple of 5');
        });

        it('should generate non-finite numbers for finite schema', () => {
            const schema = z.number().finite();
            const result = generator.invalid(schema);
            const infiniteCase = result.find(r => !Number.isFinite(r.value));
            expect(infiniteCase).to.exist;
            expect(infiniteCase!.isValid).to.be.false;
            expect(infiniteCase!.expectedMessage).to.include('Number must be finite');
        });
    });

    describe('NumberGenerator with Infinite Bounds', () => {
        let generator: NumberGenerator;

        beforeEach(() => {
            generator = new NumberGenerator();
        });

        it('should generate a valid number with no bounds', () => {
            const schema = z.number();
            const result = generator.valid(schema);
            expect(result[0].value).to.be.a('number');
            expect(result[0].value).to.be.finite;
        });

        it('should generate a valid number with only lower bound', () => {
            const schema = z.number().min(0);
            const result = generator.valid(schema);
            expect(result[0].value).to.be.a('number');
            expect(result[0].value).to.be.at.least(0);
            expect(result[0].value).to.be.finite;
        });

        it('should generate a valid number with only upper bound', () => {
            const schema = z.number().max(0);
            const result = generator.valid(schema);
            expect(result[0].value).to.be.a('number');
            expect(result[0].value).to.be.at.most(0);
            expect(result[0].value).to.be.finite;
        });

        it('should generate a valid multiple of with infinite bounds', () => {
            const schema = z.number().multipleOf(5);
            const result = generator.valid(schema);
            expect(result[0].value).to.be.a('number');
            expect(result[0].value % 5).to.equal(0);
            expect(result[0].value).to.be.finite;
        });
    });
});