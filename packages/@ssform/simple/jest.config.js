// jest.config.js
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    // roots: [ // 范围
        // '<rootDir>/src',
        // '<rootDir>/__tests__',
    // ],
    testMatch: [
        '<rootDir>/__tests__/**/*.test.ts',
        '<rootDir>/__tests__/**/*.spec.ts',
    ],
};
