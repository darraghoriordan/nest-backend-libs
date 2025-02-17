import unicorn from "eslint-plugin-unicorn";
import eslintNestJs from "@darraghor/eslint-plugin-nestjs-typed";
import sonarjs from "eslint-plugin-sonarjs";
import globals from "globals";
import eslint from "@eslint/js";
import tseslint, {parser} from "typescript-eslint";

export default tseslint.config(
    {
        ignores: [
            "jest.config.cjs",
            "eslint.config.mjs",
            "commitlint.config.cjs",
            "**/.eslintrc.cjs",
            "**/dist",
            "**/node_modules",
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
            parser,
            ecmaVersion: 2022,
            sourceType: "module",
            parserOptions: {
                projectService: true,
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
    eslintNestJs.configs.flatRecommended
);
