import {z} from "zod";
import {DOMAINS} from "../domains";

// Name types
export const zFirstName = z.string()
    .min(2)
    .max(50)
    .describe(DOMAINS.PERSON.FIRST_NAME);

export const zLastName = z.string()
    .min(2)
    .max(50)
    .describe(DOMAINS.PERSON.LAST_NAME);

export const zEmail = z.string()
    .email()
    .describe(DOMAINS.INTERNET.EMAIL);

// // Date types
// export const zDateISO = z.string()
//     .regex(/^\d{4}-\d{2}-\d{2}$/)
//     .describe("date:ISO");
//
// export const zDateUS = z.string()
//     .regex(/^\d{2}\/\d{2}\/\d{4}$/)
//     .describe("date:US");
//
// // Time types
// export const zTime24 = z.string()
//     .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
//     .describe("time:24");
//
// export const zTime12 = z.string()
//     .regex(/^(0?[1-9]|1[0-2]):[0-5]\d [AP]M$/)
//     .describe("time:12");
//
// // DateTime types
// export const zDateTimeISO = z.string()
//     .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/)
//     .describe("dateTime:ISO");
//
// export const zDateTimeUS = z.string()
//     .regex(/^\d{2}\/\d{2}\/\d{4}, (0?[1-9]|1[0-2]):[0-5]\d [AP]M$/)
//     .describe("dateTime:US");