const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

export async function apiRequest(endpoint: string, data?: any, method = "POST", headers = {}) {
  const isFormData = data instanceof FormData;
  
  const requestHeaders: HeadersInit = isFormData 
    ? { ...headers } // Don't set Content-Type for FormData, let browser handle it
    : { "Content-Type": "application/json", ...headers };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: requestHeaders,
    body: isFormData ? data : (data ? JSON.stringify(data) : undefined),
    credentials: "include", // for cookies/JWT if needed
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error || json.message || "Something went wrong");
  return json;
}

// Helper function to get user data
export async function getCurrentUser() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  
  try {
    return await apiRequest("/auth/me", null, "GET", { 
      Authorization: `Bearer ${token}` 
    });
  } catch (error) {
    // Token might be invalid, remove it
    localStorage.removeItem("token");
    return null;
  }
}
