import axios from "axios";

const BASE_URL =
    import.meta.env.VITE_ADMIN_API_URL || "http://localhost:5000/admin";

// Create centralized Axios instance
const adminApi = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 15000,
});

// Request Interceptor: Attach Bearer Token from localStorage
adminApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

// Response Interceptor: Catch 401 Unauthorized globally and clear session
adminApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("adminUser");

            // Avoid infinite redirect loop if already on login page
            if (
                typeof window !== "undefined" &&
                !window.location.pathname.includes("/admin/login")
            ) {
                window.location.href = "/admin/login";
            }
        }
        return Promise.reject(error);
    },
);

// Typed API Helper methods
export const authApi = {
    login: (credentials) => adminApi.post("/auth/login", credentials),
    getMe: () => adminApi.get("/auth/me"),
    updateProfile: (profileData) => adminApi.put("/auth/profile", profileData),
    logout: (refreshToken) => adminApi.post("/auth/logout", { refreshToken }),
};

export const dashboardApi = {
    getStats: () => adminApi.get("/dashboard/stats"),
};

export const contactsApi = {
    getAll: (params) => adminApi.get("/contacts", { params }),
    delete: (id) => adminApi.delete(`/contacts/${id}`),
    updateStatus: (id, status) =>
        adminApi.patch(`/contacts/${id}/status`, { status }),
};

export const jobsApi = {
    getAll: () => adminApi.get("/jobs"),
    create: (jobData) => adminApi.post("/jobs", jobData),
    update: (id, jobData) => adminApi.put(`/jobs/${id}`, jobData),
    delete: (id) => adminApi.delete(`/jobs/${id}`),
};

export const applicationsApi = {
    getAll: () => adminApi.get("/applications"),
    updateStatus: (id, status, adminNotes) =>
        adminApi.patch(`/applications/${id}/status`, { status, adminNotes }),
    delete: (id) => adminApi.delete(`/applications/${id}`),
};

export default adminApi;
