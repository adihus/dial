import { QueryClient } from "@tanstack/react-query";

async function defaultFetcher({ queryKey }: { queryKey: readonly unknown[] }) {
  const url = queryKey.join("/").replace(/\/\//g, "/");
  const res = await fetch(url as string, { credentials: "include" });
  if (res.status === 401) {
    return null;
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text}`);
  }
  return res.json();
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultFetcher as any,
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 1000 * 30,
    },
  },
});

export async function apiRequest(
  method: string,
  url: string,
  body?: unknown
): Promise<any> {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });
  if (!res.ok) {
    let message = res.statusText;
    try {
      const data = await res.json();
      message = data.message || message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  return res.json();
}
