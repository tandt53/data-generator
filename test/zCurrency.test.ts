// Example usage
// import {zCurrencyCode, zCurrencyCodeInvalidGenerator, zCurrencyCodeValidGenerator} from "../src/zod/zCurrency";
// import {TestCaseGenerator} from "../src/generators/generator";
//
// const allowedValues = ["IDR", "PHP"];
// const validCases = zCurrencyCodeValidGenerator(allowedValues);
// const invalidCases = zCurrencyCodeInvalidGenerator(allowedValues);
//
// console.log("Valid Cases:", validCases);
// console.log("Invalid Cases:", invalidCases);

// const validCases2 = zCurrencyCodeValidGenerator();
// const invalidCases2 = zCurrencyCodeInvalidGenerator();
//
// console.log("Valid Cases2:", validCases2);
// console.log("Invalid Cases2:", invalidCases2);

// const schema = zCurrencyCode(allowedValues);
// console.log(new TestCaseGenerator().generateValidCases(schema));

// const schema2 = zCurrencyCode();
// console.log(new TestCaseGenerator().invalid(schema2));