import axios from "axios";

const BASE_URL =
    import.meta.env.VITE_PUBLIC_API_URL || "http://localhost:5000/api/v1";

const publicApi = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 15000,
});

export const publicServicesApi = {
    getAll: () => publicApi.get("/services"),
    getBySlug: (slug) => publicApi.get(`/services/${slug}`),
};

export const publicCareersApi = {
    getJobs: () => publicApi.get("/jobs"),
    getJobById: (id) => publicApi.get(`/jobs/${id}`),
    submitApplication: (data) => {
        if (data instanceof FormData) {
            return publicApi.post("/applications", data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
        }
        return publicApi.post("/applications", data);
    },
};

export const publicContactApi = {
    submitInquiry: (data) => publicApi.post("/contact", data),
};

export default publicApi;
