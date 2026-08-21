<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Models\User;
use App\Models\SystemLog;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use Carbon\Carbon;

class AuthController extends Controller
{
    /**
     * Register a new user
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|between:2,100',
            'email' => 'required|string|email|max:100|unique:users',
            'password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()],
            'phone' => 'required|string|max:11',
            'role' => 'required|in:patient,doctor,receptionist,admin,pharmacy,lab',

            'profile.specialization' => 'nullable|string',
            'adminKey' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        if ($request->role === 'admin') {
            if ($request->adminKey !== env('ADMIN_SECRET')) {
                return response()->json(['error' => 'Invalid Admin Key. Access Denied.'], 403);
            }
        }

        // Doctor/receptionist/pharmacy accounts can't self-verify a license
        // or staff ID, so they start pending until an admin approves them
        // from the Users tab. Patients and admins (already gated by the
        // admin key above) are approved immediately.
        $status = in_array($request->role, ['doctor', 'receptionist', 'pharmacy', 'lab'])
            ? 'pending'
            : 'approved';

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'role' => $request->role,
            'status' => $status,

            'specialization' => $request->input('profile.specialization'),
        ]);

        if ($status === 'pending') {
            return response()->json([
                'message' => 'Account created. It is pending admin approval before you can log in.',
                'user' => $user,
                'status' => 'pending',
            ], 201);
        }

        $token = auth('api')->login($user);

        return response()->json([
            'message' => 'User successfully registered',
            'user' => $user,
            'token' => $token,
            'status' => 'approved',
        ], 201);
    }

    /**
     * Login user and return the token
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        if (!$token = auth('api')->attempt($validator->validated())) {
            SystemLog::log('auth.failed', 'Failed login attempt for email: ' . $request->email);
            return response()->json(['error' => 'Invalid Credentials. Please try again.'], 401);
        }

        $user = auth('api')->user();

        if ($user->status === 'pending') {
            auth('api')->logout();
            return response()->json([
                'error' => 'Your account is pending admin approval. You will be able to log in once approved.',
            ], 403);
        }

        $user->update([
            'last_login_at' => now()
        ]);

        SystemLog::log(
            'auth.login',
            $user->name . ' logged in',
            $user
        );

        return $this->createNewToken($token);
    }

    public function refresh(Request $request)
    {
        try {
            // Get the token from the request
            $token = JWTAuth::getToken();

            if (!$token) {
                return response()->json(['error' => 'Token not provided'], 401);
            }

            // Attempt to refresh the token
            $newToken = JWTAuth::refresh($token);

            return response()->json([
                'access_token' => $newToken,
                'token_type' => 'bearer',
                'expires_in' => auth('api')->factory()->getTTL() * 60,
            ]);
        } catch (JWTException $e) {
            return response()->json([
                'error' => 'Could not refresh token',
                'message' => $e->getMessage()
            ], 401);
        }
    }


    public function logout(Request $request)
    {
        try {
            JWTAuth::invalidate(JWTAuth::getToken());

            return response()->json([
                'message' => 'Successfully logged out'
            ]);
        } catch (JWTException $e) {
            return response()->json([
                'error' => 'Failed to logout, please try again'
            ], 500);
        }
    }

    public function me(Request $request)
    {
        return response()->json(auth('api')->user());
    }


    protected function createNewToken($token)
    {
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth('api')->factory()->getTTL() * 60,
            'user' => auth('api')->user()
        ]);
    }

    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'frontend_url' => 'nullable|url',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Email not found in our records.',
                'errors' => $validator->errors()
            ], 404);
        }

        // Generate token — the raw token goes in the email link; only its
        // hash is ever stored, so a leaked/backed-up DB row can't be used
        // to reset the password on its own.
        $token = Str::random(64);

        // Delete old tokens for this email
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        // Create new token
        DB::table('password_reset_tokens')->insert([
            'email' => $request->email,
            'token' => Hash::make($token),
            'created_at' => now(),
        ]);

        // Send email with reset link
        $frontendUrl = $request->input('frontend_url', env('FRONTEND_URL', 'https://a4medicalconsortium.com'));
        $resetUrl = $frontendUrl . '/reset-password?token=' . $token . '&email=' . urlencode($request->email);

        try {
            Mail::send('emails.password-reset', ['resetUrl' => $resetUrl], function ($message) use ($request) {
                $message->to($request->email);
                $message->subject('Reset Your A4 Medical Consortium Password');
            });

            return response()->json([
                'message' => 'Password reset link sent to your email.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to send email. Please try again.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reset password
     */
    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'token' => 'required|string',
            'password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Token is stored hashed, so look up by email first, then verify
        // the raw token from the link against the stored hash.
        $passwordReset = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$passwordReset || !Hash::check($request->token, $passwordReset->token)) {
            return response()->json([
                'message' => 'Invalid or expired reset token.'
            ], 400);
        }

        // Check if token is expired (60 minutes). Using isPast() rather than
        // diffInMinutes()'s sign — Carbon 3 changed diffInMinutes() to be
        // signed by default (negative for a past date), which silently made
        // this check always false and let reset links stay valid forever.
        if (Carbon::parse($passwordReset->created_at)->addMinutes(60)->isPast()) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return response()->json([
                'message' => 'Reset link has expired. Please request a new one.'
            ], 400);
        }

        // Update password
        $user = User::where('email', $request->email)->first();
        $user->password = Hash::make($request->password);
        $user->save();

        // Delete the used token
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json([
            'message' => 'Password has been reset successfully.'
        ], 200);
    }
}
