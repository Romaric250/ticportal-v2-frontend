"use client";

import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

// Auth layout now just passes through children since individual pages have their own full layouts
export default function AuthLayout({ children }: Props) {
  return <>{children}</>;
}


