import {z} from "zod";
import {TestCaseGenerator} from "../src/generators/generator";
import {expect} from "chai";

// const number1 = z.number().min(2).max(8);
// const testCases = new TestCaseGenerator().valid(number1);
// console.log(testCases);
// const inputs = testCases.map(testCase => testCase.input);
// expect(inputs.length).to.be.equals(6);
// expect(inputs).to.have.all.members([2, 8, 3, 7, 2.01, 7.99]);
//
// const number2 = z.number().int().min(1).max(10);
// const testCases2 = new TestCaseGenerator().valid(number2);
// console.log(testCases2);
// const inputs2 = testCases2.map(testCase => testCase.input);
// expect(inputs2.length).to.be.equals(4);
// expect(inputs2).to.have.all.members([1, 10, 2, 9]);

const number3 = z.number().min(1).max(10);
const testCases3 = new TestCaseGenerator().valid(number3);
console.log(JSON.stringify(testCases3, null, 2));
const inputs3 = testCases3.map(testCase => testCase.input);
expect(inputs3.length).to.be.equals(6);

const testcases4 = new TestCaseGenerator().invalid(number3);
console.log(JSON.stringify(testcases4, null, 2));
const inputs4 = testcases4.map(testCase => testCase.input);
expect(inputs4.length).to.be.equals(10);