export const ERROR_MESSAGES = {
    CHAT_ROOM_NOT_FOUND: '채팅방이 존재하지 않습니다.',
    UNAUTHORIZED_CHAT_ROOM_ACCESS: '사용자가 포함된 채팅방이 아닙니다.',
    CHAT_MESSAGES_NOT_FOUND: '채팅 메시지가 존재하지 않습니다.',
};

export const SWAGGER_ERRORS = {
    CHAT_ROOM_NOT_FOUND: {
        field: 404,
        message: ERROR_MESSAGES.CHAT_ROOM_NOT_FOUND,
    },
    CHAT_MESSAGES_NOT_FOUND: {
        field: 404,
        message: ERROR_MESSAGES.CHAT_MESSAGES_NOT_FOUND,
    },
};