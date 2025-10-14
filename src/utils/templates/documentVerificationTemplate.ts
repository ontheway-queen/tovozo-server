import { PROJECT_LOGO, PROJECT_NAME } from "../miscellaneous/constants";

export const documentVerificationSuccessTemplate = (name: string) => {
	return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document Verification Successful</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f6f9fc; margin: 0; padding: 0;">
      <tr>
        <td align="center" style="padding: 30px 20px;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 480px; background: #ffffff; border-radius: 10px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); border: 1px solid #e0e0e0; overflow: hidden;">
            
            <!-- Logo -->
            <tr>
              <td align="center" style="background-color: #0491e2; padding: 25px 10px;">
                <img src="${PROJECT_LOGO}" alt="${PROJECT_NAME}" style="display: block; width: 90px; margin-bottom: 10px;" />
                <h2 style="color: #ffffff; font-size: 20px; font-weight: normal; margin: 0;">${PROJECT_NAME}</h2>
              </td>
            </tr>

            <!-- Hero Image -->
            <tr>
              <td align="center" style="padding: 25px 20px 0;">
                <img src="https://cdn-icons-png.flaticon.com/512/5610/5610944.png" alt="Verification Success" style="width: 120px; display: block; margin: 0 auto;" />
              </td>
            </tr>

            <!-- Main Content -->
            <tr>
              <td align="center" style="padding: 20px 30px;">
                <h1 style="font-size: 22px; color: #333333; margin-bottom: 10px;">Verification Successful 🎉</h1>
                <p style="font-size: 15px; color: #555555; line-height: 1.6; margin: 0 0 15px;">
                  Hi ${name},
                </p>
                <p style="font-size: 15px; color: #555555; line-height: 1.6; margin: 0 0 20px;">
                  We’re pleased to inform you that we’ve successfully verified your submitted documents (ID copy and work permit). 
                  Your <strong>${PROJECT_NAME}</strong> account is now fully active, and you can start applying for jobs right away.
                </p>
                <a href="#" style="background-color: #0491e2; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: bold; padding: 12px 24px; border-radius: 6px; display: inline-block;">Start Applying Now</a>
              </td>
            </tr>

            <!-- Divider -->
            <tr>
              <td style="padding: 20px 30px;">
                <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 0;" />
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" style="padding: 15px 20px 25px;">
                <p style="font-size: 12px; color: #7c7b7b; line-height: 1.6; margin: 0;">
                  Need help? Contact our support team at 
                  <a href="mailto:support@${PROJECT_NAME.toLowerCase()}.com" style="color: #0491e2; text-decoration: none;">support@${PROJECT_NAME.toLowerCase()}.com</a>.
                  <br /><br />
                  Didn’t perform this action? You can safely ignore this email.
                </p>
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
