module.exports = {
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: "tsconfig.json",
        sourceType: "module",
        ecmaVersion: "es2019",
    },
    plugins: [
        "@typescript-eslint/eslint-plugin",
        "unicorn",
        "@darraghor/nestjs-typed",
        "eslint-comments",
        "sonarjs",
        "promise",
        "jest",
    ],
    // settings: {
    //     ["import/parsers"]: {"@typescript-eslint/parser": [".ts", ".tsx"]},
    //     ["import/resolver"]: {
    //         node: {
    //             extensions: [".ts", ".tsx"],
    //         },
    //     },
    // },
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "plugin:unicorn/recommended",
        // "plugin:import/errors",
        // "plugin:import/warnings",
        "plugin:unicorn/recommended",
        "plugin:eslint-comments/recommended",
        "plugin:sonarjs/recommended",
        "prettier",
        "plugin:promise/recommended",
        "plugin:jest/recommended",
        "plugin:@darraghor/nestjs-typed/recommended",
    ],
    // tsconfigRootDir: __dirname,
    root: true,
    env: {
        es6: true,
        node: true,
        jest: true,
    },
    ignorePatterns: [".eslintrc.cjs"],
    rules: {
        // "jest/no-try-expect":"off",
        // "jest/no-conditional-expect":"off",
        // "sonarjs/no-duplicate-string":"off",
        // "no-eval": "error",
        "@typescript-eslint/interface-name-prefix": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "jest/expect-expect": [
            "error",
            {
                assertFunctionNames: [
                    "expect",
                    "request.**.expect",
                    "AuthenticatedRequests.getRequestAuthenticated",
                ],
            },
        ],
        "eslint-comments/disable-enable-pair": [
            "error",
            {allowWholeFile: true},
        ],
        "@darraghor/nestjs-typed/sort-module-metadata-arrays": ["error"],
        "@darraghor/nestjs-typed/injectable-should-be-provided": [
            "error",
            {
                src: ["src/**/*.ts"],
                filterFromPaths: ["node_modules", ".test.", ".spec."],
            },
        ],
        "unicorn/prefer-node-protocol": "off",
        "unicorn/filename-case": "off",
        // "unicorn/filename-case": [
        //   "error",
        //   {
        //     ignore: [/^\.\+spec\.ts$/],
        //     cases: {
        //       camelCase: true,
        //       pascalCase: true,
        //     },
        //   },
        // ],
        "@typescript-eslint/naming-convention": [
            "error",
            {
                selector: "default",
                format: ["camelCase"],
            },
            {
                selector: "memberLike",
                modifiers: ["private"],
                format: ["camelCase"],
                leadingUnderscore: "forbid",
            },
            {
                selector: "variable",
                format: ["PascalCase", "UPPER_CASE"],
                types: ["boolean"],
                prefix: ["is", "should", "has", "can", "did", "will"],
            },
            {
                selector: "variableLike",
                format: ["camelCase", "UPPER_CASE", "PascalCase"],
            },

            {
                selector: "parameter",
                format: ["camelCase"],
            },

            {
                selector: "typeLike",
                format: ["PascalCase"],
            },
            {
                selector: "property",
                modifiers: ["readonly"],
                format: ["camelCase"],
            },
            {
                selector: "import",
                format: ["camelCase", "PascalCase"],
            },
            {
                selector: "enumMember",
                format: ["UPPER_CASE"],
            },
        ],
        "unicorn/prevent-abbreviations": [
            "error",
            {
                checkFilenames: false,
                replacements: {
                    e: {},
                    e2e: {
                        checkFilenames: false,
                    },
                    res: false,
                    cmd: {
                        command: true,
                    },
                    errCb: {
                        handleError: true,
                    },
                },
            },
        ],
    },
};
