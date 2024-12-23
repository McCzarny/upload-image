const js = require("@eslint/js");
const globals = require("globals");
const pluginJest = require('eslint-plugin-jest');

module.exports = [
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
            "eslint.config.mjs",
        ],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "script", // Changed from "module" to "script"
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
            sourceType: "script", // Changed from "module" to "script"
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
