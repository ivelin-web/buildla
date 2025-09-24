'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function LogoutToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const hasShownToast = useRef(false);

  useEffect(() => {
    if (searchParams.get('logout') === 'success' && !hasShownToast.current) {
      hasShownToast.current = true;
      toast.success('Signed out successfully');
      router.replace('/auth');
    }
  }, [router, searchParams]);

  return null;
}
