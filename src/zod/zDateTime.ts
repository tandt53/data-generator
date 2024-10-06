import {z} from "zod";
import {parse, format, isBefore, isAfter, addYears, addMonths, addDays, subYears, subMonths, subDays} from "date-fns";
import {TestCase} from "../types";

type DateTimeConstraint = {
    years?: number;
    months?: number;
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
    isDateBefore?: boolean;
    dateTimeFormat?: string;
    message?: string;
};
export const xDateTime = ({
                              years = 0,
                              months = 0,
                              days = 0,
                              hours = 0,
                              minutes = 0,
                              seconds = 0,
                              isDateBefore = true,
                              dateTimeFormat = "yyyy-MM-dd HH:mm:ss",
                              message,
                          }: DateTimeConstraint) => {
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
                    const date = parse(val, dateTimeFormat, new Date());
                    return compareFunc(date, currentDate) && (isDateBefore ? isAfter(date, constraintDate) : isBefore(date, constraintDate));
                } catch {
                    return false;
                }
            },
            {
                message: message || `Date must be ${compareWord} current date and within ${years} years, ${months} months, and ${days} days`,
            }
        )
        .describe(`date.${compareWord}_${years}y${months}m${days}d_${dateTimeFormat}`); // If changing the date format, update the REGEX_ZDATE regex as well
};


export const zDateTimeValidGenerator = (domain: string): TestCase[] => {
    const testCases: TestCase[] = [];
    const [constraint, dateParams, dateFormat, locale] = domain.slice(5).split("_");
    const years = Number(dateParams.split("y")[0]);
    const months = Number(dateParams.split("y")[1].split("m")[0]);
    const days = Number(dateParams.split("y")[1].split("m")[1].split("d")[0]);

    const currentDate = new Date();
    let date: Date;

    if (constraint === "before") {
        date = subYears(subMonths(subDays(currentDate, days), months), years);
    } else {
        date = addYears(addMonths(addDays(currentDate, days), months), years);
    }

    const formattedDate = format(date, dateFormat);
    testCases.push({
        description: `valid date ${constraint} ${years}y${months}m${days}d using ${dateFormat} format`,
        input: formattedDate,
        isValid: true
    });
    return testCases;
}