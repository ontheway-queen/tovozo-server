"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CustomError extends Error {
    constructor(message, status, level, metadata) {
        super(message);
        this.status = status;
        this.message = message;
        this.level = level;
        this.metadata = metadata;
        console.log({ metadata });
    }
}
exports.default = CustomError;
