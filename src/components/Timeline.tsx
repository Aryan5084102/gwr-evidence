import { useState } from "react";
import { ChevronRight, Clock } from "lucide-react";
import type { TimelineNode } from "@/types";
import { cn } from "@/lib/utils";

export default function Timeline({ nodes }: { nodes: TimelineNode[] }) {
  const [open, setOpen] = useState<string | null>(nodes[0]?.id ?? null);
  return (
    <div className="relative">
      <div className="absolute left-[19px] top-2 bottom-2 w-px bg-line" />
      <ul className="space-y-3">
        {nodes.map((n) => {
          const isOpen = open === n.id;
          return (
            <li key={n.id}>
              <button
                onClick={() => setOpen(isOpen ? null : n.id)}
                className="w-full flex items-start gap-4 text-left group"
              >
                <div className="relative z-10">
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center border-2 transition bg-white",
                    isOpen
                      ? "border-royal text-royal"
                      : "border-line text-muted group-hover:border-royal/50"
                  )}>
                    <Clock className="h-4 w-4" />
                  </div>
                </div>
                <div className={cn("flex-1 panel p-4 transition", isOpen && "border-royal/40 shadow-glow")}>
                  <div className="flex items-center gap-3">
                    <div className="text-xs font-mono font-semibold text-royal">{n.time}</div>
                    <div className="text-sm font-semibold text-soft">{n.title}</div>
                    <span className="ml-auto chip">{n.evidenceCount} items</span>
                    <ChevronRight className={cn("h-4 w-4 text-muted transition", isOpen && "rotate-90")} />
                  </div>
                  {isOpen && (
                    <p className="text-xs text-muted mt-2 leading-relaxed">{n.description}</p>
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
