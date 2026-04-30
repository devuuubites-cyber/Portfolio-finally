import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[88px] w-full rounded-md border border-bone/10 bg-ink/40 px-3 py-2 text-sm text-bone placeholder:text-bone/35 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-bone/40 focus-visible:border-bone/30 disabled:cursor-not-allowed disabled:opacity-50 transition-colors leading-relaxed",
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Textarea.displayName = "Textarea"

export { Textarea }
