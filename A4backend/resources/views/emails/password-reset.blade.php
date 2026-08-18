<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
</head>

<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #1B7A3D 0%, #A9BA1E 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">A4 Medical Consortium</h1>
        <p style="color: #e6f4ea; margin: 10px 0 0 0;">Hospital Management System</p>
    </div>

    <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
        <h2 style="color: #1B7A3D; margin-top: 0;">Reset Your Password</h2>

        <p>Hello,</p>

        <p>You recently requested to reset your password for your A4 Medical Consortium account. Click the button below to reset it:</p>

        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ $resetUrl }}" style="background: linear-gradient(135deg, #1B7A3D 0%, #A9BA1E 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
                Reset Password
            </a>
        </div>

        <p style="color: #666; font-size: 14px;">
            <strong>This link will expire in 60 minutes.</strong>
        </p>

        <p style="color: #666; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:
        </p>

        <p style="background: #f5f5f5; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 12px;">
            {{ $resetUrl }}
        </p>

        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">

        <p style="color: #999; font-size: 12px;">
            If you didn't request a password reset, please ignore this email or contact support if you have concerns.
        </p>

        <p style="color: #999; font-size: 12px; margin-top: 20px;">
            <strong>A4 Medical Consortium Team</strong><br>
            Healthcare Management Platform
        </p>
    </div>
</body>

</html>