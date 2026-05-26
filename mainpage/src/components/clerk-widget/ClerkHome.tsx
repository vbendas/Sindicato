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

type QuickAction = {
  icon: React.ReactNode;
  label: string;
  description: string;
  action: () => void;
};

export function ClerkHome() {
  const { setActiveMode, session } = useClerkWidget();

  const isAuthenticated = !!session?.user;
  const isWorker = isAuthenticated && !session?.user?.role;

  const actions: QuickAction[] = [
    {
      icon: <MessageCircle size={18} />,
      label: "Ask a question",
      description: "About Sindicato, how it works",
      action: () => setActiveMode("kb-chat"),
    },
    {
      icon: <FileText size={18} />,
      label: "File a case",
      description: "Report exploitation",
      action: () => {
        window.location.href = "/file";
      },
    },
    {
      icon: <Database size={18} />,
      label: "Query data",
      description: "Explore worker exploitation data",
      action: () => {
        window.location.href = "/clerk";
      },
    },
    {
      icon: <Mail size={18} />,
      label: "Contact Sindicato",
      description: "Get in touch with the team",
      action: () => setActiveMode("contact"),
    },
  ];

  if (isWorker) {
    actions.push({
      icon: <FolderOpen size={18} />,
      label: "My cases",
      description: "Check your filed cases",
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
              alt="Clerk"
              fill
              className="object-cover"
              sizes="125px"
            />
          </div>
          <p className="text-sm text-sindicato-warm-white/90 font-medium">
            How can I help you?
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
