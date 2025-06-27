'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signIn } from '@/lib/auth';
import { showError } from '@/lib/toast';
import { toast } from 'sonner';

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(signIn, null);
  const router = useRouter();

  useEffect(() => {
    if (state && state.success === false) {
      showError('Authentication failed', state.error);
    } else if (state && state.success === true) {
      toast.success('Welcome back!');
      router.push('/dashboard');
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email"
          required
          disabled={isPending}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Enter your password"
          required
          disabled={isPending}
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 cursor-pointer"
        disabled={isPending}
      >
        {isPending ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
}