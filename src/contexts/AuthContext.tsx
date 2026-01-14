/**
 * AuthContext
 * Provides authentication state and admin check using username/password login.
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import { hashPassword, verifyPassword } from "@/lib/crypto";
import type { Profile } from "@/types/database";

interface AuthContextType {
  user: Profile | null;
  session: string | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (username: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = "admin_session";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin by querying the admins table
  const checkAdminStatus = async (profileId: string) => {
    try {
      const { data, error } = await supabase
        .from("admins")
        .select("profile_id")
        .eq("profile_id", profileId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error checking admin status:", error);
        return false;
      }

      return !!data;
    } catch {
      return false;
    }
  };

  // Load session from localStorage on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        const sessionData = localStorage.getItem(SESSION_KEY);
        if (sessionData) {
          const profileId = sessionData;
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", profileId)
            .single();

          if (profile && !error) {
            setUser(profile);
            const adminStatus = await checkAdminStatus(profile.id);
            setIsAdmin(adminStatus);
          } else {
            // Invalid session, clear it
            localStorage.removeItem(SESSION_KEY);
          }
        }
      } catch (error) {
        console.error("Error loading session:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, []);

  const signIn = async (username: string, password: string) => {
    try {
      // Find user by username
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .single();

      if (error || !profile) {
        return { error: new Error("Invalid username or password") };
      }

      // Verify password
      const isValid = await verifyPassword(password, profile.password_hash);

      if (!isValid) {
        return { error: new Error("Invalid username or password") };
      }

      // Set session
      setUser(profile);
      localStorage.setItem(SESSION_KEY, profile.id);

      // Check admin status
      const adminStatus = await checkAdminStatus(profile.id);
      setIsAdmin(adminStatus);

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem(SESSION_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session: user?.id || null,
        loading,
        isAdmin,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
