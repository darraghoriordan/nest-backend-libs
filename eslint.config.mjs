import unicorn from "eslint-plugin-unicorn";
import eslintNestJs from "@darraghor/eslint-plugin-nestjs-typed";
import sonarjs from "eslint-plugin-sonarjs";
import globals from "globals";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import {defineConfig} from "eslint/config";

export default defineConfig(
    {
        ignores: [
            "vitest.config.ts",
            "eslint.config.mjs",
            "commitlint.config.cjs",
            "**/.eslintrc.cjs",
            "**/dist",
            "**/node_modules",
            "**/*.spec.ts",
            "**/*.entity.ts",
        ],
    },
    eslint.configs.recommended,
    tseslint.configs.strictTypeChecked,
    tseslint.configs.stylisticTypeChecked,
    {
        languageOptions: {
            globals: {
                ...globals.builtin,
                ...globals.node,
            },
            ecmaVersion: 2022,
            sourceType: "module",
            parserOptions: {
                project: ["./tsconfig.eslint.json"],
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },

    {
        files: ["**/*.ts"],
        plugins: {
            sonarjs,
        },
    },
    {
        plugins: {
            unicorn,
        },
        rules: {
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",
            "@typescript-eslint/no-unsafe-call": "off",
            "@typescript-eslint/no-extraneous-class": "off",
            "@typescript-eslint/naming-convention": "off",
            "@typescript-eslint/restrict-template-expressions": "warn",
            "@typescript-eslint/no-misused-spread": "warn",
            "@typescript-eslint/no-unsafe-enum-comparison": "warn",
            "@typescript-eslint/no-unused-vars": "warn",
            "unicorn/prevent-abbreviations": "warn",
            "@typescript-eslint/no-unsafe-return": "off",
            "@typescript-eslint/prefer-optional-chain": "warn",
            "@typescript-eslint/prefer-nullish-coalescing": "warn",
            "@typescript-eslint/prefer-for-of": "warn",
            "@typescript-eslint/no-unnecessary-condition": "warn",
            "@typescript-eslint/no-unsafe-argument": "warn",
            "unicorn/prefer-node-protocol": "off",
            "unicorn/filename-case": "off",
        },
    },
    eslintNestJs.configs.flatRecommended,
    {
        rules: {
            "@darraghor/nestjs-typed/injectable-should-be-provided": [
                "error",
                {
                    src: ["src/**/*.ts"], // only scan specific patterns
                    filterFromPaths: [
                        "dist",
                        "node_modules",
                        ".test.",
                        ".spec.",
                    ],
                },
            ],
        },
    }
);
