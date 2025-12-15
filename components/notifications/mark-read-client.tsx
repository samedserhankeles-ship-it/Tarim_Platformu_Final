"use client";

import { useEffect } from "react";
import { markNotificationsAsReadAction } from "@/app/actions/notification";

export function MarkNotificationsAsRead() {
  useEffect(() => {
    // Sayfa yüklendiğinde bildirimleri okundu olarak işaretle
    markNotificationsAsReadAction();
  }, []);

  return null; // Bu bileşen görünür bir şey render etmez
}
