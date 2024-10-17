import {ZGenerator} from "@/registry";
import {ZodOptional} from "zod";
import {TestCase} from "@/types";

export class OptionalGenerator implements ZGenerator<ZodOptional<any>> {
    valid(schema: ZodOptional<any>): TestCase[] {
        return [{
            description: "valid undefined for optional",
            value: undefined,
            isValid: true
        }];
    }

    invalid(schema: ZodOptional<any>): TestCase[] {
        return [];
    }
}
