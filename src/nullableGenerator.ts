import {ZodNullable} from "zod";
import {TestCase} from "@/types";
import {ZGenerator} from "@/registry";

export class NullableGenerator implements ZGenerator<ZodNullable<any>> {
    valid(schema: ZodNullable<any>): TestCase[] {
        return [{
            description: "valid null for nullable",
            value: null,
            isValid: true
        }];
    }

    invalid(schema: ZodNullable<any>): TestCase[] {
        return [];
    }
}