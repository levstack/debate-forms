import { prisma } from "@/lib/prisma";
import { TeamCard } from "./components/team-card";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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

export default async function TeamsView() {
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
        <div className="grid gap-6">
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
