import * as React from "react"
import { cn } from "@/lib/utils"

interface TooltipProviderProps {
  children: React.ReactNode;
  delayDuration?: number;
}

const TooltipProvider = ({ children }: TooltipProviderProps) => {
  return <>{children}</>;
};

interface TooltipProps {
  children: React.ReactNode;
}

const Tooltip = ({ children }: TooltipProps) => {
  return <div className="relative group">{children}</div>;
};

interface TooltipTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}

const TooltipTrigger = React.forwardRef<HTMLDivElement, TooltipTriggerProps>(
  ({ children, asChild, className, ...props }, ref) => {
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, { 
        ref, 
        className: cn(className, children.props.className), 
        ...props 
      } as any);
    }
    return (
      <div ref={ref} className={className} {...props}>
        {children}
      </div>
    );
  }
);
TooltipTrigger.displayName = "TooltipTrigger";

interface TooltipContentProps {
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  className?: string;
}

const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ children, side = "right", sideOffset = 4, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "absolute z-50 overflow-hidden rounded-md border bg-slate-900 text-white px-3 py-1.5 text-sm shadow-lg whitespace-nowrap",
          "opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200",
          side === "top" && "bottom-full left-1/2 -translate-x-1/2 mb-2",
          side === "right" && "left-full top-1/2 -translate-y-1/2 ml-2",
          side === "bottom" && "top-full left-1/2 -translate-x-1/2 mt-2",
          side === "left" && "right-full top-1/2 -translate-y-1/2 mr-2",
          className
        )}
        style={{ margin: `${sideOffset}px` }}
        {...props}
      >
        {children}
        {side === "right" && (
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900"></div>
        )}
        {side === "left" && (
          <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-slate-900"></div>
        )}
        {side === "top" && (
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-4 border-transparent border-t-slate-900"></div>
        )}
        {side === "bottom" && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full border-4 border-transparent border-b-slate-900"></div>
        )}
      </div>
    );
  }
);
TooltipContent.displayName = "TooltipContent";

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }

