// Storage utilities for better token management
export const storage = {
  // Get token from localStorage
  getToken: (): string | null => {
    try {
      return localStorage.getItem("token");
    } catch (error) {
      console.error("Error getting token from storage:", error);
      return null;
    }
  },

  // Set token in localStorage
  setToken: (token: string): void => {
    try {
      localStorage.setItem("token", token);
    } catch (error) {
      console.error("Error setting token in storage:", error);
    }
  },

  // Get user from localStorage
  getUser: (): any | null => {
    try {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error("Error getting user from storage:", error);
      return null;
    }
  },

  // Set user in localStorage
  setUser: (user: any): void => {
    try {
      localStorage.setItem("user", JSON.stringify(user));
    } catch (error) {
      console.error("Error setting user in storage:", error);
    }
  },

  // Clear all auth data
  clearAuth: (): void => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch (error) {
      console.error("Error clearing auth from storage:", error);
    }
  },

  // Check if we have auth data
  hasAuthData: (): boolean => {
    return !!(storage.getToken() && storage.getUser());
  },
};
