<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Lab Result</title>
</head>

<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #1B7A3D 0%, #A9BA1E 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">A4 Medical Consortium</h1>
        <p style="color: #e6f4ea; margin: 10px 0 0 0;">Hospital Management System</p>
    </div>

    <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
        <h2 style="color: #1B7A3D; margin-top: 0;">Your Lab Result Is Ready</h2>

        <p>Dear {{ $order->patientFile->first_name }},</p>

        <p>Your result for <strong>{{ $order->test_name }}</strong> is ready.</p>

        @if($order->result_summary)
        <p><strong>Summary:</strong> {{ $order->result_summary }}</p>
        @endif

        @if($order->result_file_path)
        <p>The full result is attached to this email.</p>
        @endif

        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">

        <p style="color: #999; font-size: 12px;">
            If you have any questions about this result, please contact the hospital directly.
        </p>

        <p style="color: #999; font-size: 12px; margin-top: 20px;">
            <strong>A4 Medical Consortium Team</strong><br>
            Healthcare Management Platform
        </p>
    </div>
</body>

</html>
