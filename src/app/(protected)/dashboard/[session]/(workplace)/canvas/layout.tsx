import { FC, ReactNode } from 'react';

type LayoutProps = {
  children: ReactNode;
};

const Layout: FC<LayoutProps> = async ({ children }) => {
  return <div>{children}</div>;
};

export default Layout;
