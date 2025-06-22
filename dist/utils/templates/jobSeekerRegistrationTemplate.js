"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registrationJobSeekerTemplate = void 0;
const constants_1 = require("../miscellaneous/constants");
const registrationJobSeekerTemplate = (payload) => {
    return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Welcome to ${constants_1.PROJECT_NAME}</title>
</head>
<body style="margin:0; padding:0; font-family: 'Poppins', sans-serif; background-color:#f7f9fc; color:#333;">
  <div style="max-width:450px; margin:20px auto; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.1); border:1px solid #e7e9ec;">

    <!-- Header -->
    <div style="background-color:#ECECEC; color:#1d1d1d; padding:20px; text-align:center;">
      <img src="${constants_1.PROJECT_LOGO}" alt="Logo" style="width:120px; margin-bottom:10px;" />
      <h1 style="font-size:20px; margin:0;">Welcome to ${constants_1.PROJECT_NAME}!</h1>
    </div>

    <!-- Content -->
    <div style="padding:20px;">
      <p style="margin:10px 0; font-size:14px; line-height:1.5;">Hi <strong>${payload.name}</strong>,</p>
      <p style="margin:10px 0; font-size:14px; line-height:1.5;">
        Thank you for registering with <strong>${constants_1.PROJECT_NAME}</strong>. We will review your information shortly.
      </p>
      <p style="margin:10px 0; font-size:14px; line-height:1.5;">
        Once your application is approved, you will be granted access to the platform and can start exploring all the opportunities available.
      </p>
      <p style="margin:15px 0; font-size:14px; line-height:1.5;">
        If you have any questions, feel free to contact our support team.
      </p>
    </div>

    <!-- Footer -->
        <div style="background-color:#f1f5fa; text-align:center; padding:10px; font-size:12px; color:#666;">
          <p style="margin:5px 0;">Need help? Call us at <strong>${constants_1.PROJECT_NUMBER}</strong>.</p>
          <!-- App Download Buttons -->
          <div style="margin:10px 0;">
            <a href="${constants_1.JOB_SEEKER_APP_STORE_URL}" target="_blank" style="display:inline-block; margin:0 5px;">
              <img src="${constants_1.APP_STORE_ICON}" alt="Download on the App Store" style="height:30px;" />
            </a>
            <a href="${constants_1.JOB_SEEKER_PLAY_STORE_URL}" target="_blank" style="display:inline-block; margin:0 5px;">
              <img src="${constants_1.PLAY_STORE_ICON}" alt="Get it on Google Play" style="height:30px;" />
            </a>
          </div>
          <p style="margin:5px 0;">&copy; ${new Date().getFullYear()} ${constants_1.PROJECT_NAME}. All Rights Reserved.</p>
        </div>

  </div>
</body>
</html>
  `;
};
exports.registrationJobSeekerTemplate = registrationJobSeekerTemplate;
