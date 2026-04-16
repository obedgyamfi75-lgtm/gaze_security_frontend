"use client";

import { Shield, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <div className="relative">
        {/* Pulsing background */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-16 w-16 rounded-full bg-primary/20 animate-ping" />
        </div>
        
        {/* Logo */}
        <div className="relative flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
          <Shield className="h-8 w-8 text-primary" />
        </div>
      </div>
      
      <div className="mt-8 flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading...</span>
      </div>
    </div>
  );
}