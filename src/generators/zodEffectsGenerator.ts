import {ZodEffects} from "zod";
import {TestCase} from "../types";
import {REGEX_ZDATE, zDateInvalidGenerator, zDateValidGenerator} from "../zod/zDate";


export class ZodEffectsGenerator {
    valid(schema: ZodEffects<any>): TestCase[] {
        const domain = schema.description
        // handle domain specific tests
        if (domain && REGEX_ZDATE.test(domain)) {
            return zDateValidGenerator(domain);
        }
        return []
    }

    invalid(schema: ZodEffects<any>): TestCase[] {
        const domain = schema.description
        if (domain && REGEX_ZDATE.test(domain)) {
            return zDateInvalidGenerator(domain);
        }
        return []
    }
}