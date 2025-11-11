"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceError = void 0;
exports.logError = logError;
class ServiceError extends Error {
    constructor(message, statusCode = 500, code, details) {
        super(message);
        this.name = "ServiceError";
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
    }
}
exports.ServiceError = ServiceError;
function logError(error, context) {
    console.error("Error occurred", {
        message: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString(),
    });
}
//# sourceMappingURL=index.js.map