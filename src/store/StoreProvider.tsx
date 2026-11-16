"use client";

import { setupListeners } from "@reduxjs/toolkit/query";
import { useEffect, useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import type { AppUser } from "@/types";
import { makeStore } from "./index";
import { startUiPersistence } from "./persist";

// Mounted once, in dashboard/layout.tsx. The server hands over the signed-in user,
// so the auth slice is filled before the first render.
export default function StoreProvider({ user, children }: { user: AppUser; children: ReactNode }) {
  const [store] = useState(() => makeStore({ auth: { user } }));

  useEffect(() => {
    // Turns on refetchOnFocus / refetchOnReconnect for RTK Query.
    const stopListeners = setupListeners(store.dispatch);
    const stopPersist = startUiPersistence(store);
    return () => {
      stopListeners();
      stopPersist();
    };
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
