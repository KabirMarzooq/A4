<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use App\Models\SystemLog;

class ContactController extends Controller
{
    public function send(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'email' => 'required|string|email|max:150',
            'subject' => 'required|string|max:150',
            'message' => 'required|string|max:5000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Please check the form for errors.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();
        $adminEmail = env('MAIL_FROM_ADDRESS', 'a4consortium@gmail.com');

        // "message" is reserved in mail Blade views (Laravel injects the
        // Illuminate\Mail\Message builder under that name), so the inquiry
        // text is passed to the view as "inquiryMessage" instead.
        $viewData = [
            'name' => $data['name'],
            'email' => $data['email'],
            'subject' => $data['subject'],
            'inquiryMessage' => $data['message'],
        ];

        try {
            Mail::send('emails.contact-inquiry', $viewData, function ($message) use ($data, $adminEmail) {
                $message->to($adminEmail);
                $message->replyTo($data['email'], $data['name']);
                $message->subject('New Contact Inquiry: ' . $data['subject']);
            });
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to send your message. Please try again or call us directly.',
            ], 500);
        }

        SystemLog::log(
            'contact.inquiry',
            "Contact form submission from {$data['name']} ({$data['email']}): {$data['subject']}"
        );

        return response()->json([
            'message' => "Thanks for reaching out! We'll get back to you shortly.",
        ], 200);
    }
}
