"use client";

import { useEffect, useState } from "react";
import { LeaderboardCard } from "@/components/leaderboard-card";
import { Skeleton } from "@/components/ui/skeleton";

interface Speaker {
  id: string;
  name: string;
  team: string;
  count: number;
}

// Skeleton component for the best orator page
function BestOratorSkeleton() {
  return (
    <div className="container mx-auto py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>
            <Skeleton className="h-4 w-64 mb-6" />
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, itemIndex) => (
                <div
                  key={itemIndex}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-6" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
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
        const categories = ["oradores", "introductores", "r1", "r2", "conclu"];
        const responses = await Promise.all(
          categories.map((category) => fetch(`/api/best/${category}`))
        );

        if (responses.some((res) => !res.ok)) {
          throw new Error("Failed to fetch results");
        }

        const results = await Promise.all(responses.map((res) => res.json()));

        if (results.some((data) => !data.success)) {
          throw new Error("Failed to fetch results");
        }

        setTopOradores(results[0].oradores);
        setTopIntroducers(results[1].introductores);
        setTopR1(results[2].r1);
        setTopR2(results[3].r2);
        setTopConclu(results[4].conclu);
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
      <h1 className="text-3xl font-bold mb-8">Oradores Destacados</h1>
      {loading ? (
        <BestOratorSkeleton />
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
            title="Mejores Conclusores"
            data={topConclu}
            iconColor="text-purple-500"
            caption="Top 5 conclusores más mencionados"
          />
        </div>
      )}
    </div>
  );
}
