import { useLazyGetCheckoutQuery } from '@/redux/api/billing';
import { useAppSelector } from '@/redux/store';
import { useCallback } from 'react';
import { toast } from 'sonner';

export const useSubscriptionPlan = () => {
  const [trigger, { isFetching }] = useLazyGetCheckoutQuery();
  const userId = useAppSelector((s) => s.profile.user!.id);

  const onSubscribe = useCallback(async () => {
    try {
      const res = await trigger(userId).unwrap();
      window.location.href = res.url;
    } catch (error) {
      console.error('Checkout error', error);
      toast.error('Could not start checkout. Please try again!');
    }
  }, [trigger, userId]);

  return {
    isFetching,
    onSubscribe,
  };
};
