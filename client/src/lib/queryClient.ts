import { QueryClient, QueryFunction, QueryFunctionContext } from "@tanstack/react-query";

/** 🔐 Custom API Error for consistent error handling */
class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** 🚨 Throw detailed error if fetch response not ok */
async function throwIfResNotOk(res: Response): Promise<void> {
  if (!res.ok) {
    let errorDetails: unknown;

    try {
      errorDetails = await res.json();
    } catch {
      errorDetails = await res.text();
    }

    const message =
      errorDetails && typeof errorDetails === "object" && "message" in errorDetails
        ? (errorDetails as { message: string }).message
        : res.statusText;

    throw new ApiError(res.status, message, errorDetails);
  }
}

/** ✨ Standardized API request (can be reused elsewhere if needed) */
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown
): Promise<Response> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(data ? { "Content-Type": "application/json" } : {}),
  };

  const token = localStorage.getItem("token");
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      console.warn("🔒 Authentication required");
    }
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";

/** 🔁 Query function with graceful 401 + abort handling */
export const getQueryFn = <T>(options: {
  on401: UnauthorizedBehavior;
}): QueryFunction<T> => {
  return async ({ queryKey, signal }: QueryFunctionContext) => {
    if (!Array.isArray(queryKey) || typeof queryKey[0] !== "string") {
      throw new Error("queryKey must be an array with a valid URL string as the first item");
    }

    const url = queryKey[0];
    const token = localStorage.getItem("token");
  

    const headers = new Headers({
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });

   const fetchOptions: RequestInit = {
      method: "GET",
      headers,     
      ...(signal ? { signal } : {}),
    };

    try {
      const res = await fetch(url, fetchOptions);
      
      if (res.status === 401) {
        if (options.on401 === "returnNull") {
          return null as T;
        }
        throw new ApiError(401, "Unauthorized");
      }

      await throwIfResNotOk(res);
      const data = await res.json();

      if (process.env.NODE_ENV === "development") {
        console.debug("✅ API Response:", data);
      }

      return data as T;
    } catch (error: unknown) {
      if (error instanceof Error && error.name === "AbortError") {
        if (process.env.NODE_ENV === "development") {
          console.debug("⏹️ Fetch was aborted by React Query (harmless)");
        }
        return null as T; // Suppress abort errors
      }

      throw error; // Let all other errors bubble up
    }
  };
};

/** 🔧 React Query Client Setup */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      retry: false,
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      refetchInterval: false,
    },
    mutations: {
      retry: false,
    },
  },
});
 