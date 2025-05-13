import {
  OTP_DEFAULT_EXPIRY,
  PROJECT_LOGO,
  PROJECT_NAME,
} from '../miscellaneous/constants';

export const sendEmailOtpTemplate = (otp: string, otpFor: string) => {
  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Verification Code</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #ffffff; font-family: Arial, sans-serif;">
    <!-- Outer table to center the content -->
    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      border="0"
      style="background-color: #ffffff; margin: 0; padding: 0;"
    >
      <tr>
        <td align="center" style="padding: 20px;">
          <!-- Email Card Table -->
          <table
            cellpadding="0"
            cellspacing="0"
            border="0"
            width="100%"
            style="
              max-width: 400px;
              background: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              border: 1px solid gray;
            "
          >
            <tr>
              <td align="center" style="padding: 20px;">
                <!-- Logo -->
                <img
                  src="${PROJECT_LOGO}"
                  alt="${PROJECT_NAME}"
                  style="display: block; width: 80px; margin-bottom: 10px;"
                />
              </td>
            </tr>
            <tr>
              <td align="center" style="padding: 0 20px;">
                <!-- Heading -->
                <h1
                  style="
                    font-size: 19px;
                    color: #000000;
                    font-weight: normal;
                    margin: 0 0 20px;
                  "
                >
                  Verification Code
                </h1>
                <!-- Subtext -->
                <p
                  style="
                    font-size: 14px;
                    color: #555555;
                    margin: 0 0 20px;
                    line-height: 1.5;
                  "
                >
                  Use the following OTP to complete the procedure for ${otpFor}.
                </p>
                <!-- OTP -->
                <div
                  style="
                    font-size: 25px;
                    font-weight: bold;
                    color: #0491e2;
                    margin: 20px 0;
                  "
                >
                 ${otp}
                </div>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding: 0 20px 20px;">
                <!-- Footer Note -->
                <p
                  style="
                    font-size: 12px;
                    color: #7c7b7b;
                    margin: 0;
                    line-height: 1.5;
                  "
                >
                  Validity for this OTP is ${OTP_DEFAULT_EXPIRY} minutes. Keep this code private.
                </p>
              </td>
            </tr>
          </table>
          <!-- End of Email Card Table -->
        </td>
      </tr>
    </table>
  </body>
</html>
    `;
};
