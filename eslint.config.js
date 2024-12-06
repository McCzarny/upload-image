import js from "@eslint/js";
import globals from "globals";
import pluginJest from 'eslint-plugin-jest';

export default [
    js.configs.recommended, // Recommended config applied to all files
    {
        //Default settings for all files, we use it for source files.
        plugins: {},

        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.commonjs,
            },

            ecmaVersion: "latest",
            sourceType: "script",
        },

        settings: {},
        rules: {
            'max-len': ['error', {code: 120}],
        },
    },
    {
        // Settings for config files
        files: [
            "eslint.config.js",
        ],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
        },
    },
    {
        // Settings for test files
        files: [
            "test/*.js",
        ],
        plugins: {
            "jest": pluginJest
        },
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                ...globals.node,
                ...pluginJest.environments.globals.globals,
            },
        },
    },
    {
        ignores: [
            'dist/**/*',
            '**/vendor/*.js',
            'node_modules/**/*',
        ],
    },
];
