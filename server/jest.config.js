module.exports = {
    testEnvironment: 'node',
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/server.js',
        '!src/database/connection.js',
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
    setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js'],
    testTimeout: 10000,
};
