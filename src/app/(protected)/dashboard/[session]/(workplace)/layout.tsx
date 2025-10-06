import Navbar from '@/components/navbar';
import { SubscriptionEntitlementQuery } from '@/convex/query.config';
import { combinedSlug } from '@/lib/utils';
import { redirect } from 'next/navigation';
import { FC, ReactNode } from 'react';

type LayoutProps = {
  children: ReactNode;
};

const Layout: FC<LayoutProps> = async ({ children }) => {
  const { profileName, entitlement } = await SubscriptionEntitlementQuery();

  if (!entitlement._valueJSON) {
    redirect(`/billing/${combinedSlug(profileName)}`);
  }

  return (
    <div className="grid grid-cols-1">
      <Navbar />
      {children}
    </div>
  );
};

export default Layout;
