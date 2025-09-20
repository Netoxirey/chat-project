module.exports = {
    env: {
        node: true,
        es2022: true,
        jest: true,
    },
    extends: ['eslint:recommended', 'prettier'],
    plugins: ['prettier'],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    rules: {
        'prettier/prettier': 'error',
        'no-console': 'off', // Allow console statements for server logging
        'no-unused-vars': [
            'error',
            { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
        ],
        'prefer-const': 'error',
        'no-var': 'error',
        'object-shorthand': 'error',
        'prefer-template': 'error',
    },
};
