import {describe, it, expect, vi} from "vitest";
import {UnauthorizedException} from "@nestjs/common";
import {isOwnerOrThrow} from "./isOwnerOrThrow";

describe("isOwnerOrThrow", () => {
    const ownerUuid = "owner-uuid-123";
    const otherUuid = "other-uuid-456";

    it("should not throw when UUIDs match", () => {
        expect(() =>
            isOwnerOrThrow(ownerUuid, ownerUuid, "test-action")
        ).not.toThrow();
    });

    it("should throw UnauthorizedException when UUIDs do not match", () => {
        expect(() =>
            isOwnerOrThrow(ownerUuid, otherUuid, "test-action")
        ).toThrow(UnauthorizedException);
    });

    it("should log warning when logger is provided and UUIDs do not match", () => {
        const mockLogger = {
            warn: vi.fn(),
        };

        expect(() =>
            isOwnerOrThrow(
                ownerUuid,
                otherUuid,
                "delete-item",
                mockLogger as never
            )
        ).toThrow(UnauthorizedException);

        expect(mockLogger.warn).toHaveBeenCalledWith(
            {
                currentUserUuid: otherUuid,
                itemOwnerUuid: ownerUuid,
                attemptedAction: "delete-item",
            },
            "Attempted to modify record for another user"
        );
    });

    it("should not call logger when UUIDs match", () => {
        const mockLogger = {
            warn: vi.fn(),
        };

        isOwnerOrThrow(
            ownerUuid,
            ownerUuid,
            "test-action",
            mockLogger as never
        );

        expect(mockLogger.warn).not.toHaveBeenCalled();
    });
});
