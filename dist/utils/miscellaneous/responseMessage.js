"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ResMsg {
}
ResMsg.HTTP_OK = 'The request is OK';
ResMsg.HTTP_SUCCESSFUL = 'The request has been fulfilled';
ResMsg.HTTP_ACCEPTED = 'The request has been accepted';
ResMsg.HTTP_FULFILLED = 'The request has been successfully processed';
ResMsg.HTTP_BAD_REQUEST = 'The request cannot be fulfilled due to bad syntax';
ResMsg.HTTP_UNAUTHORIZED = 'The request was a legal request, but the server is refusing to respond to it. For use when authentication is possible but has failed or not yet been provided';
ResMsg.HTTP_FORBIDDEN = 'The request was a legal request, but the server is refusing to respond to it';
ResMsg.HTTP_NOT_FOUND = 'The requested data could not be found but may be available again in the future';
ResMsg.HTTP_CONFLICT = 'The resource you are trying to create already exists.';
ResMsg.HTTP_UNPROCESSABLE_ENTITY = 'The request payload is unprocessable, please provide valid payload';
ResMsg.HTTP_INTERNAL_SERVER_ERROR = 'Internal server error';
ResMsg.HTTP_ACCOUNT_INACTIVE = 'Your account is disabled! Please contact us.';
// without http
ResMsg.WRONG_CREDENTIALS = 'Wrong username/email or password.';
ResMsg.PASSWORD_CHANGED = 'Password changed successfully';
ResMsg.PASSWORD_NOT_CHANGED = 'Password cannot changed';
// OTP
ResMsg.OTP_SENT = 'OTP sent successfully';
ResMsg.OTP_MATCHED = 'OTP matched successfully';
ResMsg.OTP_INVALID = 'Invalid OTP';
ResMsg.OTP_EXPIRED = 'OTP has been expired';
ResMsg.OTP_NOT_SENT = 'Cannot send OTP now. Try again later.';
ResMsg.THREE_TIMES_EXPIRED = 'Cannot send another OTP within 3 minutes';
ResMsg.TOO_MUCH_ATTEMPT = 'You tried more then 3 time for this otp verification!';
ResMsg.NOT_FOUND_USER_WITH_EMAIL = 'No user found with this email';
ResMsg.USER_WITH_EXIST_WITH_EMAIL = 'User already exist with this email';
// Login
ResMsg.LOGIN_SUCCESSFUL = 'You are now logged in';
ResMsg.UNABLE_FOR_STATUS = 'Unable to complete your request for application status reason';
exports.default = ResMsg;
