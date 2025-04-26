"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu,
  X,
  Users,
  Award,
  FilePen,
  Plus,
  Eye,
  BarChart,
  Trophy,
} from "lucide-react"; // Import more icons

export function Navbar() {
  const [teamsOpen, setTeamsOpen] = useState(false);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = useSession();

  const isAdmin = session?.user?.role === "admin";

  // Function to close mobile menu
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const NavItems = ({ isMobile = false }) => (
    <>
      <Link
        href="/admin/evaluate"
        className={`text-sm font-medium hover:text-accent-foreground transition-colors ${
          isMobile ? "py-3 w-full flex items-center gap-2" : ""
        }`}
        onClick={isMobile ? closeMobileMenu : undefined}
      >
        {isMobile && <FilePen size={18} className="text-muted-foreground" />}
        Evaluar
      </Link>

      {isMobile ? (
        // Mobile dropdown implementation
        <>
          <div
            className="w-full py-3 border-b"
            role="group"
            aria-label="Equipos section"
          >
            <div className="text-sm font-medium mb-2 flex items-center gap-2">
              <Users size={18} className="text-muted-foreground" />
              Equipos
            </div>
            <div className="pl-6 flex flex-col gap-3">
              {isAdmin && (
                <Link
                  href="/admin/teams-create"
                  className="text-sm flex items-center gap-2 hover:text-accent-foreground transition-colors"
                  onClick={closeMobileMenu}
                >
                  <Plus size={16} className="text-muted-foreground" />
                  Crear Equipo
                </Link>
              )}
              <Link
                href="/admin/teams-view"
                className="text-sm flex items-center gap-2 hover:text-accent-foreground transition-colors"
                onClick={closeMobileMenu}
              >
                <Eye size={16} className="text-muted-foreground" />
                Ver Equipos
              </Link>
            </div>
          </div>
          <div
            className="w-full py-3 border-b"
            role="group"
            aria-label="Resultados section"
          >
            <div className="text-sm font-medium mb-2 flex items-center gap-2">
              <Award size={18} className="text-muted-foreground" />
              Resultados
            </div>
            <div className="pl-6 flex flex-col gap-3">
              <Link
                href="/admin/results"
                className="text-sm flex items-center gap-2 hover:text-accent-foreground transition-colors"
                onClick={closeMobileMenu}
              >
                <BarChart size={16} className="text-muted-foreground" />
                Ver Resultados
              </Link>
              <Link
                href="/admin/results/best"
                className="text-sm flex items-center gap-2 hover:text-accent-foreground transition-colors"
                onClick={closeMobileMenu}
              >
                <Trophy size={16} className="text-muted-foreground" />
                Ver Mejores Oradores
              </Link>
            </div>
          </div>
        </>
      ) : (
        // Desktop dropdown implementation
        <>
          <DropdownMenu open={teamsOpen} onOpenChange={setTeamsOpen}>
            <DropdownMenuTrigger
              className="text-sm font-medium hover:text-accent-foreground"
              onMouseEnter={() => setTeamsOpen(true)}
              onMouseLeave={() => setTeamsOpen(false)}
              aria-expanded={teamsOpen}
              aria-controls="teams-menu"
              aria-haspopup="true"
            >
              Equipos
            </DropdownMenuTrigger>
            <DropdownMenuContent
              id="teams-menu"
              className="-mt-0.5"
              onMouseEnter={() => setTeamsOpen(true)}
              onMouseLeave={() => setTeamsOpen(false)}
              align="start"
              role="menu"
              aria-label="Equipos menu"
            >
              {isAdmin && (
                <DropdownMenuItem asChild>
                  <Link href="/admin/teams-create" role="menuitem">
                    Crear Equipo
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <Link href="/admin/teams-view" role="menuitem">
                  Ver Equipos
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu open={resultsOpen} onOpenChange={setResultsOpen}>
            <DropdownMenuTrigger
              className="text-sm font-medium hover:text-accent-foreground"
              onMouseEnter={() => setResultsOpen(true)}
              onMouseLeave={() => setResultsOpen(false)}
              aria-expanded={resultsOpen}
              aria-controls="results-menu"
              aria-haspopup="true"
            >
              Resultados
            </DropdownMenuTrigger>
            <DropdownMenuContent
              id="results-menu"
              className="-mt-0.5"
              onMouseEnter={() => setResultsOpen(true)}
              onMouseLeave={() => setResultsOpen(false)}
              align="start"
              role="menu"
              aria-label="Resultados menu"
            >
              <DropdownMenuItem asChild>
                <Link href="/admin/results" role="menuitem">
                  Ver Resultados
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/results/best" role="menuitem">
                  Ver Mejores Oradores
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </>
  );

  return (
    <nav
      className="border-b w-full sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      aria-label="Main navigation"
    >
      <div className="px-4 py-3 flex items-center justify-between w-full md:px-10">
        <div className="flex items-center gap-3">
          <Image
            src="/kairos-logo.png"
            alt="Kairos Logo"
            height={34}
            width={100}
            priority={true}
            style={{ width: "auto", height: "auto" }}
          ></Image>
          <Link href="/" className="font-semibold text-base md:text-lg">
            Debate Forms
          </Link>
        </div>

        {/* Mobile menu button */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger
            className="md:hidden p-2 rounded-md hover:bg-accent transition-colors"
            aria-label="Open main menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {mobileMenuOpen ? (
              <X size={24} aria-hidden="true" />
            ) : (
              <Menu size={24} aria-hidden="true" />
            )}
          </SheetTrigger>
          <SheetContent
            side="right"
            id="mobile-menu"
            aria-label="Mobile navigation menu"
            className="w-[280px] sm:w-[320px] p-0"
          >
            <div className="flex flex-col h-full">
              <div className="p-4 border-b">
                <div className="flex items-center gap-2">
                  <div className="relative w-20 h-8 rounded-md overflow-hidden bg-muted">
                    <Image
                      src="/kairos-logo.png"
                      alt="Placeholder Logo"
                      fill
                      sizes="80px"
                      className="object-cover"
                      placeholder="blur"
                      blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iODAiIGZpbGw9IiMyNTYzZWIiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZiIgZm9udC1mYW1pbHk9InNlbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiPkxvZ288L3RleHQ+PC9zdmc+"
                    />
                  </div>
                  <span className="font-semibold">Sponor logos?</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto py-4">
                <div className="flex flex-col items-start px-4">
                  <NavItems isMobile={true} />
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop menu */}
        <div
          className="hidden md:flex items-center gap-6"
          role="navigation"
          aria-label="Desktop navigation"
        >
          <NavItems />
        </div>
      </div>
    </nav>
  );
}
