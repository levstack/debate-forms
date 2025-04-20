export interface Team {
  id: string;
  name: string;
}

interface ApiResponse {
  success: boolean;
  teams?: Team[];
  error?: string;
  message?: string;
}

export async function getAllTeams(): Promise<Team[]> {
  const response = await fetch("/api/teams");

  if (!response.ok) {
    throw new Error("Failed to fetch teams");
  }

  const data: ApiResponse = await response.json();

  if (!data.success || !data.teams) {
    throw new Error(data.message || "Failed to fetch teams");
  }

  return data.teams;
}
