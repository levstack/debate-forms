import { prisma } from "@/lib/prisma";
import { TeamCard } from "@/components/team-card";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";

//Forces vercel to revalidate the page every 5 seconds in order to update the teams list without caching
export const dynamic = "force-dynamic";
export const revalidate = 5;

// Define Team type to match the component's expected props
type TeamWithRelations = {
  id: string;
  name: string;
  members: {
    id: string;
    name: string;
    roles: {
      id: string;
      role: string;
      teamType: "AF" | "EC";
    }[];
  }[];
};

// Skeleton component for the teams view
function TeamsViewSkeleton() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Equipos</h1>
        {/* Button placeholder - actual visibility will be controlled by the parent */}
        <div className="invisible">
          <Button disabled>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Equipo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <Skeleton className="h-6 w-32" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, memberIndex) => (
                <div key={memberIndex} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Teams list component that fetches and displays the data
async function TeamsList() {
  // Fetch all teams with their members and roles
  const teams = (await prisma.team.findMany({
    include: {
      members: {
        include: {
          roles: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  })) as unknown as TeamWithRelations[];

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Equipos</h1>
        <Button asChild>
          <Link href="/admin/teams-create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Equipo
          </Link>
        </Button>
      </div>

      {teams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">No hay equipos</h2>
          <p className="text-gray-500 mb-6">
            Aún no se han creado equipos. ¡Crea tu primer equipo para comenzar!
          </p>
          <Button asChild>
            <Link href="/admin/teams-create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Crear Equipo
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}

export default async function TeamsView() {
  return (
    <Suspense fallback={<TeamsViewSkeleton />}>
      <TeamsList />
    </Suspense>
  );
}
