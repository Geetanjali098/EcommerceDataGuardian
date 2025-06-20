// src/api/config.ts or src/lib/config.ts

import { QueryClient, QueryFunction, QueryFunctionContext } from "@tanstack/react-query";

// Optional: Define a custom error class
export class ApiError extends Error {
  constructor(public status: number, message: string, public details?: any) {
    super(message);
    this.name = "ApiError";
  }
}

// Throw if response is not OK
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let details = null;
    try {
      details = await res.json().catch(() => undefined);
    } catch {
      details = await res.text().catch(() => undefined);
    }

    throw new ApiError(
      res.status,
      details?.message || res.statusText,
      details
    );
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";

// 🔌 Your reusable query function factory
export const getQueryFn = <T>(options: {
  on401: UnauthorizedBehavior;
}): QueryFunction<T> => {
  return async (ctx: QueryFunctionContext) => {
    const { queryKey, signal } = ctx;

    const url = queryKey[0] as string;
    const token = localStorage.getItem("token");

    const headers = new Headers({
      "Accept": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });

    const fetchOptions: RequestInit = {
      headers,
      credentials: "include",
      ...(signal ? { signal } : {}),
    };

    try {
      const res = await fetch(url, fetchOptions);

      if (res.status === 401) {
        if (options.on401 === "returnNull") {
          return null as T;
        }
        localStorage.removeItem("token");
        window.location.href = "/login";
        throw new ApiError(401, "Unauthorized");
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (err: any) {
      if (err.name === "AbortError") {
        if (import.meta.env.DEV) console.debug("🔄 Request Aborted");
        return null as T;
      }
      throw err;
    }
  };
};

// ✅ Create and export the configured QueryClient
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      staleTime: Infinity,
      retry: false,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
;