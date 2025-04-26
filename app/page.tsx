"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LogIn } from "lucide-react";

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
  createdAt: string;
}

function DebateSkeleton() {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-4 w-40 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-5 w-1/3" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Home() {
  const [debates, setDebates] = useState<Debate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

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
        }
      } catch (error) {
        console.error("Error fetching debates:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDebates();
  }, []);

  function formatDate(dateString: string) {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("es-ES", options);
  }

  return (
    <div className="container max-w-5xl mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Debates</h1>
          <p className="text-gray-500">
            Estos son los debates que ya hemos evaluado.
          </p>
        </div>
        {isAuthenticated && (
          <Link href="/admin/evaluate">
            <Button size="lg">Evaluar un nuevo debate</Button>
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <DebateSkeleton key={i} />
          ))}
        </div>
      ) : debates.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {debates.map((debate) => (
            <Card key={debate.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">
                    Ronda {debate.ronda}, Aula {debate.aula}
                  </CardTitle>
                  <Badge variant="outline">
                    {formatDate(debate.createdAt)}
                  </Badge>
                </div>
                <CardDescription>Debate entre equipos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between mt-2">
                  <div className="flex flex-col">
                    <Badge variant="secondary" className="mb-1 bg-blue-50">
                      Equipo AF
                    </Badge>
                    <span className="font-medium">{debate.teamAF.name}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <Badge variant="secondary" className="mb-1 bg-amber-50">
                      Equipo EC
                    </Badge>
                    <span className="font-medium">{debate.teamEC.name}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <h3 className="text-lg font-medium mb-2">
            No hay debates registrados
          </h3>
          <p className="text-muted-foreground">
            Los debates aparecerán aquí una vez que sean registrados en el
            sistema.
          </p>
        </div>
      )}
    </div>
  );
}
