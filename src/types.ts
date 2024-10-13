
export type TestCase = {
    description: string;
    value: any;
    isValid: boolean;
    expected?: string;
    expectedMessage?: string;
}