"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DeleteTeamButton } from "./delete-team-button";

// Define types based on the schema
interface TeamRole {
  id: string;
  role: string;
  teamType: "AF" | "EC";
}

interface TeamMember {
  id: string;
  name: string;
  roles: TeamRole[];
}

interface Team {
  id: string;
  name: string;
  members: TeamMember[];
}

interface TeamCardProps {
  team: Team;
}

// Helper function to get role label
const getRoleLabel = (role: string) => {
  switch (role) {
    case "INTRO":
      return "Introducción";
    case "R1":
      return "Refutador 1";
    case "R2":
      return "Refutador 2";
    case "CONCLU":
      return "Conclusión";
    case "CAPITAN":
      return "Capitán";
    default:
      return role;
  }
};

export function TeamCard({ team }: TeamCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle>{team.name}</CardTitle>
          <CardDescription>
            {team.members.length}{" "}
            {team.members.length === 1 ? "miembro" : "miembros"}
          </CardDescription>
        </div>
        <DeleteTeamButton teamId={team.id} teamName={team.name} />
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>Lista de miembros y roles</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Roles AF</TableHead>
              <TableHead>Roles EC</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {team.members.map((member) => {
              // Filter roles by team type
              const afRoles = member.roles.filter(
                (role) => role.teamType === "AF"
              );
              const ecRoles = member.roles.filter(
                (role) => role.teamType === "EC"
              );

              return (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>
                    {afRoles.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {afRoles.map((role) => (
                          <Badge
                            key={role.id}
                            variant="outline"
                            className="bg-blue-50"
                          >
                            {getRoleLabel(role.role)}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {ecRoles.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {ecRoles.map((role) => (
                          <Badge
                            key={role.id}
                            variant="outline"
                            className="bg-amber-50"
                          >
                            {getRoleLabel(role.role)}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
