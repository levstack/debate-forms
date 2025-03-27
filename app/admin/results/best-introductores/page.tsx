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
    async function fetchResults() {
      try {
        const response = await fetch("/api/best/introductores");

        if (!response.ok) {
          throw new Error("Failed to fetch results");
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error("Failed to fetch results");
        }

        setTopIntroducers(data.introductores);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        console.error("Error fetching results:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, []);

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-8">Mejores Introducciones</h1>
      {loading ? (
        <p>Cargando...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LeaderboardCard
            title="Mejores Introducciones"
            data={topIntroducers}
            iconColor="text-red-500"
            caption="Top 5 Introducciones más mencionadas"
          />
        </div>
      )}
    </div>
  );
}
