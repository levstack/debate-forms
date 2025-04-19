"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

interface Evaluation {
  id: string;
  category: "FONDO" | "FORMA" | "OTROS";
  team: "AF" | "EC";
  criteria: string;
  score: number;
  weight: number;
}

interface Result {
  id: string;
  evaluations: Evaluation[];
  mejorOrador?: {
    name: string;
  };
  mejorIntroductor?: {
    name: string;
  };
  mejorR1?: {
    name: string;
  };
  mejorR2?: {
    name: string;
  };
  mejorConclu?: {
    name: string;
  };
}

interface Debate {
  id: string;
  ronda: number;
  aula: number;
  teamAF: {
    name: string;
  };
  teamEC: {
    name: string;
  };
  results: Result[];
}

export default function ResultsPage() {
  const [debates, setDebates] = useState<Debate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDebates() {
      try {
        const response = await fetch("/api/debate");
        if (!response.ok) {
          throw new Error("Failed to fetch debates");
        }
        const data = await response.json();
        if (data.success) {
          setDebates(data.debates);
        } else {
          throw new Error(data.error || "Failed to fetch debates");
        }
      } catch (error) {
        console.error("Error fetching debates:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to fetch debates"
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchDebates();
  }, []);

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className=" mx-auto px-4 py-8 w-full">
      <h1 className="text-2xl font-bold mb-6">Resultados</h1>
      <div className="overflow-x-auto">
        <Table className="table-auto w-full">
          <TableCaption>A list of all debate results</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Ronda</TableHead>
              <TableHead>Aula</TableHead>
              <TableHead>AF Team</TableHead>
              <TableHead>EC Team</TableHead>
              <TableHead>Fondo AF</TableHead>
              <TableHead>Fondo EC</TableHead>
              <TableHead>Forma AF</TableHead>
              <TableHead>Forma EC</TableHead>
              <TableHead>Total AF</TableHead>
              <TableHead>Total EC</TableHead>
              <TableHead>Mejor Orador</TableHead>
              <TableHead>Mejor Intro</TableHead>
              <TableHead>Mejor R1</TableHead>
              <TableHead>Mejor R2</TableHead>
              <TableHead>Mejor Conclu</TableHead>
              <TableHead>Ganador</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {debates.map((debate) => {
              const result = debate.results[0]; // Get the first result
              if (!result) return null;

              // Calculate scores by category and team
              const scores = {
                AF: {
                  FONDO: 0,
                  FORMA: 0,
                  OTROS: 0,
                },
                EC: {
                  FONDO: 0,
                  FORMA: 0,
                  OTROS: 0,
                },
              };

              result.evaluations.forEach((evaluation) => {
                scores[evaluation.team][evaluation.category] +=
                  evaluation.score * evaluation.weight;
              });

              // Calculate totals
              const totalAF =
                scores.AF.FONDO + scores.AF.FORMA + scores.AF.OTROS;
              const totalEC =
                scores.EC.FONDO + scores.EC.FORMA + scores.EC.OTROS;

              // Determine winner
              const winner =
                totalAF > totalEC ? "AF" : totalEC > totalAF ? "EC" : "Tie";

              return (
                <TableRow key={debate.id}>
                  <TableCell>{debate.ronda}</TableCell>
                  <TableCell>{debate.aula}</TableCell>
                  <TableCell>{debate.teamAF.name}</TableCell>
                  <TableCell>{debate.teamEC.name}</TableCell>
                  <TableCell>{scores.AF.FONDO.toFixed(2)}</TableCell>
                  <TableCell>{scores.EC.FONDO.toFixed(2)}</TableCell>
                  <TableCell>{scores.AF.FORMA.toFixed(2)}</TableCell>
                  <TableCell>{scores.EC.FORMA.toFixed(2)}</TableCell>
                  <TableCell className="font-bold">
                    {totalAF.toFixed(2)}
                  </TableCell>
                  <TableCell className="font-bold">
                    {totalEC.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {result.mejorOrador?.name || "No seleccionado"}
                  </TableCell>
                  <TableCell>
                    {result.mejorIntroductor?.name || "No seleccionado"}
                  </TableCell>
                  <TableCell>
                    {result.mejorR1?.name || "No seleccionado"}
                  </TableCell>
                  <TableCell>
                    {result.mejorR2?.name || "No seleccionado"}
                  </TableCell>
                  <TableCell>
                    {result.mejorConclu?.name || "No seleccionado"}
                  </TableCell>
                  <TableCell
                    className={`font-bold ${
                      winner === "AF"
                        ? "text-blue-600"
                        : winner === "EC"
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
                    {winner === "Tie"
                      ? "Empate"
                      : winner === "AF"
                      ? debate.teamAF.name
                      : debate.teamEC.name}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <Link
          href="/admin/results/best"
          className={buttonVariants({ variant: "default" })}
        >
          Ver mejores oradores
        </Link>
      </div>
    </div>
  );
}
