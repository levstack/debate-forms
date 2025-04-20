"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
    .min(2, "El nombre del equipo debe tener al menos 2 caracteres"),
  members: z
    .array(
      z.object({
        name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
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

  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      name: "",
      members: [
        { name: "", rolesAF: ["INTRO"], rolesEC: ["INTRO"] },
        { name: "", rolesAF: ["R1"], rolesEC: ["R1"] },
        { name: "", rolesAF: ["R2"], rolesEC: ["R2"] },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "members",
  });

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

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Crear Nuevo Equipo</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Información del Equipo</CardTitle>
              <CardDescription>
                Ingresa el nombre del equipo y añade entre 3 y 5 miembros
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                                        {field.value.includes(
                                          role.value as Role
                                        ) && <Check className="ml-2 h-4 w-4" />}
                                      </Button>
                                    ))}
                                  </div>
                                </FormControl>
                                <FormDescription>
                                  Selecciona hasta 2 roles para la posición AF
                                </FormDescription>
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
                                        {field.value.includes(
                                          role.value as Role
                                        ) && <Check className="ml-2 h-4 w-4" />}
                                      </Button>
                                    ))}
                                  </div>
                                </FormControl>
                                <FormDescription>
                                  Selecciona hasta 2 roles para la posición EC
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {fields.length > 3 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2"
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
              <Button type="submit" disabled={isSubmitting} className="ml-auto">
                {isSubmitting ? (
                  <>Creando equipo...</>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
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
