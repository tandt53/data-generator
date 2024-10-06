// import { z } from "zod";
// import {StringGenerator} from "../src/generators/stringGenerator";
//
// // Emoji schema
// const emojiSchema = z.string().emoji();
// console.log(StringGenerator.valid(emojiSchema));
// console.log(StringGenerator.invalid(emojiSchema));
//
// // Nanoid schema
// const nanoidSchema = z.string().nanoid();
// console.log(StringGenerator.valid(nanoidSchema));
// console.log(StringGenerator.invalid(nanoidSchema));
//
// // CUID schema
// const cuidSchema = z.string().cuid();
// console.log(StringGenerator.valid(cuidSchema));
// console.log(StringGenerator.invalid(cuidSchema));
//
// // CUID2 schema
// const cuid2Schema = z.string().cuid2();
// console.log(StringGenerator.valid(cuid2Schema));
// console.log(StringGenerator.invalid(cuid2Schema));
//
// // ULID schema
// const ulidSchema = z.string().ulid();
// console.log(StringGenerator.valid(ulidSchema));
// console.log(StringGenerator.invalid(ulidSchema));
//
// // Base64 schema
// const base64Schema = z.string().base64();
// console.log(StringGenerator.valid(base64Schema));
// console.log(StringGenerator.invalid(base64Schema));
//
// // IP schema
// const ipSchema = z.string().ip();
// console.log(StringGenerator.valid(ipSchema));
// console.log(StringGenerator.invalid(ipSchema));
//
// // Datetime schema
// const datetimeSchema = z.string().datetime();
// console.log(StringGenerator.valid(datetimeSchema));
// console.log(StringGenerator.invalid(datetimeSchema));
//
// // Date schema
// const dateSchema = z.string().date();
// console.log(StringGenerator.valid(dateSchema));
// console.log(StringGenerator.invalid(dateSchema));
//
// // Time schema
// const timeSchema = z.string().time();
// console.log(StringGenerator.valid(timeSchema));
// console.log(StringGenerator.invalid(timeSchema));
//
// // Regex schema
// const regexSchema = z.string().regex(/^[a-z]{3}$/);
// console.log(StringGenerator.valid(regexSchema));
// console.log(StringGenerator.invalid(regexSchema));
//
// // StartsWith schema
// const startsWithSchema = z.string().startsWith("hello");
// console.log(StringGenerator.valid(startsWithSchema));
// console.log(StringGenerator.invalid(startsWithSchema));
//
// // EndsWith schema
// const endsWithSchema = z.string().endsWith("world");
// console.log(StringGenerator.valid(endsWithSchema));
// console.log(StringGenerator.invalid(endsWithSchema));