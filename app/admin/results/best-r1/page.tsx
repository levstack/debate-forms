"use client";

import { useEffect, useState } from "react";
import { LeaderboardCard } from "@/components/leaderboard-card";

interface Speaker {
  id: string;
  name: string;
  team: string;
  count: number;
}

export default function BestR1Page() {
  const [topR1, setTopR1] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTopR1() {
      try {
        const response = await fetch("/api/best-r1");

        if (!response.ok) {
          throw new Error("Failed to fetch top R1 speakers");
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to fetch top R1 speakers");
        }

        setTopR1(data.r1);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        console.error("Error fetching top R1 speakers:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTopR1();
  }, []);

  return (
    <div className="container mx-auto py-6">
      {loading ? (
        <p>Cargando...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <LeaderboardCard
          title="Mejores R1"
          data={topR1}
          iconColor="text-green-500"
          caption="Top 5 R1 más mencionados"
        />
      )}
    </div>
  );
}
