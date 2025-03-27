"use client";

import { useEffect, useState } from "react";
import { LeaderboardCard } from "@/components/leaderboard-card";

interface Speaker {
  id: string;
  name: string;
  team: string;
  count: number;
}

export default function BestR2Page() {
  const [topR2, setTopR2] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTopR2() {
      try {
        const response = await fetch("/api/best-r2");

        if (!response.ok) {
          throw new Error("Failed to fetch top R2 speakers");
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to fetch top R2 speakers");
        }

        setTopR2(data.r2);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        console.error("Error fetching top R2 speakers:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTopR2();
  }, []);

  return (
    <div className="container mx-auto py-6">
      {loading ? (
        <p>Cargando...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <LeaderboardCard
          title="Mejores R2"
          data={topR2}
          iconColor="text-blue-500"
          caption="Top 5 R2 más mencionados"
        />
      )}
    </div>
  );
}
