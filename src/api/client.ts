export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }))
    throw new ApiError(res.status, (body as { error: string }).error ?? res.statusText)
  }

  return res.json() as Promise<T>
}
