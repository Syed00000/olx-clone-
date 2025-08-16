import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { config } from "./config";

// Determine the base API URL based on the environment
const API_BASE_URL = config.api.baseUrl;

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Construct full URL for production, or use relative URL for development
  const fullUrl = API_BASE_URL ? `${API_BASE_URL}${url}` : url;
  
  // Debug logging
  console.log('Current hostname:', window.location.hostname);
  console.log('API_BASE_URL:', API_BASE_URL);
  console.log(`${method} URL being called:`, fullUrl);
  console.log('Config:', config);
  
  const res = await fetch(fullUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey.join("/") as string;
    const fullUrl = API_BASE_URL ? `${API_BASE_URL}/${url}` : `/${url}`;
    
    // Debug logging
    console.log('Current hostname:', window.location.hostname);
    console.log('API_BASE_URL:', API_BASE_URL);
    console.log(`GET URL being called:`, fullUrl);
    console.log('Config:', config);
    
    const res = await fetch(fullUrl, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});