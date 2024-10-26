import {expect} from 'chai';
import {z} from 'zod';
import {TestCaseGenerator} from '../src/generator';
import {GeneratorRegistry} from '../src/registry';
import {StringGenerator} from '../src/stringGenerator';
import {NumberGenerator} from '../src/numberGenerator';
import {BooleanGenerator} from '../src/booleanGenerator';
import {EnumGenerator} from '../src/enumGenerator';
import {TestCase} from "@/types";

describe('ZodObject - Multiple Properties', () => {
    let registry: GeneratorRegistry;
    let generator: TestCaseGenerator;

    const schema = z.object({
        name: z.string(),
        age: z.number().optional()
    });
    beforeEach(() => {
        registry = new GeneratorRegistry();
        registry.register('ZodString', new StringGenerator());
        registry.register('ZodNumber', new NumberGenerator());
        registry.register('ZodBoolean', new BooleanGenerator());
        registry.register('ZodEnum', new EnumGenerator());
        generator = new TestCaseGenerator(registry);
    });

    describe('Required and Optional Properties', () => {
        it('string and optional number', () => {
            const stringSchema = z.string();
            const numberSchema = z.number().optional();

            const objectValidCases = generator.valid(schema);
            const stringValidCases = generator.valid(stringSchema);
            const numberValidCases = generator.valid(numberSchema);

            // Should include all individual property test cases plus the combined case
            expect(objectValidCases.length).to.equal(
                stringValidCases.length +
                numberValidCases.length +
                1 // "all fields valid" case
            );

            // Check descriptions include all property test cases
            stringValidCases.forEach(stringCase => {
                expect(objectValidCases.some(objCase =>
                    objCase.description.includes(stringCase.description)
                )).to.be.true;
            });

            numberValidCases.forEach(numberCase => {
                expect(objectValidCases.some(objCase =>
                    objCase.description.includes(numberCase.description)
                )).to.be.true;
            });
        });

        // ... similar tests for other combinations
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