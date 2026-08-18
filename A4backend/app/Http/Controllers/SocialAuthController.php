<?php

namespace App\Http\Controllers;

use App\Models\User;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Http\Request;

class SocialAuthController extends Controller
{
    /**
     * Redirect user to Google OAuth page
     */
    public function redirectToGoogle()
    {
        return Socialite::driver('google')
            ->stateless()
            ->redirect();
    }

    /**
     * Handle Google callback
     */
    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')
                ->stateless()
                ->user();
        } catch (\Exception $e) {
            // Redirect to the frontend route that actually reads ?error=
            // (GoogleAuthSuccess.jsx) — this used to point at /login, which
            // never read the param, so these error toasts never fired.
            return redirect(
                env('FRONTEND_URL') . '/auth/google/success?error=google_failed'
            );
        }

        // Check if user already exists with this email
        $user = User::where('email', $googleUser->getEmail())->first();

        if (!$user) {
            // No account found — redirect to frontend with error
            return redirect(
                env('FRONTEND_URL') . '/auth/google/success?error=no_account'
            );
        }

        // Same admin-approval gate as the normal email/password login
        // (AuthController::login) — without this, a not-yet-approved
        // doctor/receptionist/pharmacy applicant could self-verify with
        // Google and get full access before an admin ever approves them.
        if ($user->status === 'pending') {
            return redirect(
                env('FRONTEND_URL') . '/auth/google/success?error=pending_approval'
            );
        }

        // User exists — generate JWT and redirect to frontend
        $token = auth('api')->login($user);

        // Update last login
        $user->update(['last_login_at' => now()]);

        // Redirect to frontend with token in URL
        // Frontend will extract it and store in localStorage
        return redirect(
            env('FRONTEND_URL') . '/auth/google/success?token=' . $token .
            '&user=' . urlencode(json_encode([
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'role'  => $user->role,
            ]))
        );
    }
}