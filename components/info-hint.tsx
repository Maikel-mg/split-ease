'use client'

import { useState, type ReactNode } from 'react'
import { Info } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface InfoHintProps {
  /** Accessible label for the icon button. */
  label: string
  children: ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
}

/**
 * Small info icon that explains a concept. Works on hover (desktop) and on tap
 * (mobile), where there is no hover at all.
 */
export function InfoHint({ label, children, side = 'bottom' }: InfoHintProps) {
  const [open, setOpen] = useState(false)

  return (
    <TooltipProvider>
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={label}
            onClick={() => setOpen((value) => !value)}
            className="inline-flex shrink-0 items-center text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground"
          >
            <Info className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side={side}>{children}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
