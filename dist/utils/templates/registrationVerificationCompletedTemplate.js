"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registrationVerificationCompletedTemplate = exports.registrationFromAdminTemplate = void 0;
const constants_1 = require("../miscellaneous/constants");
const registrationFromAdminTemplate = (name, creds) => {
    return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Registration Completed - ${name}</title>
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
                  src="${constants_1.PROJECT_LOGO}"
                  alt="${constants_1.PROJECT_NAME}"
                  style="display: block; width: 80px; margin-bottom: 10px;"
                />
              </td>
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
                              </tr>
              <tr>
              <td align="center" style="padding: 0 20px 20px;">
                <p
                  style="
                    font-size: 12px;
                    color: #7c7b7b;
                    margin: 0;
                    line-height: 1.5;
                  "
                >
                 <b>Login:</b>
                </p>
                  <p
                  style="
                    font-size: 12px;
                    color: #7c7b7b;
                    margin: 0;
                    line-height: 1.5;
                  "
                >
                 <b>Username:</b> ${creds.email}
                 <br/>
                 <b>Password:</b> ${creds.password}
                </p>
              </td>
            </tr>
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
                  Use the following link to login.
                </p>
                <!-- OTP -->
                <div
                  style="
                    font-size:11px;
                    color: #0491e2;
                    margin: 20px 0;
                  "
                >
                 ${constants_1.PROJECT_LINK}/login
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
                  Validity for this link is 24 hour. Keep this link private.
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
exports.registrationFromAdminTemplate = registrationFromAdminTemplate;
const registrationVerificationCompletedTemplate = (name, loginLink = `${constants_1.PROJECT_LINK}/login`) => {
    return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Account Activated - ${name}</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #ffffff; font-family: Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center" style="padding: 20px;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="
              max-width: 400px;
              background: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              border: 1px solid #ddd;
            ">
            <tr>
              <td align="center" style="padding: 20px;">
                <img
                  src="${constants_1.PROJECT_LOGO}"
                  alt="${constants_1.PROJECT_NAME} Logo"
                  style="display: block; width: 80px; margin-bottom: 10px;"
                />
                <h2 style="font-size: 18px; color: #000000; margin: 10px 0;">
                  Welcome, ${name}!
                </h2>
                <p style="font-size: 14px; color: #555555; margin: 0 0 20px;">
                  Your account has been successfully activated by the admin.
                </p>
                <p style="font-size: 14px; color: #555555; margin: 0 0 20px;">
                  You can now log in to your account using the link below:
                </p>
                <a
                  href=${loginLink}
                  style="
                    display: inline-block;
                    padding: 10px 20px;
                    background-color: #0491e2;
                    color: #ffffff;
                    text-decoration: none;
                    border-radius: 4px;
                    font-size: 14px;
                  "
                  target="_blank"
                >
                  Login Now
                </a>
                <p style="font-size: 12px; color: #666; margin-top: 10px;">
                  Don't have the app? Download it here:
                </p>
                    <!-- Footer -->
                    <div style="background-color:#f1f5fa; text-align:center; padding:10px; font-size:12px; color:#666;">
                      <p style="margin:5px 0;">Need help? Call us at <strong>${constants_1.PROJECT_NUMBER}</strong>.</p>
                      <!-- App Download Buttons -->
                      <div style="margin:10px 0;">
                        <a href="${constants_1.HOTELIER_APP_STORE_URL}" target="_blank" style="display:inline-block; margin:0 5px;">
                          <img src="${constants_1.APP_STORE_ICON}" alt="Download on the App Store" style="height:30px;" />
                        </a>
                        <a href="${constants_1.HOTELIER_PLAY_STORE_URL}" target="_blank" style="display:inline-block; margin:0 5px;">
                          <img src="${constants_1.PLAY_STORE_ICON}" alt="Get it on Google Play" style="height:30px;" />
                        </a>
                      </div>
                      <p style="margin:5px 0;">&copy; ${new Date().getFullYear()} ${constants_1.PROJECT_NAME}. All Rights Reserved.</p>
                    </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `;
};
exports.registrationVerificationCompletedTemplate = registrationVerificationCompletedTemplate;
