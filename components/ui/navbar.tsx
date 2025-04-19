"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Menu, X } from "lucide-react"; // Import icons

export function Navbar() {
  const [teamsOpen, setTeamsOpen] = useState(false);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const NavItems = ({ isMobile = false }) => (
    <>
      <Link
        href="/"
        className={`text-sm font-medium hover:text-accent-foreground ${
          isMobile ? "py-3 b w-full" : ""
        }`}
      >
        Evaluar
      </Link>

      {isMobile ? (
        // Mobile dropdown implementation
        <>
          <div className="w-full py-3 border-b">
            <div className="text-sm font-medium mb-2">Equipos</div>
            <div className="pl-4 flex flex-col gap-2">
              <Link href="/admin/teams-create" className="text-sm">
                Crear Equipo
              </Link>
              <Link href="/admin/teams-view" className="text-sm">
                Ver Equipos
              </Link>
            </div>
          </div>
          <div className="w-full py-3 border-b">
            <div className="text-sm font-medium mb-2">Resultados</div>
            <div className="pl-4 flex flex-col gap-2">
              <Link href="/admin/results" className="text-sm">
                Ver Resultados
              </Link>
              <Link href="/admin/results/best" className="text-sm">
                Ver Mejores Oradores
              </Link>
            </div>
          </div>
        </>
      ) : (
        // Old desktop dropdown implementation
        <>
          <DropdownMenu open={teamsOpen} onOpenChange={setTeamsOpen}>
            <DropdownMenuTrigger
              className="text-sm font-medium hover:text-accent-foreground"
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
        </>
      )}
    </>
  );

  return (
    <nav className="border-b w-full">
      <div className="px-4 py-3 flex items-center justify-between w-full md:px-10">
        <div className="flex items-center gap-3">
          <Image
            src="/Kairos-Logo.png"
            alt="logo"
            height={34}
            width={100}
            priority={true}
            style={{ width: "auto", height: "auto" }}
          ></Image>
          <Link href="/" className="font-semibold text-base md:text-lg">
            Debate Forms
          </Link>
        </div>

        {/* Borgir hidden on md+ */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger className="md:hidden">
            <Menu size={24} />
          </SheetTrigger>
          <SheetContent side="right">
            <div className="flex flex-col items-start pt-10">
              <NavItems isMobile={true} />
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop menu - hidden on mobile, for md+ */}
        <div className="hidden md:flex items-center gap-6">
          <NavItems />
        </div>
      </div>
    </nav>
  );
}
