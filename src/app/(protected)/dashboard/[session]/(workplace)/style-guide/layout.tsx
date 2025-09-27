import { FC, ReactNode } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { tabs } from '@/components/style/tabs';
import { cn } from '@/lib/utils';

type LayoutProps = {
  children: ReactNode;
};

const Layout: FC<LayoutProps> = async ({ children }) => {
  return (
    <Tabs defaultValue={tabs[0].value} className="w-full">
      <div className="mt-36 container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div>
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-5 items-center justify-between">
            <div>
              <h1 className="text-3xl lg:text-left text-center font-bold text-foreground">Style Guide</h1>
              <p className="text-muted-foreground mt-2 text-center lg:text-left">
                Manage your style guide for your projects.
              </p>
            </div>

            <TabsList className="grid w-full sm:w-fit h-auto grid-cols-3 rounded-full backdrop-blur-xl bg-white/[0.08] border border-white/[0.12] saturate-150 p-2 gap-2">
              {tabs.map(({ label, value, Icon }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className={cn(
                    'flex items-center gap-2 rounded-xl  transition-all duration-200 text-xs sm:text-sm w-full',
                    'data-[state=active]:bg-white/[0.15] data-[state=active]:backdrop-blur-xld data-[state=active]:border data-[state=active]:border-white/[0.2]',
                    'cursor-pointer hover:text-zinc-200 hover:bg-white/[0.06]',
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                  <span className="sm:hidden">{value}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">{children}</div>
    </Tabs>
  );
};

export default Layout;
