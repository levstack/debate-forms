"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusCircle, X, Check } from "lucide-react";

// Available roles
const ROLES = ["INTRO", "R1", "R2", "CONCLU", "CAPITAN"] as const;
type Role = (typeof ROLES)[number];

// Schema for team creation form
const teamFormSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre del equipo debe tener al menos 2 caracteres")
    .max(18, "El nombre del equipo no puede tener más de 18 caracteres"),
  members: z
    .array(
      z.object({
        name: z
          .string()
          .min(2, "El nombre debe tener al menos 2 caracteres")
          .max(18, "El nombre no puede tener más de 18 caracteres"),
        rolesAF: z
          .array(z.enum(ROLES))
          .min(1, "Selecciona al menos un rol")
          .max(2, "No puedes seleccionar más de 2 roles"),
        rolesEC: z
          .array(z.enum(ROLES))
          .min(1, "Selecciona al menos un rol")
          .max(2, "No puedes seleccionar más de 2 roles"),
      })
    )
    .min(3, "El equipo debe tener al menos 3 miembros")
    .max(5, "El equipo no puede tener más de 5 miembros"),
});

type TeamFormValues = z.infer<typeof teamFormSchema>;

const roles = [
  { value: "INTRO", label: "Introducción" },
  { value: "R1", label: "Refutación 1" },
  { value: "R2", label: "Refutación 2" },
  { value: "CONCLU", label: "Conclusión" },
  { value: "CAPITAN", label: "Capitán" },
];

export default function TeamsCreate() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  // Initialize the form hook
  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      name: "",
      members: [
        { name: "", rolesAF: ["INTRO"], rolesEC: ["INTRO"] },
        { name: "", rolesAF: ["R1"], rolesEC: ["R1"] },
        { name: "", rolesAF: ["R2"], rolesEC: ["R2"] },
        { name: "", rolesAF: ["CONCLU"], rolesEC: ["CONCLU"] },
      ],
    },
  });

  // Initialize field array
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "members",
  });

  // Redirect if not logged in as admin
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/login");
    }
  }, [session, status, router]);

  // Toggle role selection (add or remove)
  const toggleRole = (
    currentRoles: Role[],
    role: Role,
    onChange: (value: Role[]) => void
  ) => {
    if (currentRoles.includes(role)) {
      // Remove role if already selected
      onChange(currentRoles.filter((r) => r !== role));
    } else if (currentRoles.length < 2) {
      // Add role if less than 2 roles selected
      onChange([...currentRoles, role]);
    }
  };

  const onSubmit = async (data: TeamFormValues) => {
    setIsSubmitting(true);
    try {
      // Create the team in the database
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();

        // Handle specific error for duplicate team name
        if (error.message === "Ya existe un equipo con este nombre") {
          form.setError("name", {
            type: "manual",
            message: "Ya existe un equipo con este nombre",
          });
          throw new Error(error.message);
        }

        // Handle role conflict errors
        if (error.message && error.message.includes("ya está asignado")) {
          // Show a general form error for role conflicts
          form.setError("root", {
            type: "manual",
            message: error.message,
          });
          throw new Error(error.message);
        }

        throw new Error(error.message || "Error al crear el equipo");
      }

      toast.success("Equipo creado correctamente");
      form.reset();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al crear el equipo"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (status === "loading") {
    return <div className="container mx-auto py-6">Cargando...</div>;
  }

  // No access
  if (status === "authenticated" && session?.user?.role !== "admin") {
    return null;
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Crear Nuevo Equipo</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Información del Equipo</CardTitle>
              <CardDescription>
                Ingresa el nombre del equipo y añade entre 3 y 5 miembros.
              </CardDescription>
              <div className="mt-2 text-sm text-amber-600">
                Importante: Cada equipo debe tener asignados los roles de
                Introducción, Refutación 1, Refutación 2 y Conclusión tanto en
                AF como en EC.
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {form.formState.errors.root && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md mb-4">
                  {form.formState.errors.root.message}
                </div>
              )}

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Equipo</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre del equipo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Miembros del Equipo</h3>
                  {fields.length < 5 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        append({
                          name: "",
                          rolesAF: ["INTRO"],
                          rolesEC: ["INTRO"],
                        })
                      }
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Añadir Miembro
                    </Button>
                  )}
                </div>

                {fields.map((field, index) => (
                  <Card key={field.id} className="relative">
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 gap-4">
                        <FormField
                          control={form.control}
                          name={`members.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nombre</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Nombre del miembro"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name={`members.${index}.rolesAF`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Roles en AF (máximo 2)</FormLabel>
                                <FormControl>
                                  <div className="flex flex-wrap gap-2">
                                    {roles.map((role) => (
                                      <Button
                                        key={role.value}
                                        type="button"
                                        variant={
                                          field.value.includes(
                                            role.value as Role
                                          )
                                            ? "default"
                                            : "outline"
                                        }
                                        size="sm"
                                        onClick={() =>
                                          toggleRole(
                                            field.value as Role[],
                                            role.value as Role,
                                            field.onChange
                                          )
                                        }
                                      >
                                        {role.label}
                                      </Button>
                                    ))}
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`members.${index}.rolesEC`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Roles en EC (máximo 2)</FormLabel>
                                <FormControl>
                                  <div className="flex flex-wrap gap-2">
                                    {roles.map((role) => (
                                      <Button
                                        key={role.value}
                                        type="button"
                                        variant={
                                          field.value.includes(
                                            role.value as Role
                                          )
                                            ? "default"
                                            : "outline"
                                        }
                                        size="sm"
                                        onClick={() =>
                                          toggleRole(
                                            field.value as Role[],
                                            role.value as Role,
                                            field.onChange
                                          )
                                        }
                                      >
                                        {role.label}
                                      </Button>
                                    ))}
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {index > 2 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-3 right-3"
                          onClick={() => remove(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creando...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-5 w-5" />
                    Crear Equipo
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
