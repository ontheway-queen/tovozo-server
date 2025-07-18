import {
  APP_STORE_ICON,
  HOTELIER_APP_STORE_URL,
  HOTELIER_PLAY_STORE_URL,
  PLAY_STORE_ICON,
  PROJECT_LOGO,
  PROJECT_NAME,
  PROJECT_NUMBER,
} from "../miscellaneous/constants";

export const registrationHotelierTemplate = (payload: { name: string }) => {
  return `
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Welcome to ${PROJECT_NAME}</title>
</head>
<body style="margin:0; padding:0; font-family: 'Poppins', sans-serif; background-color:#f7f9fc; color:#333;">
  <div style="max-width:450px; margin:20px auto; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.1); border:1px solid #e7e9ec;">

    <!-- Header -->
    <div style="background-color:#ECECEC; color:#1d1d1d; padding:20px; text-align:center;">
      <img src="${PROJECT_LOGO}" alt="Logo" style="width:120px; margin-bottom:10px;" />
      <h1 style="font-size:20px; margin:0;">Welcome to ${PROJECT_NAME}!</h1>
    </div>

    <!-- Content -->
    <div style="padding:20px;">
      <p style="margin:10px 0; font-size:14px; line-height:1.5;">Hi <strong>${
        payload.name
      }</strong>,</p>
      <p style="margin:10px 0; font-size:14px; line-height:1.5;">
        Thank you for registering as a <strong>Hotelier</strong> with <strong>${PROJECT_NAME}</strong>. We appreciate your interest in joining our platform.
      </p>
      <p style="margin:10px 0; font-size:14px; line-height:1.5;">
        Our team will review your registration and get back to you shortly. Once approved, you'll be able to access your hotel dashboard and start managing your listings.
      </p>
      <p style="margin:15px 0; font-size:14px; line-height:1.5;">
        If you have any questions, please don’t hesitate to reach out to our support team.
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color:#f1f5fa; text-align:center; padding:10px; font-size:12px; color:#666;">
      <p style="margin:5px 0;">Need help? Call us at <strong>${PROJECT_NUMBER}</strong>.</p>
      <!-- App Download Buttons -->
      <div style="margin:10px 0;">
        <a href="${HOTELIER_APP_STORE_URL}" target="_blank" style="display:inline-block; margin:0 5px;">
          <img src="${APP_STORE_ICON}" alt="Download on the App Store" style="height:30px;" />
        </a>
        <a href="${HOTELIER_PLAY_STORE_URL}" target="_blank" style="display:inline-block; margin:0 5px;">
          <img src="${PLAY_STORE_ICON}" alt="Get it on Google Play" style="height:30px;" />
        </a>
      </div>
      <p style="margin:5px 0;">&copy; ${new Date().getFullYear()} ${PROJECT_NAME}. All Rights Reserved.</p>
    </div>

  </div>
</body>
</html>
  `;
};
