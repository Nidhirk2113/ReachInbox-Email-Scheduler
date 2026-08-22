import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import api from "../lib/api";

export interface User {
  id: string;
  googleId?: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  loginWithGoogle: (
    credential: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateAvatar: (avatarUrl: string) => void;
}

const AuthContext =
  createContext<AuthContextValue | undefined>(
    undefined
  );

const CUSTOM_AVATAR_KEY =
  "reachinbox_custom_avatar";

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  const applyCustomAvatar = (
    currentUser: User
  ): User => {
    const customAvatar =
      localStorage.getItem(
        CUSTOM_AVATAR_KEY
      );

    if (!customAvatar) {
      return currentUser;
    }

    return {
      ...currentUser,
      avatarUrl: customAvatar,
    };
  };

  const refreshUser = async () => {
    try {
      const response =
        await api.get("/auth/me");

      const currentUser =
        response.data.user;

      setUser(
        applyCustomAvatar(currentUser)
      );
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await refreshUser();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const loginWithGoogle = async (
    credential: string
  ) => {
    const response =
      await api.post("/auth/google", {
        credential,
      });

    const loggedInUser =
      response.data.user;

    setUser(
      applyCustomAvatar(loggedInUser)
    );
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setUser(null);
    }
  };

  const updateAvatar = (
    avatarUrl: string
  ) => {
    localStorage.setItem(
      CUSTOM_AVATAR_KEY,
      avatarUrl
    );

    setUser((currentUser) => {
      if (!currentUser) {
        return currentUser;
      }

      return {
        ...currentUser,
        avatarUrl,
      };
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithGoogle,
        logout,
        refreshUser,
        updateAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}