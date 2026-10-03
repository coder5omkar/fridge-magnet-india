"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { installErrorLogging, log } from "@/lib/logger";

export default function ActivityLogger() {
  const pathname = usePathname();

  useEffect(() => {
    installErrorLogging();
  }, []);

  useEffect(() => {
    log("page_view", { path: pathname });
  }, [pathname]);

  return null;
}
