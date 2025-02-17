import {Logger, UnauthorizedException} from "@nestjs/common";

export function isOwnerOrThrow(
    itemOwnerUuid: string,
    currentUserUuid: string,

    attemptedAction: string,
    logger?: Logger
) {
    if (itemOwnerUuid !== currentUserUuid) {
        if (logger) {
            logger.warn(
                {
                    currentUserUuid,
                    itemOwnerUuid,
                    attemptedAction,
                },
                `Attempted to modify record for another user`
            );
        }
        throw new UnauthorizedException();
    }
}
