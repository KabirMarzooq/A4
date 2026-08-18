<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use App\Models\SystemLog;

class IssueReportController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:150',
            'type' => 'required|in:bug,ui,performance,other',
            'description' => 'required|string|max:5000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Please check the form for errors.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();
        $user = auth('api')->user();
        $adminEmail = env('MAIL_FROM_ADDRESS', 'a4consortium@gmail.com');

        SystemLog::log(
            'issue.report',
            "[{$data['type']}] {$data['title']} — reported by {$user->name} ({$user->email}): {$data['description']}"
        );

        try {
            Mail::send('emails.issue-report', array_merge($data, [
                'reporterName' => $user->name,
                'reporterEmail' => $user->email,
                'reporterRole' => $user->role,
            ]), function ($message) use ($data, $adminEmail) {
                $message->to($adminEmail);
                $message->subject('[Issue Report] ' . $data['title']);
            });
        } catch (\Exception $e) {
            // Already logged to system_logs above, so the report isn't lost
            // even if outbound mail fails.
        }

        return response()->json([
            'message' => 'Issue reported! Our developers are on it.',
        ], 200);
    }
}
