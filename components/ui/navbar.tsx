import Link from "next/link";
import { Button } from "./button";

export function Navbar() {
  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <Link href="/" className="font-bold text-xl">
            Debate Forms
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="ghost">Evaluar</Button>
          </Link>
          <Link href="/admin">
            <Button variant="ghost">Admin</Button>
          </Link>
          <Link href="/admin/teams-create">
            <Button variant="outline">Crear Equipo</Button>
          </Link>
          <Link href="/admin/teams-view">
            <Button variant="outline">Ver Equipos</Button>
          </Link>
          <Link href="/admin/results">
            <Button variant="outline">Ver Resultados</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
