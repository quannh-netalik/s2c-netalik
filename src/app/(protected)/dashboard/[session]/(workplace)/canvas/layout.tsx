import Toolbar from '@/components/canvas/toolbar';
import { FC, ReactNode } from 'react';

type LayoutProps = {
  children: ReactNode;
};

const Layout: FC<LayoutProps> = async ({ children }) => {
  return (
    <div className="w-full h-screen">
      {children}
      <Toolbar />
    </div>
  );
};

export default Layout;
