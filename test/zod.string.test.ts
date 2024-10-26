import {expect} from 'chai';
import {z} from 'zod';
import {StringGenerator} from '@/stringGenerator';
import {createId, isCuid} from '@paralleldrive/cuid2';
import {TestCase} from "@/types";

describe('StringGenerator', () => {
    let generator: StringGenerator;

    beforeEach(() => {
        generator = new StringGenerator();
    });

    describe('valid', () => {
        it('should generate a valid string', () => {
            const schema = z.string();
            const result = generator.valid(schema);
            expect(result).to.have.lengthOf(1);
            expect(result[0].value).to.be.a('string');
            expect(result[0].isValid).to.be.true;
        });

        it('should generate a valid string with min length', () => {
            const schema = z.string().min(5);
            const result = generator.valid(schema);
            expect(result[0].value).to.have.lengthOf.at.least(5);
        });

        it('should generate a valid string with max length', () => {
            const schema = z.string().max(10);
            const result = generator.valid(schema);
            expect(result[0].value).to.have.lengthOf.at.most(10);
        });

        it('should generate a valid emoji', () => {
            const schema = z.string().emoji();
            const result = generator.valid(schema);
            expect(result).to.have.lengthOf.at.least(1);
            expect(result[0].value).to.match(/\p{Emoji}/u);
            expect(result[0].isValid).to.be.true;
        });

        it('should generate a valid string with exact length', () => {
            const schema = z.string().length(5);
            const result = generator.valid(schema);
            expect(result).to.have.lengthOf.at.least(1);
            expect(result[0].value).to.have.lengthOf(5);
            expect(result[0].isValid).to.be.true;
        });

        it('should generate a valid email', () => {
            const schema = z.string().email();
            const result = generator.valid(schema);
            expect(result[0].value).to.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
        });

        it('should generate a valid URL', () => {
            const schema = z.string().url();
            const result = generator.valid(schema);
            expect(result[0].value).to.match(/^https?:\/\/.+/);
        });

        it('should generate a valid UUID', () => {
            const schema = z.string().uuid();
            const result = generator.valid(schema);
            expect(result[0].value).to.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
        });

        it('should generate a valid cuid', () => {
            const schema = z.string().cuid();
            const result = generator.valid(schema);
            expect(isCuid(result[0].value), `${result[0].value} is not a valid cuid`).to.be.true;
        });

        it('should generate a valid cuid2', () => {
            const schema = z.string().cuid2();
            const result = generator.valid(schema);
            expect(isCuid(result[0].value), `${result[0].value} is not a valid cuid2`).to.be.true;
        });

        it('should generate a valid ulid', () => {
            const schema = z.string().ulid();
            const result = generator.valid(schema);
            expect(result[0].value).to.match(/^[0-9A-HJKMNP-TV-Z]{26}$/);
        });

        it('should generate a valid string matching regex', () => {
            const schema = z.string().regex(/^[a-z]{3}$/);
            const result = generator.valid(schema);
            expect(result[0].value).to.match(/^[a-z]{3}$/);
        });

        it('should generate a valid string starting with', () => {
            const schema = z.string().startsWith('foo');
            const result = generator.valid(schema);
            expect(result[0].value.startsWith('foo')).to.be.true;
        });

        it('should generate a valid string ending with', () => {
            const schema = z.string().endsWith('bar');
            const result = generator.valid(schema);
            expect(result[0].value.endsWith('bar')).to.be.true;
        });
    });

    describe('invalid', () => {
        it('should generate an invalid string (not a string)', () => {
            const schema = z.string();
            const result = generator.invalid(schema);
            const notStringCase = result.find(c => c.description.includes('a non-string'));
            expect(notStringCase).to.exist;
            expect(notStringCase!.value).to.not.be.a('string');
            expect(notStringCase!.isValid).to.be.false;
            expect(notStringCase!.expectedMessage).to.equal('Expected string, received number');
        });

        it('should generate an invalid string (too short)', () => {
            const schema = z.string().min(5);
            const result = generator.invalid(schema);
            const shortCase = result.find(c => c.description.includes('too short'));
            expect(shortCase).to.exist;
            expect(shortCase!.value).to.have.lengthOf.below(5);
            expect(shortCase!.isValid).to.be.false;
            expect(shortCase!.expectedMessage).to.match(/String must contain at least 5 character\(s\)/);
        });

        it('should generate an invalid string (too long)', () => {
            const schema = z.string().max(5);
            const result = generator.invalid(schema);
            const longCase = result.find(c => c.description.includes('too long'));
            expect(longCase).to.exist;
            expect(longCase!.value).to.have.lengthOf.above(5);
            expect(longCase!.isValid).to.be.false;
            expect(longCase!.expectedMessage).to.match(/String must contain at most 5 character\(s\)/);
        });

        it('should generate invalid cases for emoji', () => {
            const schema = z.string().emoji();
            const result = generator.invalid(schema);
            expect(result).to.have.lengthOf.at.least(2);
            expect(result.some(tc => tc.value === 'not-an-emoji' && !tc.isValid)).to.be.true;
        });

        it('should generate invalid cases for exact length', () => {
            const schema = z.string().length(5);
            const result = generator.invalid(schema);
            expect(result).to.have.lengthOf.at.least(2);
            expect(result.some(tc => tc.value.length < 5)).to.be.true;
            expect(result.some(tc => tc.value.length > 5)).to.be.true;
            expect(result.every(tc => !tc.isValid)).to.be.true;
        });

        it('should generate an invalid email', () => {
            const schema = z.string().email();
            const result = generator.invalid(schema);
            const invalidEmail = result.find(c => c.description.includes('invalid email'));
            expect(invalidEmail).to.exist;
            expect(invalidEmail!.isValid).to.be.false;
            expect(invalidEmail!.expectedMessage).to.equal('Invalid email');
        });

        it('should generate an invalid URL', () => {
            const schema = z.string().url();
            const result = generator.invalid(schema);
            const invalidUrl = result.find(c => c.description.includes('invalid URL'));
            expect(invalidUrl).to.exist;
            expect(invalidUrl!.isValid).to.be.false;
            expect(invalidUrl!.expectedMessage).to.equal('Invalid url');
        });

        it('should generate an invalid UUID', () => {
            const schema = z.string().uuid();
            const result = generator.invalid(schema);
            const invalidUuid = result.find(c => c.description.includes('invalid UUID'));
            expect(invalidUuid).to.exist;
            expect(invalidUuid!.isValid).to.be.false;
            expect(invalidUuid!.expectedMessage).to.equal('Invalid uuid');
        });

        it('should generate an invalid string not matching regex', () => {
            const schema = z.string().regex(/^[a-z]{3}$/);
            const result = generator.invalid(schema);
            const invalidRegex = result.find(c => c.description.includes('not matched with regex'));
            expect(invalidRegex).to.exist;
            expect(invalidRegex!.isValid).to.be.false;
            expect(invalidRegex!.expectedMessage).to.equal('Invalid');
        });

        it('should generate an invalid string not starting with', () => {
            const schema = z.string().startsWith('foo', 'Invalid');
            const result = generator.invalid(schema);
            const invalidStart = result.find(c => c.description.includes('not start with'));
            expect(invalidStart).to.exist;
            expect(invalidStart!.isValid).to.be.false;
            expect(invalidStart!.expectedMessage).to.equal('Invalid');
            expect(invalidStart!.value.startsWith('foo')).to.be.false;
        });

        it('should generate an invalid string not ending with', () => {
            const schema = z.string().endsWith('bar', 'Invalid');
            const result = generator.invalid(schema);
            const invalidEnd = result.find(c => c.description.includes('not end with'));
            expect(invalidEnd).to.exist;
            expect(invalidEnd!.isValid).to.be.false;
            expect(invalidEnd!.expectedMessage).to.equal('Invalid');
            expect(invalidEnd!.value.endsWith('bar')).to.be.false;
        });

        it('should generate invalid cases for CUID', () => {
            const schema = z.string().cuid();
            const result = generator.invalid(schema);
            expect(result).to.have.lengthOf.at.least(1);
            expect(result.some(tc => tc.value === 'invalid-id')).to.be.true;
            expect(result.every(tc => !tc.isValid)).to.be.true;
        });

        it('should generate invalid cases for CUID2', () => {
            const schema = z.string().cuid2();
            const result = generator.invalid(schema);
            expect(result).to.have.lengthOf.at.least(1);
            expect(result.some(tc => tc.value === 'invalid-id')).to.be.true;
            expect(result.every(tc => !tc.isValid)).to.be.true;
        });

        it('should generate invalid cases for ULID', () => {
            const schema = z.string().ulid();
            const result = generator.invalid(schema);
            expect(result).to.have.lengthOf.at.least(1);
            expect(result.some(tc => tc.value === 'invalid-id')).to.be.true;
            expect(result.every(tc => !tc.isValid)).to.be.true;
        });
    });

    describe('integration with Zod', () => {
        it('should generate cases that align with Zod validation', () => {
            const schema = z.string();
            const allCases = [...generator.valid(schema), ...generator.invalid(schema)];

            allCases.forEach((testCase: TestCase) => {
                const result = schema.safeParse(testCase.value);
                expect(result.success).to.equal(testCase.isValid);
            });
        });
    });
});