"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";

import { Suspense } from "react";

function SignInContent() {
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [authMode, setAuthMode] = useState<'password' | 'otp'>('password');
    const [otpSent, setOtpSent] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (searchParams.get("mode") === "otp") {
            setAuthMode("otp");
        }
    }, [searchParams]);


    const handleSignIn = async () => {
        setLoading(true);
        if (authMode === 'password') {
            await authClient.signIn.email({
                email,
                password,
            }, {
                onSuccess: () => {
                    router.push("/");
                },
                onError: (ctx) => {
                    alert(ctx.error.message);
                    setLoading(false);
                }
            });
        } else {
            if (!otpSent) {
                // Correct way to send OTP
                await authClient.emailOtp.sendVerificationOtp({
                    email,
                    type: "sign-in",
                }, {
                    onSuccess: () => {
                        setOtpSent(true);
                        setLoading(false);
                    },
                    onError: (ctx) => {
                        alert(ctx.error.message);
                        setLoading(false);
                    }
                });
            } else {
                // Verifying the OTP
                await authClient.signIn.emailOtp({
                    email,
                    otp,
                }, {
                    onSuccess: () => {
                        router.push("/");
                    },
                    onError: (ctx) => {
                        alert(ctx.error.message);
                        setLoading(false);
                    }
                });
            }
        }
    };


    return (
        <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
            <Card className="w-full max-w-md border-none shadow-2xl backdrop-blur-sm bg-white/80 dark:bg-gray-800/80">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-3xl font-bold text-center tracking-tight">
                        {authMode === 'password' ? 'Welcome Back' : 'Login with Code'}
                    </CardTitle>
                    <CardDescription className="text-center text-base">
                        {authMode === 'password' 
                            ? 'Enter your credentials to access your account' 
                            : otpSent 
                                ? 'We sent a code to your email' 
                                : 'We will send a one-time code to your email'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={otpSent && authMode === 'otp'}
                            className="h-11 rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                    </div>
                    {authMode === 'password' ? (
                        <div className="space-y-2">
                            <Label htmlFor="password text-sm font-medium">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-11 rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                        </div>
                    ) : (
                        otpSent && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                <Label htmlFor="otp" className="text-sm font-medium">One-Time Code</Label>
                                <Input
                                    id="otp"
                                    type="text"
                                    placeholder="000000"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="h-11 rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all text-center tracking-widest text-lg font-mono"
                                />
                            </div>
                        )
                    )}
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 pt-4">
                    <Button 
                        className="w-full h-11 text-base font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] bg-blue-600 hover:bg-blue-700" 
                        onClick={handleSignIn} 
                        disabled={loading}
                    >
                        {loading 
                            ? "Processing..." 
                            : authMode === 'password' 
                                ? "Sign In" 
                                : otpSent ? "Verify Code" : "Send Code"}
                    </Button>
                    
                    <div className="relative w-full">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-200 dark:border-gray-700"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white dark:bg-gray-800 px-2 text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Button
                            variant="outline"
                            className="w-full h-11 border-gray-200 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
                            onClick={async () => {
                                await authClient.signIn.social({
                                    provider: "google",
                                    callbackURL: "/",
                                });
                            }}
                            disabled={loading}
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Continue with Google
                        </Button>

                        <Button
                            variant="outline"
                            className="w-full h-11 border-gray-200 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
                            onClick={async () => {
                                await authClient.signIn.social({
                                    provider: "github",
                                    callbackURL: "/",
                                });
                            }}
                            disabled={loading}
                        >
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22v3.293c0 .319.192.694.805.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                            Continue with GitHub
                        </Button>

                        <Button
                            variant="outline"
                            className="w-full h-11 border-gray-200 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            onClick={() => {
                                setAuthMode(authMode === 'password' ? 'otp' : 'password');
                                setOtpSent(false);
                            }}
                            disabled={loading}
                        >
                            {authMode === 'password' ? "Login through code" : "Sign in with password"}
                        </Button>
                    </div>

                    <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                        Don't have an account?{" "}
                        <Link href="/sign-up" className="font-medium text-blue-600 hover:text-blue-500 hover:underline transition-colors">
                            Sign Up
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}

export default function SignIn() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
                <Card className="w-full max-w-md border-none shadow-2xl backdrop-blur-sm bg-white/80 dark:bg-gray-800/80">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-3xl font-bold text-center tracking-tight">
                            Loading...
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-32 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </CardContent>
                </Card>
            </div>
        }>
            <SignInContent />
        </Suspense>
    );
}


