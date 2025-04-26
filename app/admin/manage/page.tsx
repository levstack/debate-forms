"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export default function ManagePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState({
    purgeDebates: false,
    purgeAll: false,
  });

  const handlePurgeDebates = async () => {
    try {
      setIsLoading({ ...isLoading, purgeDebates: true });
      const response = await fetch("/api/admin/purge-debates", {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to purge debates");
      }

      alert(
        "All debates, results, and evaluations have been purged successfully"
      );
      router.refresh();
    } catch (error) {
      console.error("Error purging debates:", error);
      alert(
        `Error purging debates: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsLoading({ ...isLoading, purgeDebates: false });
    }
  };

  const handlePurgeAll = async () => {
    try {
      setIsLoading({ ...isLoading, purgeAll: true });
      const response = await fetch("/api/admin/purge-all", {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to purge database");
      }

      alert("All data has been purged successfully");
      router.refresh();
    } catch (error) {
      console.error("Error purging all data:", error);
      alert(
        `Error purging all data: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsLoading({ ...isLoading, purgeAll: false });
    }
  };

  return (
    <div className="container py-10 space-y-8">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">Database Management</h1>
          <Badge variant="destructive">Admin Only</Badge>
        </div>
        <p className="text-muted-foreground mt-2">
          Manage teams, debates, and database records. Use with caution - these
          actions cannot be undone.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Teams Management</CardTitle>
            <CardDescription>View and delete individual teams</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              The teams view page allows you to manage individual teams,
              including deleting them.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/admin/teams-view")}>
              Manage Teams
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Purge Debate Data</CardTitle>
            <CardDescription>
              Remove all debates, results, and evaluations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              This will delete all debate records, results, and evaluations from
              the database. Teams and team members will remain intact.
            </p>
          </CardContent>
          <CardFooter>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Purge Debates</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all debates, results, and
                    evaluations. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isLoading.purgeDebates}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handlePurgeDebates}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={isLoading.purgeDebates}
                  >
                    {isLoading.purgeDebates
                      ? "Purging..."
                      : "Purge All Debates"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Complete Database Purge</CardTitle>
            <CardDescription>Remove all data from the database</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              This will delete ALL data including teams, team members, debates,
              results, and evaluations. The database will be completely empty
              after this operation.
            </p>
          </CardContent>
          <CardFooter>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Purge All Data</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    DANGER: Complete Database Purge
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete ALL data from the database,
                    including:
                  </AlertDialogDescription>
                  <ul className="list-disc mt-2 pl-6 space-y-1 text-sm text-muted-foreground">
                    <li>All teams</li>
                    <li>All team members</li>
                    <li>All debates</li>
                    <li>All results</li>
                    <li>All evaluations</li>
                  </ul>
                  <div className="mt-3 text-sm text-muted-foreground font-semibold">
                    This action cannot be undone. Are you absolutely sure?
                  </div>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isLoading.purgeAll}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handlePurgeAll}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={isLoading.purgeAll}
                  >
                    {isLoading.purgeAll ? "Purging..." : "Purge ALL Data"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
