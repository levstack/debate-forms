"use client";

import { useEffect, useState } from "react";
import { LeaderboardCard } from "@/components/leaderboard-card";

interface Speaker {
  id: string;
  name: string;
  team: string;
  count: number;
}

export default function BestResultsPage() {
  const [topOradores, setTopOradores] = useState<Speaker[]>([]);
  const [topIntroducers, setTopIntroducers] = useState<Speaker[]>([]);
  const [topR1, setTopR1] = useState<Speaker[]>([]);
  const [topR2, setTopR2] = useState<Speaker[]>([]);
  const [topConclu, setTopConclu] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAllResults() {
      try {
        const [oradoresRes, introducersRes, r1Res, r2Res, concluRes] =
          await Promise.all([
            fetch("/api/best-oradores"),
            fetch("/api/best-introducers"),
            fetch("/api/best-r1"),
            fetch("/api/best-r2"),
            fetch("/api/best-conclu"),
          ]);

        if (
          !oradoresRes.ok ||
          !introducersRes.ok ||
          !r1Res.ok ||
          !r2Res.ok ||
          !concluRes.ok
        ) {
          throw new Error("Failed to fetch results");
        }

        const [oradoresData, introducersData, r1Data, r2Data, concluData] =
          await Promise.all([
            oradoresRes.json(),
            introducersRes.json(),
            r1Res.json(),
            r2Res.json(),
            concluRes.json(),
          ]);

        if (
          !oradoresData.success ||
          !introducersData.success ||
          !r1Data.success ||
          !r2Data.success ||
          !concluData.success
        ) {
          throw new Error("Failed to fetch results");
        }

        setTopOradores(oradoresData.oradores);
        setTopIntroducers(introducersData.introducers);
        setTopR1(r1Data.r1);
        setTopR2(r2Data.r2);
        setTopConclu(concluData.conclu);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        console.error("Error fetching results:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAllResults();
  }, []);

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-8">Mejores Resultados</h1>
      {loading ? (
        <p>Cargando...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LeaderboardCard
            title="Mejores Oradores"
            data={topOradores}
            iconColor="text-yellow-500"
            caption="Top 5 Oradores más mencionados"
          />
          <LeaderboardCard
            title="Mejores Introducciones"
            data={topIntroducers}
            iconColor="text-red-500"
            caption="Top 5 Introducciones más mencionadas"
          />
          <LeaderboardCard
            title="Mejores R1"
            data={topR1}
            iconColor="text-green-500"
            caption="Top 5 R1 más mencionados"
          />
          <LeaderboardCard
            title="Mejores R2"
            data={topR2}
            iconColor="text-blue-500"
            caption="Top 5 R2 más mencionados"
          />
          <LeaderboardCard
            title="Mejores Concluyentes"
            data={topConclu}
            iconColor="text-purple-500"
            caption="Top 5 Concluyentes más mencionados"
          />
        </div>
      )}
    </div>
  );
}
