"use client";
import Link from "next/link";
import Logo from "@/public/Kairos-Logo.svg";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const [teamsOpen, setTeamsOpen] = useState(false);
  const [resultsOpen, setResultsOpen] = useState(false);

  return (
    <nav className="border-b w-full">
      <div className="px-10 py-3 flex items-center justify-between w-full pr-40">
        <div className="flex items-center gap-3">
          <Logo width={120} height={52} className="h-8 w-auto" />
          <Link href="/" className="font-semibold text-lg">
            Debate Forms
          </Link>
        </div>
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium hover:text-accent-foreground"
          >
            Evaluar
          </Link>

          <DropdownMenu open={teamsOpen} onOpenChange={setTeamsOpen}>
            <DropdownMenuTrigger
              className="text-sm font-medium hover:text-accent-foreground "
              onMouseEnter={() => setTeamsOpen(true)}
              onMouseLeave={() => setTeamsOpen(false)}
            >
              Equipos
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="-mt-0.5"
              onMouseEnter={() => setTeamsOpen(true)}
              onMouseLeave={() => setTeamsOpen(false)}
              align="start"
            >
              <DropdownMenuItem asChild>
                <Link href="/admin/teams-create">Crear Equipo</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/teams-view">Ver Equipos</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu open={resultsOpen} onOpenChange={setResultsOpen}>
            <DropdownMenuTrigger
              className="text-sm font-medium hover:text-accent-foreground"
              onMouseEnter={() => setResultsOpen(true)}
              onMouseLeave={() => setResultsOpen(false)}
            >
              Resultados
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="-mt-0.5"
              onMouseEnter={() => setResultsOpen(true)}
              onMouseLeave={() => setResultsOpen(false)}
              align="start"
            >
              <DropdownMenuItem asChild>
                <Link href="/admin/results">Ver Resultados</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/results/best">Ver Mejores Oradores</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
