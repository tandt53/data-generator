import {expect} from 'chai';
import {z} from 'zod';
import {StringGenerator} from '../src/stringGenerator';

describe('StringGenerator - Date/Time Validation', () => {
    let generator: StringGenerator;

    beforeEach(() => {
        generator = new StringGenerator();
    });

    describe('datetime validation', () => {
        const schema = z.string().datetime();

        it('should generate valid datetime test cases', () => {
            const validCases = generator.valid(schema);

            console.log('\nValid datetime cases:');
            validCases.forEach(tc => console.log(tc.description));

            expect(validCases).to.have.length.at.least(4);
            expect(validCases.every(tc => tc.isValid)).to.be.true;

            // Check specific scenarios
            const now = new Date();
            // expect(validCases.some(tc => tc.value.includes('T00:00:00'))).to.be.true;
            expect(validCases.some(tc => tc.description === 'Should accept end of year' && tc.value.includes(new Date(now.getFullYear(), 11, 31, 23, 59, 59).toISOString()))).to.be.true;
            expect(validCases.some(tc => tc.description === 'Should accept current datetime' && tc.value.includes(now.toISOString().split(':')[0]))).to.be.true;
            expect(validCases.some(tc => tc.description === 'Should accept start of year' && tc.value.includes(new Date(now.getFullYear(), 0, 1).toISOString()))).to.be.true;
        });

        it('should generate invalid datetime test cases', () => {
            const invalidCases = generator.invalid(schema);

            console.log('\nInvalid datetime cases:');
            invalidCases.forEach(tc => console.log(tc.description));

            expect(invalidCases).to.have.length.at.least(5);
            expect(invalidCases.every(tc => !tc.isValid)).to.be.true;

            // Check specific error scenarios
            expect(invalidCases.some(tc => !tc.value.toString().endsWith('Z'))).to.be.true;
            expect(invalidCases.some(tc => tc.value.includes('13-'))).to.be.true;
            expect(invalidCases.some(tc => tc.value.includes('32T'))).to.be.true;
        });
    });

    describe('date validation', () => {
        const schema = z.string().date();

        it('should generate valid date test cases', () => {
            const validCases = generator.valid(schema);

            console.log('\nValid date cases:');
            validCases.forEach(tc => console.log(tc.description));

            expect(validCases).to.have.length.at.least(4);
            expect(validCases.every(tc => tc.isValid)).to.be.true;

            // Check formats
            validCases.forEach(tc => {
                expect(tc.value).to.match(/^\d{4}-\d{2}-\d{2}$/);
            });
        });

        it('should generate invalid date test cases', () => {
            const invalidCases = generator.invalid(schema);

            console.log('\nInvalid date cases:');
            invalidCases.forEach(tc => console.log(tc.description));

            expect(invalidCases).to.have.length.at.least(5);
            expect(invalidCases.every(tc => !tc.isValid)).to.be.true;
        });
    });

    describe('time validation', () => {
        const schema = z.string().time();

        it('should generate valid time test cases', () => {
            const validCases = generator.valid(schema);

            console.log('\nValid time cases:');
            validCases.forEach(tc => console.log(tc.description));

            expect(validCases).to.have.length.at.least(4);
            expect(validCases.every(tc => tc.isValid)).to.be.true;

            // Check formats
            validCases.forEach(tc => {
                expect(tc.value).to.match(/^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/);
            });
        });

        it('should generate invalid time test cases', () => {
            const invalidCases = generator.invalid(schema);

            console.log('\nInvalid time cases:');
            invalidCases.forEach(tc => console.log(tc.description));

            expect(invalidCases).to.have.length.at.least(5);
            expect(invalidCases.every(tc => !tc.isValid)).to.be.true;
        });
    });
});
