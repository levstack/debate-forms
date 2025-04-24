import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          className={
            buttonVariants({ variant: "default", size: "lg" }) +
            " h-24 flex flex-col items-center justify-center text-center"
          }
          href="/admin/teams-create"
        >
          <span className="text-lg font-medium">Create Teams</span>
          <span className="text-sm opacity-80">
            Create and manage debate teams
          </span>
        </Link>

        <Link
          className={
            buttonVariants({ variant: "default", size: "lg" }) +
            " h-24 flex flex-col items-center justify-center text-center"
          }
          href="/admin/teams-view"
        >
          <span className="text-lg font-medium">View Teams</span>
          <span className="text-sm opacity-80">
            View and edit existing teams
          </span>
        </Link>

        <Link
          className={
            buttonVariants({ variant: "default", size: "lg" }) +
            " h-24 flex flex-col items-center justify-center text-center"
          }
          href="/admin/results"
        >
          <span className="text-lg font-medium">Results</span>
          <span className="text-sm opacity-80">
            View debate results and statistics
          </span>
        </Link>

        <Link
          className={
            buttonVariants({ variant: "default", size: "lg" }) +
            " h-24 flex flex-col items-center justify-center text-center"
          }
          href="/admin/results/best"
        >
          <span className="text-lg font-medium">Best Results</span>
          <span className="text-sm opacity-80">
            View top-performing teams and debates
          </span>
        </Link>
      </div>
    </div>
  );
}
