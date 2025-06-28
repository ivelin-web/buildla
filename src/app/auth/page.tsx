import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LoginForm from '@/components/auth/LoginForm';
import LogoutToast from '@/components/auth/LogoutToast';
import { Suspense } from 'react';

export default function AuthPage() {

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Suspense>
        <LogoutToast />
      </Suspense>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Buildla Admin
          </CardTitle>
          <CardDescription>
            Sign in to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
} 