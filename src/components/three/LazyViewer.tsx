"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

// three.js is ~600 KB, so the viewer loads after the page is interactive.
export const LazyViewer = dynamic(() => import("./Viewer3D"), { ssr: false });

export function ViewerFrame({ children }: { children: ReactNode }) {
  return <div className="relative h-full w-full">{children}</div>;
}
