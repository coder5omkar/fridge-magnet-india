"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { log } from "./logger";
import { cleanupExpiredPhotos } from "./library";
import { supabase } from "./supabase";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  configured: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ user: User | null; loading: boolean }>({
    user: null,
    loading: true,
  });

  useEffect(() => {
    if (!supabase) return;

    let active = true;
    const client = supabase;
    client.auth.getSession().then(({ data }) => {
      if (!active) return;
      const user = data.session?.user ?? null;
      setState({ user, loading: false });
      if (user) {
        log("auth_session_found", { email: user.email ?? "" });
        cleanupExpiredPhotos(user).catch(() => {
          log("cleanup_failed", {}, "warn");
        });
      }
    });

    const { data: subscription } = client.auth.onAuthStateChange(
      (event, session) => {
        if (!active) return;
        setState({ user: session?.user ?? null, loading: false });
        log("auth_state_changed", { event }, event === "SIGNED_OUT" ? "info" : "success");
        if (event === "SIGNED_IN" && session?.user) {
          cleanupExpiredPhotos(session.user).catch(() => {
            log("cleanup_failed", {}, "warn");
          });
        }
      }
    );

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  async function signInWithGoogle() {
    if (!supabase) return;
    log("auth_sign_in_started");
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/account` },
    });
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    log("auth_signed_out");
  }

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        loading: supabase ? state.loading : false,
        configured: Boolean(supabase),
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
