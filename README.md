# Test Data Generator

This tool is designed to generate test data for various data types, including strings, numbers, booleans, dates, and more.

- It uses the [Zod](https://github.com/colinhacks/zod) library to define schemas for each data type, and then generates test cases based on the schemas.
- Data is generated using the [Faker.js](https://github.com/Marak/Faker.js) library, which provides a wide range of data generation options.

Example usage:
- Input:
```typescript
const numberType = z.number().min(1).max(10);
const testCases = new TestCaseGenerator().valid(numberType);
console.log(JSON.stringify(testCases));
```

- Output:
```json
[
  {"description": "valid number equals to minimum", "input": 1, "isValid": true},
  {"description": "valid number equals to maximum", "input": 10, "isValid": true},
  {"description": "valid number (min+1)", "input": 2, "isValid": true},
  {"description": "valid number (max-1)", "input": 9, "isValid": true},
  {"description": "valid floating number (min + 0.01)", "input": 1.01, "isValid": true},
  {"description": "valid floating number (max-0.01)", "input": 9.99,"isValid": true}
]
[
  {"description": "invalid string", "input": "not-a-number", "isValid": false},
  {"description": "invalid boolean", "input": true, "isValid": false},
  {"description": "invalid array", "input": [1, 2, 3], "isValid": false},
  {"description": "invalid object", "input": {"a": 1, "b": 2}, "isValid": false},
  {"description": "invalid null", "input": null, "isValid": false},
  {"description": "invalid undefined", "inputsValid": false},
  {"description": "invalid number less than minimum (1)","input": 0,"isValid": false},
  {"description": "invalid floating number less than minimum (1)", "input": 0.99, "isValid": false},
  {"description": "invalid number greater than maximum (10)", "input": 11, "isValid": false},
  {"description": "invalid floating number greater than maximum (10)", "input": 10.01, "isValid": false}
]
```