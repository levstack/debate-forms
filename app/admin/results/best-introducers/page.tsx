"use client";

import { useEffect, useState } from "react";
import { LeaderboardCard } from "@/components/leaderboard-card";

interface Speaker {
  id: string;
  name: string;
  team: string;
  count: number;
}

export default function BestIntroducersPage() {
  const [topIntroducers, setTopIntroducers] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTopIntroducers() {
      try {
        const response = await fetch("/api/best-introducers");

        if (!response.ok) {
          throw new Error("Failed to fetch top introducers");
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to fetch top introducers");
        }

        setTopIntroducers(data.introducers);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        console.error("Error fetching top introducers:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTopIntroducers();
  }, []);

  return (
    <div className="container mx-auto py-6">
      {loading ? (
        <p>Cargando...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <LeaderboardCard
          title="Mejores Introducciones"
          data={topIntroducers}
          iconColor="text-red-500"
          caption="Top 5 Introducciones más mencionadas"
        />
      )}
    </div>
  );
}
