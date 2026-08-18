<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Issue Report</title>
</head>

<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #1B7A3D 0%, #A9BA1E 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">A4 Medical Consortium</h1>
        <p style="color: #e6f4ea; margin: 10px 0 0 0;">New Issue Report</p>
    </div>

    <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
        <p><strong>Reported by:</strong> {{ $reporterName }} ({{ $reporterEmail }}) — {{ ucfirst($reporterRole) }}</p>
        <p><strong>Type:</strong> {{ ucfirst($type) }}</p>
        <p><strong>Summary:</strong> {{ $title }}</p>

        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">

        <p style="white-space: pre-wrap;">{{ $description }}</p>
    </div>
</body>

</html>
