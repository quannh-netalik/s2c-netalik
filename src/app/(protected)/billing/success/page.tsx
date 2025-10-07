'use client';

import { FC, useEffect, useRef, useState } from 'react';
import { useQuery } from 'convex/react';
import { useRouter } from 'next/navigation';
import { api } from '../../../../../convex/_generated/api';
import { Id } from '../../../../../convex/_generated/dataModel';

const Page: FC = () => {
  const router = useRouter();
  const redirected = useRef<boolean>(false);
  const [_timeout, _setTimeout] = useState<boolean>(false);

  // 1. Current user
  const me = useQuery(api.user.getCurrentUser, {});

  // 2. Entitlement (skip until we have a user)
  const entitled = useQuery(
    api.subscription.hasEntitlement,
    me && me._id ? { userId: me._id as Id<'users'> } : 'skip',
  );

  // 3. Redirect logic
  useEffect(() => {
    if (redirected.current) return;

    // Still loading user
    if (me === undefined) return;

    // Not signed in
    if (me === null) {
      redirected.current = true;
      router.replace('/auth/sign-in');
      return;
    }

    // Still loading entitlement
    if (entitled === undefined) return;

    // Entitled
    if (entitled) {
      redirected.current = true;
      router.replace('/dashboard');
    }
  }, [me, entitled, router]);

  // 4. 45s fallback to billing if still not entitled
  useEffect(() => {
    if (redirected.current) return;
    if (!me || entitled) return; // no user yet or already entitled

    const t = setTimeout(() => {
      if (redirected.current) return;
      _setTimeout(true);
      redirected.current = true;
      router.replace(`/billing/${me.name}`);
    }, 45_000);

    return () => {
      clearTimeout(t);
    };
  }, [entitled, me, router]);

  // 5. UI
  return (
    <div className="mx-auto max-w-md p-8 text-center">
      <div className="mb-3">
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-transparent align-[-2px]" />
      </div>
      <div className="mb-1 text-lg">Finalizing your subscription...</div>
      <div className="text-sm text-gray-500" aria-live="polite">
        {me === undefined
          ? 'Checking your account...'
          : entitled === undefined
            ? 'Confirming your entitlement...'
            : _timeout
              ? 'Taking longer than expected - redirecting to billing.'
              : 'This should only take a few seconds...'}
      </div>
    </div>
  );
};

export default Page;
