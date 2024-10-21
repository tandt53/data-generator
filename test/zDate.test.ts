// // Example usage:
// import {zDate} from "../src/zod/zDate";
// import {TestCaseGenerator} from "../src/generators/generator";
//
// export const zDateBefore18Years = zDate({
//     years: 18,
//     months: 1,
//     days: 1,
//     dateFormat: "yyyy-MM-dd",
// });
//
// const validDates = new TestCaseGenerator().valid(zDateBefore18Years);
// console.log(validDates);
//
// validDates.forEach(date => {
//     zDateBefore18Years.parse(date.value);
// });
//
// const invalidDates = new TestCaseGenerator().invalid(zDateBefore18Years);
// console.log(invalidDates);
//
// invalidDates.forEach(date => {
//     try {
//         zDateBefore18Years.parse(date.value);
//     } catch (error) {
//         console.log("Catch error: ", date.description);
//     }
// });