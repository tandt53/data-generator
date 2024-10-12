import {z} from "zod";
import {parse, format, isBefore, isAfter, addYears, addMonths, addDays, subYears, subMonths, subDays} from "date-fns";
import {TestCase} from "../types";

export const REGEX_ZDATE = /date.(before|after)_(\d+)y(\d+)m(\d+)d_(.+)/;
type DateConstraint = {
    years?: number;
    months?: number;
    days?: number;
    isDateBefore?: boolean;
    dateFormat?: string;
    message?: string;
};

export const zDate = ({
                          years = 0,
                          months = 0,
                          days = 0,
                          isDateBefore = true,
                          dateFormat = "yyyy-MM-dd",
                          message,
                      }: DateConstraint) => {
    const currentDate = new Date();
    const constraintDate = isDateBefore
        ? subDays(subMonths(subYears(currentDate, years), months), days)
        : addDays(addMonths(addYears(currentDate, years), months), days);

    const compareFunc = isDateBefore ? isBefore : isAfter;
    const compareWord = isDateBefore ? "before" : "after";

    return z.string()
        .refine(
            (val) => {
                try {
                    const date = parse(val, dateFormat, new Date());
                    return compareFunc(date, currentDate) && (isDateBefore ? isBefore(date, constraintDate) : isAfter(date, constraintDate));
                } catch {
                    return false;
                }
            },
            {
                message: message || `Date must be ${compareWord} current date and within ${years} years, ${months} months, and ${days} days`,
            }
        )
        .describe(`date.${compareWord}_${years}y${months}m${days}d_${dateFormat}`); // If changing the date format, update the REGEX_ZDATE regex as well
};


export const zDateValidGenerator = (domain: string): TestCase[] => {
    const testCases: TestCase[] = [];
    const [constraint, dateParams, dateFormat, locale] = domain.slice(5).split("_");
    const years = Number(dateParams.split("y")[0]);
    const months = Number(dateParams.split("y")[1].split("m")[0]);
    const days = Number(dateParams.split("y")[1].split("m")[1].split("d")[0]);

    const currentDate = new Date();
    let date: Date;

    if (constraint === "before") {
        // before yeas, months, days
        // date = sub(currentDate, years, months, days);
        testCases.push(sub(currentDate, years, months, days, "before", dateFormat));

        // before years, months, days + 1
        testCases.push(sub(currentDate, years, months, days + 1, "before", dateFormat));

    } else {
        // after years, months, days
        testCases.push(add(currentDate, years, months, days, "after", dateFormat));

        // after years, months, days - 1
        testCases.push(testcase(currentDate, years, months, days - 1, "after", dateFormat));
    }
    return testCases;
}

export const zDateInvalidGenerator = (domain: string) => {
    const testCases: TestCase[] = [];
    const [constraint, dateParams, dateFormat, locale] = domain.slice(5).split("_");
    const years = Number(dateParams.split("y")[0]);
    const months = Number(dateParams.split("y")[1].split("m")[0]);
    const days = Number(dateParams.split("y")[1].split("m")[1].split("d")[0]);

    const currentDate = new Date();
    let date: Date;

    if (constraint === "before") {
        // before yeas, months, days
        testCases.push(sub(currentDate, years, months, days - 1, "before", dateFormat, false));

    } else {
        // after years, months, days
        testCases.push(add(currentDate, years, months, days + 1, "after", dateFormat, false));
    }


    // Example invalid date cases
    testCases.push({
        description: `Invalid date: "not-a-date"`,
        input: "not-a-date",
        isValid: false,
    });

    testCases.push({
        description: `Invalid date: 12345`,
        input: 12345,
        isValid: false,
    });

    testCases.push({
        description: `Invalid date: null`,
        input: null,
        isValid: false,
    });

    testCases.push({
        description: `Invalid date: undefined`,
        input: undefined,
        isValid: false,
    });

    testCases.push({
        description: `Invalid date: NaN`,
        input: NaN,
        isValid: false,
    });

    testCases.push({
        description: `Invalid date: new Date("2023-02-30")`, // Invalid date (February 30th does not exist)
        input: new Date("2023-02-30"),
        isValid: false,
    });

    testCases.push({
        description: `Invalid date: new Date("2023-13-01")`, // Invalid month (13)
        input: new Date("2023-13-01"),
        isValid: false,
    });

    testCases.push({
        description: `Invalid date: new Date("2023-01-32")`, // Invalid day (32)
        input: new Date("2023-01-32"),
        isValid: false,
    });

    return testCases;
}

function sub(date: Date, years: number, months: number, days: number, constraint: string, dateFormat: string, isValid = true): TestCase {
    const d = subYears(subMonths(subDays(date, days), months), years);
    return testcase(d, years, months, days,  constraint,dateFormat, isValid);

}

function add(date: Date, years: number, months: number, days: number, constraint: string, dateFormat: string, isValid = true): TestCase {
    const d = addYears(addMonths(addDays(date, days), months), years);
    return testcase(d, years, months, days,  constraint, dateFormat, isValid);
}

function testcase(date: Date, years: number, months: number, days: number, constraint: string, dateFormat: string, isValid = true): TestCase {
    const formattedDate = format(date, dateFormat);
    return {
        description: `${isValid ? 'valid' : 'invalid'} date ${constraint} ${years}y${months}m${days}d using ${dateFormat} format`,
        input: formattedDate,
        isValid: true
    };
}

