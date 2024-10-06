import {z} from "zod";
import {parse, format, isBefore, isAfter, set} from "date-fns";
import {TestCase} from "../types";

export const REGEX_ZTIME = /time.(before|after)_(\d+)h(\d+)m(\d+)s_(.+)/;
type TimeConstraint = {
    hours?: number;
    minutes?: number;
    seconds?: number;
    isTimeBefore?: boolean;
    timeFormat?: string;
    message?: string;
};

export const zTime = ({
    hours = 0,
    minutes = 0,
    seconds = 0,
    isTimeBefore = true,
    timeFormat = "HH:mm:ss",
    message,
}: TimeConstraint) => {
    const currentDate = new Date();
    const constraintTime = set(currentDate, { hours, minutes, seconds });

    const compareFunc = isTimeBefore ? isBefore : isAfter;
    const compareWord = isTimeBefore ? "before" : "after";

    return z.string()
        .refine(
            (val) => {
                try {
                    const time = parse(val, timeFormat, new Date());
                    const timeToCompare = set(currentDate, {
                        hours: time.getHours(),
                        minutes: time.getMinutes(),
                        seconds: time.getSeconds()
                    });
                    return compareFunc(timeToCompare, constraintTime);
                } catch {
                    return false;
                }
            },
            {
                message: message || `Time must be ${compareWord} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
            }
        )
        .describe(`time.${compareWord}_${hours}h${minutes}m${seconds}s_${timeFormat}`); // If changing the time format, update the REGEX_ZTIME regex as well
};

export const zTimeValidGenerator = (domain: string): TestCase[] => {
    const testCases: TestCase[] = [];
    const [constraint, timeParams, timeFormat] = domain.slice(5).split("_");
    const hours = Number(timeParams.split("h")[0]);
    const minutes = Number(timeParams.split("h")[1].split("m")[0]);
    const seconds = Number(timeParams.split("h")[1].split("m")[1].split("s")[0]);

    const currentDate = new Date();
    let time: Date;

    if (constraint === "before") {
        time = set(currentDate, { hours: hours - 1, minutes, seconds });
    } else {
        time = set(currentDate, { hours: hours + 1, minutes, seconds });
    }

    const formattedTime = format(time, timeFormat);
    testCases.push({
        description: `valid time ${constraint} ${hours}h${minutes}m${seconds}s using ${timeFormat} format`,
        input: formattedTime,
        isValid: true
    });
    return testCases;
};

export const zTimeInvalidGenerator = (domain: string): TestCase[] => {
    const testCases: TestCase[] = [];
    const [constraint, timeParams, timeFormat] = domain.slice(5).split("_");
    const hours = Number(timeParams.split("h")[0]);
    const minutes = Number(timeParams.split("h")[1].split("m")[0]);
    const seconds = Number(timeParams.split("h")[1].split("m")[1].split("s")[0]);

    const currentDate = new Date();
    let time: Date;

    if (constraint === "before") {
        time = set(currentDate, { hours: hours + 1, minutes, seconds });
    } else {
        time = set(currentDate, { hours: hours - 1, minutes, seconds });
    }

    const formattedTime = format(time, timeFormat);
    testCases.push({
        description: `invalid time ${constraint} ${hours}h${minutes}m${seconds}s using ${timeFormat} format`,
        input: formattedTime,
        isValid: false
    });

    //TODO: Add a test case with an invalid format
    testCases.push({
        description: `invalid format for time ${constraint} ${hours}h${minutes}m${seconds}s`,
        input: "invalid-time-format",
        isValid: false
    });

    return testCases;
};

// Export both generators
export const zTimeGenerators = {
    valid: zTimeValidGenerator,
    invalid: zTimeInvalidGenerator
};