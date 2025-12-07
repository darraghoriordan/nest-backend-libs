import {describe, it, expect, beforeEach, vi} from "vitest";
import {ExecutionContext} from "@nestjs/common";
import {Reflector} from "@nestjs/core";
import {ClaimsAuthorisationGuard} from "./ClaimsAuthorisationGuard";

describe("ClaimsAuthorisationGuard", () => {
    let guard: ClaimsAuthorisationGuard;
    let reflector: Reflector;

    beforeEach(() => {
        reflector = new Reflector();
        guard = new ClaimsAuthorisationGuard(reflector);
    });

    const createMockContext = (user: unknown): ExecutionContext => {
        return {
            getHandler: vi.fn(),
            switchToHttp: () => ({
                getRequest: () => ({user}),
            }),
        } as unknown as ExecutionContext;
    };

    describe("when no route permissions are required", () => {
        it("should return true when routePermissions is undefined", () => {
            vi.spyOn(reflector, "get").mockReturnValue(undefined);
            const context = createMockContext({permissions: []});

            expect(guard.canActivate(context)).toBe(true);
        });

        it("should return true when routePermissions is empty array", () => {
            vi.spyOn(reflector, "get").mockReturnValue([]);
            const context = createMockContext({permissions: []});

            expect(guard.canActivate(context)).toBe(true);
        });
    });

    describe("when route permissions are required", () => {
        it("should return false when user is undefined", () => {
            vi.spyOn(reflector, "get").mockReturnValue(["read:items"]);
            const context = createMockContext(undefined);

            expect(guard.canActivate(context)).toBe(false);
        });

        it("should return false when user has no permissions property", () => {
            vi.spyOn(reflector, "get").mockReturnValue(["read:items"]);
            const context = createMockContext({});

            expect(guard.canActivate(context)).toBe(false);
        });

        it("should return false when user lacks required permission", () => {
            vi.spyOn(reflector, "get").mockReturnValue(["read:items"]);
            const context = createMockContext({
                permissions: ["write:items"],
            });

            expect(guard.canActivate(context)).toBe(false);
        });

        it("should return true when user has all required permissions", () => {
            vi.spyOn(reflector, "get").mockReturnValue([
                "read:items",
                "write:items",
            ]);
            const context = createMockContext({
                permissions: ["read:items", "write:items", "delete:items"],
            });

            expect(guard.canActivate(context)).toBe(true);
        });

        it("should return false when user has only some required permissions", () => {
            vi.spyOn(reflector, "get").mockReturnValue([
                "read:items",
                "write:items",
            ]);
            const context = createMockContext({
                permissions: ["read:items"],
            });

            expect(guard.canActivate(context)).toBe(false);
        });
    });

    describe("error handling", () => {
        it("should return false when an error is thrown", () => {
            vi.spyOn(reflector, "get").mockImplementation(() => {
                throw new Error("Reflector error");
            });
            const context = createMockContext({permissions: []});

            expect(guard.canActivate(context)).toBe(false);
        });
    });
});
