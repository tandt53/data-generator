// // Example usage:
// import {zDate} from "../src/zod/zDate";
// import {DOMAINS} from "../src/domains";
// import {enUS, fr} from "date-fns/locale";
// import {TestCaseGenerator} from "../src/generators/generator";
//
// export const zDateBefore18Years = zDate({
//     years: 18,
//     dateFormat: "yyyy-MM-dd",
// });

// const validDates = new TestCaseGenerator().valid(zDateBefore18Years);
// console.log(validDates);
// //
// // export const zDateAfter6Months = createDateSchema({
// //     months: 6,
// //     isDateBefore: false,
// //     dateFormat: "dd/MM/yyyy",
// //     locale: fr
// // });
// //
// // // You can also create more specific date schemas
// // export const zBirthDate = createDateSchema({
// //     years: 18,
// //     isDateBefore: true,
// //     dateFormat: "yyyy-MM-dd"
// // }).describe(DOMAINS.DATE.BIRTHDATE);
// //
// // export const zFutureAppointment = createDateSchema({
// //     days: 1,
// //     isDateBefore: false,
// //     dateFormat: "yyyy-MM-dd'T'HH:mm:ss"
// // }).describe(DOMAINS.DATE.FUTURE);