import {z} from "zod";
import {TestCaseGenerator} from "../src/generators/generator";

const gen = new TestCaseGenerator();
const b = z.boolean();

const tests = gen.valid(b);
console.log(tests)

const invalidTest = gen.invalid(b);
console.log(invalidTest);