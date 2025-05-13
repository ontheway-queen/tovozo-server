class ResMsg {
  static readonly HTTP_OK = 'The request is OK';
  static readonly HTTP_SUCCESSFUL = 'The request has been fulfilled';
  static readonly HTTP_ACCEPTED = 'The request has been accepted';
  static readonly HTTP_FULFILLED =
    'The request has been successfully processed';
  static readonly HTTP_BAD_REQUEST =
    'The request cannot be fulfilled due to bad syntax';
  static readonly HTTP_UNAUTHORIZED =
    'The request was a legal request, but the server is refusing to respond to it. For use when authentication is possible but has failed or not yet been provided';
  static readonly HTTP_FORBIDDEN =
    'The request was a legal request, but the server is refusing to respond to it';
  static readonly HTTP_NOT_FOUND =
    'The requested data could not be found but may be available again in the future';
  static readonly HTTP_CONFLICT =
    'The resource you are trying to create already exists.';
  static readonly HTTP_UNPROCESSABLE_ENTITY =
    'The request payload is unprocessable, please provide valid payload';
  static readonly HTTP_INTERNAL_SERVER_ERROR = 'Internal server error';
  static readonly HTTP_ACCOUNT_INACTIVE =
    'Your account is disabled! Please contact us.';

  // without http
  static readonly WRONG_CREDENTIALS = 'Wrong username/email or password.';
  static readonly PASSWORD_CHANGED = 'Password changed successfully';
  static readonly PASSWORD_NOT_CHANGED = 'Password cannot changed';

  // OTP
  static readonly OTP_SENT = 'OTP sent successfully';
  static readonly OTP_MATCHED = 'OTP matched successfully';
  static readonly OTP_INVALID = 'Invalid OTP';
  static readonly OTP_EXPIRED = 'OTP has been expired';
  static readonly OTP_NOT_SENT = 'Cannot send OTP now. Try again later.';
  static readonly THREE_TIMES_EXPIRED =
    'Cannot send another OTP within 3 minutes';
  static readonly TOO_MUCH_ATTEMPT =
    'You tried more then 3 time for this otp verification!';
  static readonly NOT_FOUND_USER_WITH_EMAIL = 'No user found with this email';
  static readonly USER_WITH_EXIST_WITH_EMAIL =
    'User already exist with this email';

  // Login
  static readonly LOGIN_SUCCESSFUL = 'You are now logged in';

  static readonly UNABLE_FOR_STATUS =
    'Unable to complete your request for application status reason';
}

export default ResMsg;
