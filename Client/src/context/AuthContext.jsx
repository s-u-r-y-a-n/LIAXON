import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
} from "react";
import { authApi } from "../services/adminApi.js";
import { encryptPassword } from "../utils/encryption.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem("adminUser");
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });
    const [accessToken, setAccessToken] = useState(() =>
        localStorage.getItem("accessToken"),
    );
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Verify token validity with backend on mount
    const verifyToken = useCallback(async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            setUser(null);
            setIsAuthenticated(false);
            setLoading(false);
            return;
        }

        try {
            const response = await authApi.getMe();
            const userData =
                response.data?.user ||
                response.data?.data?.admin ||
                response.data?.admin;

            if (userData) {
                setUser(userData);
                setIsAuthenticated(true);
                localStorage.setItem("adminUser", JSON.stringify(userData));
            } else {
                throw new Error("No user payload returned");
            }
        } catch (err) {
            console.warn("Session verification failed, resetting auth state:", err?.message);
            localStorage.removeItem("accessToken");
            localStorage.removeItem("adminUser");
            setUser(null);
            setAccessToken(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        verifyToken();
    }, [verifyToken]);

    /**
     * Authenticate admin using credentials
     * Encrypts password using AES before transmitting over the network
     * @param {string} email
     * @param {string} password
     * @returns {Promise<{success: boolean, message?: string}>}
     */
    const login = async (email, password) => {
        try {
            const encryptedPassword = encryptPassword(password);
            const response = await authApi.login({
                email,
                password: encryptedPassword,
            });
            const token =
                response.data?.accessToken ||
                response.data?.tokens?.accessToken ||
                response.data?.data?.tokens?.accessToken;
            const userData =
                response.data?.user ||
                response.data?.admin ||
                response.data?.data?.admin;

            if (!token) {
                throw new Error("Authentication failed: No access token received.");
            }

            // Persist token and user in localStorage
            localStorage.setItem("accessToken", token);
            if (userData) {
                localStorage.setItem("adminUser", JSON.stringify(userData));
            }

            setAccessToken(token);
            setUser(userData || { email });
            setIsAuthenticated(true);

            return { success: true, message: response.data?.message || "Login successful." };
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                "Invalid email or password.";
            return { success: false, message };
        }
    };

    /**
     * Update in-memory and persisted user profile state
     * @param {Object} userData
     */
    const updateUser = (userData) => {
        if (!userData) return;
        setUser((prev) => {
            const updated = { ...(prev || {}), ...userData };
            try {
                localStorage.setItem("adminUser", JSON.stringify(updated));
            } catch {
                // Ignore storage errors
            }
            return updated;
        });
    };

    /**
     * Clear session and log out
     */
    const logout = async () => {
        try {
            const refreshToken = localStorage.getItem("refreshToken");
            if (refreshToken) {
                await authApi.logout(refreshToken).catch(() => {});
            }
        } catch {
            // Ignore API logout errors during teardown
        } finally {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("adminUser");
            setAccessToken(null);
            setUser(null);
            setIsAuthenticated(false);
            window.location.href = "/admin/login";
        }
    };

    const value = {
        user,
        accessToken,
        isAuthenticated,
        loading,
        login,
        logout,
        updateUser,
        refreshSession: verifyToken,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export default AuthContext;
