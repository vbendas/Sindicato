"use client";

import {
  MessageCircle,
  Database,
  Mail,
  FileText,
  FolderOpen,
} from "lucide-react";
import Image from "next/image";
import { useClerkWidget } from "./ClerkWidgetProvider";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

type QuickAction = {
  icon: React.ReactNode;
  label: string;
  description: string;
  action: () => void;
};

export function ClerkHome() {
  const { setActiveMode, session } = useClerkWidget();
  const t = useT();

  const isAuthenticated = !!session?.user;
  const isWorker = isAuthenticated && !session?.user?.role;

  const actions: QuickAction[] = [
    {
      icon: <MessageCircle size={18} />,
      label: t("clerk.home.actionAsk"),
      description: t("clerk.home.actionAskDesc"),
      action: () => setActiveMode("kb-chat"),
    },
    {
      icon: <FileText size={18} />,
      label: t("clerk.home.actionFile"),
      description: t("clerk.home.actionFileDesc"),
      action: () => {
        window.location.href = "/file";
      },
    },
    {
      icon: <Database size={18} />,
      label: t("clerk.home.actionQuery"),
      description: t("clerk.home.actionQueryDesc"),
      action: () => {
        window.location.href = "/clerk";
      },
    },
    {
      icon: <Mail size={18} />,
      label: t("clerk.home.actionContact"),
      description: t("clerk.home.actionContactDesc"),
      action: () => setActiveMode("contact"),
    },
  ];

  if (isWorker) {
    actions.push({
      icon: <FolderOpen size={18} />,
      label: t("clerk.home.actionMyCases"),
      description: t("clerk.home.actionMyCasesDesc"),
      action: () => {
        window.location.href = "/account";
      },
    });
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      <div className="p-4 space-y-2">
        <div className="flex flex-col items-center mb-6">
          <div className="relative size-[125px] rounded-full overflow-hidden border-2 border-black bg-sindicato-bordeaux mb-3">
            <Image
              src="/clerk.png"
              alt={t("clerk.name")}
              fill
              className="object-cover"
              sizes="125px"
            />
          </div>
          <p className="text-sm text-sindicato-warm-white/90 font-medium">
            {t("clerk.home.greeting")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-1.5">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={action.action}
              className={cn(
                "flex items-center gap-3 px-3.5 py-3 rounded-2xl",
                "text-left transition-all duration-200",
                "hover:bg-white/5 active:bg-white/10",
                "group"
              )}
            >
              <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-sindicato-warm-white/60 group-hover:text-sindicato-warm-white group-hover:bg-white/10 transition-all duration-200 shrink-0">
                {action.icon}
              </div>
              <div className="min-w-0">
                <p className="text-sm text-sindicato-warm-white/90 font-medium truncate">
                  {action.label}
                </p>
                <p className="text-xs text-sindicato-warm-white/40 truncate">
                  {action.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
