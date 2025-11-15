import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { authAPI } from "../services/api";
import { User } from "../types";
import { storage } from "../utils/storage";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for existing token on app load
        const savedToken = storage.getToken();
        const savedUser = storage.getUser();

        console.log(
          "Initializing auth - Token exists:",
          !!savedToken,
          "User exists:",
          !!savedUser
        );

        if (savedToken && savedUser) {
          // Set token and user first (optimistic approach)
          setToken(savedToken);
          setUser(savedUser);

          // Then validate token in the background
          try {
            const profileResponse = await authAPI.getProfile();
            console.log(
              "Token validation successful, user:",
              profileResponse.user?.email
            );
          } catch (error: any) {
            // Token is invalid or expired, clear everything
            console.log(
              "Token validation failed:",
              error.response?.status,
              error.message
            );
            storage.clearAuth();
            setToken(null);
            setUser(null);
          }
        } else {
          console.log("No saved auth data found");
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        // Clear potentially corrupted data
        storage.clearAuth();
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
        console.log("Auth initialization completed");
      }
    };

    initializeAuth();
  }, []);

  const login = (newToken: string, newUser: User) => {
    console.log("Logging in user:", newUser.email);
    storage.setToken(newToken);
    storage.setUser(newUser);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    console.log("Logging out user");
    storage.clearAuth();
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token && !!user,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
