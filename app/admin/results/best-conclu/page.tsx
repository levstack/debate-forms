"use client";

import { useEffect, useState } from "react";
import { LeaderboardCard } from "@/components/leaderboard-card";

interface Speaker {
  id: string;
  name: string;
  team: string;
  count: number;
}

export default function BestConcluPage() {
  const [topConclu, setTopConclu] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTopConclu() {
      try {
        const response = await fetch("/api/best-conclu");

        if (!response.ok) {
          throw new Error("Failed to fetch top concluding speakers");
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(
            data.error || "Failed to fetch top concluding speakers"
          );
        }

        setTopConclu(data.conclu);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        console.error("Error fetching top concluding speakers:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTopConclu();
  }, []);

  return (
    <div className="container mx-auto py-6">
      {loading ? (
        <p>Cargando...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <LeaderboardCard
          title="Mejores Concluyentes"
          data={topConclu}
          iconColor="text-purple-500"
          caption="Top 5 Concluyentes más mencionados"
        />
      )}
    </div>
  );
}
