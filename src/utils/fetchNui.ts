const RESOURCE_NAME = 'forge-npwd-garage';
export async function fetchNui<TResponse, TData = unknown>(event: string, data?: TData): Promise<TResponse> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(`https://${RESOURCE_NAME}/${event}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      body: JSON.stringify(data ?? {}), signal: controller.signal,
    });
    if (!response.ok) throw new Error('A garagem não respondeu. Tente novamente.');
    return await response.json() as TResponse;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw new Error('A consulta demorou demais. Tente novamente.');
    throw error;
  } finally { window.clearTimeout(timeout); }
}
