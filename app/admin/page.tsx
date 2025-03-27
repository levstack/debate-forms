import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export default function AdminPage() {
  return (
    <div>
      <Link
        className={buttonVariants({ variant: "default" })}
        href="/admin/teams-create"
      >
        Crear Equipo
      </Link>
    </div>
  );
}
