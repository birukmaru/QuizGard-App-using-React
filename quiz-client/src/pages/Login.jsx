import React from 'react';
import { Link } from 'react-router-dom';
import { SignIn } from '@clerk/clerk-react';
import { cn } from '@/lib/utils';

const Login = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 shadow-lg">
          <span className="text-2xl font-bold text-white">Q</span>
        </div>
        <span className="text-3xl font-bold text-gray-900 dark:text-white">QuizGard</span>
      </Link>

      {/* Sign In Card */}
      <div className={cn(
        'w-full max-w-md bg-white rounded-2xl shadow-xl',
        'dark:bg-gray-800',
        'border border-gray-200 dark:border-gray-700'
      )}>
        <SignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          afterSignInUrl="/dashboard"
          redirectUrl="/dashboard"
        />
      </div>

      {/* Footer */}
      <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        By signing in, you agree to our{' '}
        <Link to="/terms" className="text-primary-600 hover:underline">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link to="/privacy" className="text-primary-600 hover:underline">
          Privacy Policy
        </Link>
      </p>
    </div>
  );
};

export default Login;
