"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { FC, ReactNode, use } from "react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { CircleQuestionMark, Hash, LayoutTemplate, User } from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

type TabProps = {
  label: string;
  href: string;
  icon?: ReactNode;
};

const Navbar: FC = () => {
  const params = useSearchParams();
  const projectId = params.get("projectId");

  const user = useQuery(api.user.getCurrentUser);

  const project = {} as any;

  const pathname = usePathname();

  const tabs: TabProps[] = [
    {
      label: "Canvas",
      href: `/dashboard/xxx/canvas?projectId=${projectId}`,
      icon: <Hash className="w-4 h-4" />,
    },
    {
      label: "Style Guide",
      href: `/dashboard/xxx/style-guide?projectId=${projectId}`,
      icon: <LayoutTemplate className="w-4 h-4" />,
    },
  ];

  const hasCanvas = pathname.includes("canvas");
  const hasStyleGuide = pathname.includes("style-guide");

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 p-6 fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center gap-4">
        <Link
          href={`/dashboard/`}
          className="w-8 h-8 rounded-full border-3 border-white bg-black flex items-center justify-center"
        >
          <div className="w-4 h-4 rounded-full bg-white">{user?.email}</div>
        </Link>

        {!hasCanvas ||
          (!hasStyleGuide && (
            <div className="lg:inline-block hidden rounded-full text-primary/60 border border-white/[0.12] backdrop-blur-xl bg-white/[0.08] px-4 py-2 text-sm saturate-150">
              Project / {project?.name}
            </div>
          ))}
      </div>

      <div className="lg:flex hidden items-center justify-center gap-2">
        <div className="flex items-center gap-2 backdrop-blur-xl bg-white/[0.08] border border-white/[0.12] rounded-full p-2 saturate-150">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={[
                "group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition",
                `${pathname}?project=${projectId}` === tab.href
                  ? "bg-white/[0.12] text-white border border-white/[0.16] backdrop-blur-sm"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] border border-transparent",
              ].join(" ")}
            >
              <span
                className={
                  `${pathname}?project=${projectId}` === tab.href
                    ? "opacity-100"
                    : `opacity-70 group-hover:opacity-90`
                }
              >
                {tab.icon}
              </span>
              <span>{tab.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 justify-end">
        <span className="text-sm text-white/50">TODO: credits</span>
        <Button
          variant="secondary"
          className="rounded-full h-12 w-12 flex items-center justify-center backdrop-blur-xl bg-white/[0.08] saturate-150 hover:bg-white/[0.12]"
        >
          <CircleQuestionMark className="size-5 text-white" />
        </Button>

        <Avatar className="size-12 ml-2">
          <AvatarImage />
          <AvatarFallback>
            <User className="size-5 text-black" />
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
};

export default Navbar;
