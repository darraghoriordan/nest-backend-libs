import {defineConfig} from "vitest/config";

export default defineConfig({
    test: {
        globals: true,
        root: "./src",
        include: ["**/*.{test,spec}.{js,ts}"],
        environment: "node",
        setupFiles: ["./testing/preRun.ts"],
        coverage: {
            provider: "v8",
            include: ["**/*.ts"],
            exclude: [
                "**/node_modules/**",
                "**/*.test.data.ts",
                "**/*.{test,spec}.ts",
                "**/migrations/**",
            ],
            reporter: ["text", "json", "lcov", "clover", "cobertura"],
            thresholds: {
                statements: 0,
                branches: 0,
                functions: 0,
                lines: 0,
            },
        },
        reporters: ["default", "junit"],
        outputFile: {
            junit: "junit-TEST.xml",
        },
    },
});
