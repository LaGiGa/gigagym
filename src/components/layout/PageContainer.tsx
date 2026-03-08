// Container de página com scroll e safe areas

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  hasHeader?: boolean;
  hasBottomNav?: boolean;
  scrollable?: boolean;
}

export function PageContainer({
  children,
  className,
  hasHeader = true,
  hasBottomNav = true,
  scrollable = true
}: PageContainerProps) {
  return (
    <div
      className={cn(
        'min-h-screen bg-transparent',
        scrollable && 'overflow-y-auto',
        className
      )}
      style={{
        paddingTop: hasHeader
          ? 'calc(4rem + env(safe-area-inset-top, 0px))'
          : 'env(safe-area-inset-top, 0px)',
        paddingBottom: hasBottomNav
          ? 'calc(5rem + env(safe-area-inset-bottom, 0px))'
          : 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="mx-auto w-full max-w-xl px-4 py-5 sm:px-5">
        {children}
      </div>
    </div>
  );
}
