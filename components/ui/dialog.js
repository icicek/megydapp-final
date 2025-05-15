// ✅ File: components/ui/dialog.jsx
'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;

export function DialogContent({ className, children, ...props }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 bg-black/80 z-40" />
      <DialogPrimitive.Content
        className={cn(
          "fixed z-50 bg-black border border-gray-700 text-white p-6 rounded-xl shadow-lg w-full max-w-md top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute top-3 right-3 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
