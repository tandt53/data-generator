// import {z} from "zod";
// import {zDate} from "../src/zod/zDate";
// import {enUS} from "date-fns/locale";
// const zStringOptional = z.string().min(2).max(50).optional();
// const zStringNullable = z.string().min(2).max(50).nullable();
//
//
// function parseZodSchema(schema: z.ZodType<any>): any {
//     if (schema instanceof z.ZodString) {
//         // if schema is ZodString, then add optional and nullable test cases after generating string test cases
//         console.log('string');
//     } else if (schema instanceof z.ZodNumber) {
//         // if schema is ZodNumber, then add optional and nullable test cases after generating number test cases
//         console.log('number');
//     } else if (schema instanceof z.ZodBoolean) {
//         // if schema is ZodBoolean, then add optional and nullable test cases after generating boolean test cases
//         console.log('boolean');
//     } else if (schema instanceof z.ZodDate) {
//         // if schema is ZodDate, then add optional and nullable test cases after generating date test cases
//         console.log('date');
//     } else if (schema instanceof z.ZodArray) {
//         // if schema is ZodArray, then add optional and nullable test cases after generating array test cases
//         console.log('array');
//     } else if (schema instanceof z.ZodObject) {
//         // if schema is ZodObject, then add optional and nullable test cases after generating object test cases
//         console.log('object');
//     } else if (schema instanceof z.ZodOptional) {
//         console.log('optional');
//         // parseZodSchema(schema._def.innerType);
//         parseZodSchema(schema.unwrap());
//     } else if (schema instanceof z.ZodNullable) {
//         console.log('nullable');
//         // parseZodSchema(schema._def.innerType);
//         parseZodSchema(schema.unwrap());
//     } else if (schema instanceof z.ZodEffects) {
//         console.log('effects');
//         parseZodSchema(schema._def.schema);
//         // parseZodSchema(schema.unwrap());
//     }
// }
//
// // parseZodSchema(zStringOptional);
// // parseZodSchema(zStringNullable);
// parseZodSchema(zDate({
//     years: 18,
//     dateFormat: "yyyy-MM-dd",
//     locale: enUS
// }));