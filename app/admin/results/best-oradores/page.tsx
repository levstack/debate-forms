"use client";

import { useEffect, useState } from "react";
import { LeaderboardCard } from "@/components/leaderboard-card";

interface Speaker {
  id: string;
  name: string;
  team: string;
  count: number;
}

export default function BestOradoresPage() {
  const [topOradores, setTopOradores] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTopOradores() {
      try {
        const response = await fetch("/api/best-oradores");

        if (!response.ok) {
          throw new Error("Failed to fetch top oradores");
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to fetch top oradores");
        }

        setTopOradores(data.oradores);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        console.error("Error fetching top oradores:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTopOradores();
  }, []);

  return (
    <div className="container mx-auto py-6">
      {loading ? (
        <p>Cargando...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <LeaderboardCard
          title="Mejores Oradores"
          data={topOradores}
          iconColor="text-yellow-500"
          caption="Top 5 Oradores más mencionados"
        />
      )}
    </div>
  );
}
