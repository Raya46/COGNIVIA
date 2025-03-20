import { useCheckSession } from "@/hooks/useUser";
import { supabase } from "@/supabase/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

interface UserData {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  userData: UserData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { checkSession } = useCheckSession();

  useEffect(() => {
    const initSession = async () => {
      try {
        setIsLoading(true);
        const hasSession = await checkSession();

        if (hasSession) {
          await fetchUserData();
          setIsAuthenticated(true);
        } else {
          setUserData(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error initializing session:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          await AsyncStorage.setItem("token", session.access_token);
          await fetchUserData();
          setIsAuthenticated(true);
        } else if (event === "SIGNED_OUT") {
          await AsyncStorage.removeItem("token");
          setUserData(null);
          setIsAuthenticated(false);
        }
      }
    );

    initSession();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchUserData = async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        throw error || new Error("User not found");
      }

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id, username, email")
        .eq("email", user.email)
        .single();

      if (userError) {
        setUserData({
          id: user.id,
          email: user.email || "",
          username: user.email?.split("@")[0] || "",
        });
      } else {
        setUserData(userData);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        userData,
        isLoading,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
