"use client";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableCaption,
  TableHead,
  TableHeader,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Team, getAllTeams } from "@/lib/services/team-service";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface EvaluationFieldProps {
  control: any;
  name: string;
}

const EvaluationField = ({ control, name }: EvaluationFieldProps) => {
  const [displayValue, setDisplayValue] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        // Initialize display value from the field value
        useEffect(() => {
          setDisplayValue(field.value.toString().replace(".", ","));
        }, [field.value]);

        // Handle increment/decrement
        const handleStep = (increment: boolean) => {
          const step = 0.1;
          const currentValue = field.value as number;
          let newValue = increment
            ? Math.min(currentValue + step, 1)
            : Math.max(currentValue - step, 0);

          // Round to 1 decimal place to avoid floating point issues
          newValue = Math.round(newValue * 10) / 10;
          field.onChange(newValue);
        };

        return (
          <div className="relative flex items-center">
            <Input
              ref={inputRef}
              type="text"
              value={displayValue}
              onFocus={() => {
                if (field.value === 0) {
                  setDisplayValue("0,");
                }
              }}
              onBlur={() => {
                const valueForParsing = displayValue.replace(",", ".");
                const numValue = parseFloat(valueForParsing);
                const clampedValue = Math.min(
                  Math.max(isNaN(numValue) ? 0 : numValue, 0),
                  1
                );
                field.onChange(clampedValue);
                setDisplayValue(clampedValue.toString().replace(".", ","));
              }}
              onChange={(e) => {
                const inputValue = e.target.value;
                const normalizedInput = inputValue.replace(".", ",");
                if (/^[0-9]*,?[0-9]*$/.test(normalizedInput)) {
                  setDisplayValue(normalizedInput);
                  const valueForParsing = normalizedInput.replace(",", ".");
                  const numValue = parseFloat(valueForParsing);
                  if (!isNaN(numValue)) {
                    field.onChange(numValue);
                  }
                }
              }}
              min={0}
              max={1}
              step={0.1}
              className="w-20 pr-8"
            />
            <div className="absolute right-1 top-1 flex flex-col h-[calc(100%-8px)]">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleStep(true)}
                tabIndex={-1}
              >
                ▲
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleStep(false)}
                tabIndex={-1}
              >
                ▼
              </Button>
            </div>
          </div>
        );
      }}
    />
  );
};

const evaluationCriteria = {
  fondo: ["Responde a la pregunta del debate", "Otras Evaluaion"],
  forma: ["Evaluamos Forma", "Otras Evaluaion"],
  otros: [
    "Equilibrio entre los miembros del equipo",
    <span>
      Actitud de respeto y cordialidad con el otro equipo{" "}
      <span className="font-bold">(x2)</span>
    </span>,
    <span>
      Impresion general del debate <span className="font-bold">(x3)</span>
    </span>,
  ],
};

const formSchema = z
  .object({
    ronda: z.number().min(1),
    aula: z.number().min(1),
    equipoAF: z.string(),
    equipoEC: z.string(),
    mejorOradorId: z.string().optional(),
    mejorIntroductorId: z.string().optional(),
    mejorR1Id: z.string().optional(),
    mejorR2Id: z.string().optional(),
    mejorConcluId: z.string().optional(),
    fondo: z.object({
      AF: z.array(z.number().min(0).max(1)),
      EC: z.array(z.number().min(0).max(1)),
    }),
    forma: z.object({
      AF: z.array(z.number().min(0).max(1)),
      EC: z.array(z.number().min(0).max(1)),
    }),
    otros: z.object({
      AF: z.array(z.number().min(0).max(1)),
      EC: z.array(z.number().min(0).max(1)),
    }),
  })
  .refine((data) => data.equipoAF !== data.equipoEC, {
    message: "El equipo EC no puede ser el mismo que el equipo AF",
    path: ["equipoEC"],
  });

async function onSubmit(data: z.infer<typeof formSchema>) {
  console.log(data);

  // Check if debate already exists for this ronda and aula
  const checkResponse = await fetch(
    `/api/debate/check?ronda=${data.ronda}&aula=${data.aula}`
  );

  if (checkResponse.status === 200) {
    // Debate exists
    const existingDebate = await checkResponse.json();
    throw new Error(
      `Ya existe un debate en la ronda ${data.ronda}, aula ${data.aula} entre ${existingDebate.teamAF.name} y ${existingDebate.teamEC.name}`
    );
  }

  const fondoAF = data.fondo.AF.reduce((a, b) => a + b, 0);
  const fondoEC = data.fondo.EC.reduce((a, b) => a + b, 0);

  const formaAF = data.forma.AF.reduce((a, b) => a + b, 0);
  const formaEC = data.forma.EC.reduce((a, b) => a + b, 0);

  // Calculate otros with hardcoded weights for specific indices
  const otrosAF = data.otros.AF.reduce((total, value, index) => {
    if (index === 1) return total + value * 2; // multiply by 2 for "Actitud de respeto..."
    if (index === 2) return total + value * 3; // multiply by 3 for "Impresion general..."
    return total + value;
  }, 0);

  const otrosEC = data.otros.EC.reduce((total, value, index) => {
    if (index === 1) return total + value * 2; // multiply by 2 for "Actitud de respeto..."
    if (index === 2) return total + value * 3; // multiply by 3 for "Impresion general..."
    return total + value;
  }, 0);

  const totalAF = fondoAF + formaAF + otrosAF;
  const totalEC = fondoEC + formaEC + otrosEC;

  console.log({
    AF: { fondo: fondoAF, forma: formaAF, otros: otrosAF, total: totalAF },
    EC: { fondo: fondoEC, forma: formaEC, otros: otrosEC, total: totalEC },
  });

  // Save to database via API route
  const response = await fetch("/api/debate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("API Error:", errorData);
    throw new Error(errorData.error || "Failed to save debate data");
  }

  return await response.json();
}

// Define the TeamMember type with roles
type TeamMember = {
  id: string;
  name: string;
  teamId: string;
  roles: {
    id: string;
    role: string;
    teamType: "AF" | "EC";
  }[];
};

export default function Home() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ronda: 1,
      aula: 1,
      equipoAF: "",
      equipoEC: "",
      mejorOradorId: undefined,
      mejorIntroductorId: undefined,
      mejorR1Id: undefined,
      mejorR2Id: undefined,
      mejorConcluId: undefined,
      fondo: {
        AF: Array(evaluationCriteria.fondo.length).fill(0),
        EC: Array(evaluationCriteria.fondo.length).fill(0),
      },
      forma: {
        AF: Array(evaluationCriteria.forma.length).fill(0),
        EC: Array(evaluationCriteria.forma.length).fill(0),
      },
      otros: {
        AF: Array(evaluationCriteria.otros.length).fill(0),
        EC: Array(evaluationCriteria.otros.length).fill(0),
      },
    },
  });

  useEffect(() => {
    async function fetchTeams() {
      try {
        const teamData = await getAllTeams();
        setTeams(teamData);
      } catch (error) {
        console.error("Failed to fetch teams:", error);
        toast.error("Failed to load teams");
      }
    }

    fetchTeams();
  }, []);

  // Fetch team members when teams are selected
  useEffect(() => {
    async function fetchTeamMembers() {
      const selectedAF = form.getValues("equipoAF");
      const selectedEC = form.getValues("equipoEC");

      // Reset EC team if it's the same as AF team
      if (selectedAF && selectedAF === selectedEC) {
        form.setValue("equipoEC", "");
        return;
      }

      if (!selectedAF || !selectedEC) {
        // Reset team members and role members if either team is not selected
        setTeamMembers([]);
        setRoleMembers({
          INTRO: [],
          R1: [],
          R2: [],
          CONCLU: [],
        });
        setEligibleOrators([]);
        return;
      }

      try {
        const response = await fetch(
          `/api/teams/members?teams=${selectedAF},${selectedEC}`
        );
        if (!response.ok) throw new Error("Failed to fetch team members");
        const data = await response.json();
        setTeamMembers(data.members);
      } catch (error) {
        console.error("Failed to fetch team members:", error);
        toast.error("Failed to load team members");
      }
    }

    fetchTeamMembers();
  }, [form.watch("equipoAF"), form.watch("equipoEC")]);

  // State for role-specific members
  const [roleMembers, setRoleMembers] = useState<{
    INTRO: TeamMember[];
    R1: TeamMember[];
    R2: TeamMember[];
    CONCLU: TeamMember[];
  }>({
    INTRO: [],
    R1: [],
    R2: [],
    CONCLU: [],
  });

  // State for eligible orators (excluding those with only CAPITAN role)
  const [eligibleOrators, setEligibleOrators] = useState<TeamMember[]>([]);

  // Filter team members by role when they are loaded
  useEffect(() => {
    if (!teamMembers.length) return;

    // Get selected team names
    const selectedAFName = form.getValues("equipoAF");
    const selectedECName = form.getValues("equipoEC");

    // Find team IDs based on team names
    const teamAF = teams.find((team) => team.name === selectedAFName);
    const teamEC = teams.find((team) => team.name === selectedECName);

    if (!teamAF || !teamEC) return;

    // Filter eligible orators (exclude members who ONLY have CAPITAN role)
    const orators = teamMembers.filter((member) => {
      // If the member has no roles, exclude them
      if (member.roles.length === 0) return false;

      // If all their roles are CAPITAN, exclude them
      const onlyCapitan = member.roles.every((role) => role.role === "CAPITAN");
      return !onlyCapitan;
    });

    setEligibleOrators(orators);

    // Filter team members by their roles and team type
    const filteredMembers = {
      INTRO: teamMembers.filter((member) =>
        member.roles.some(
          (role) =>
            role.role === "INTRO" &&
            ((member.teamId === teamAF.id && role.teamType === "AF") ||
              (member.teamId === teamEC.id && role.teamType === "EC"))
        )
      ),
      R1: teamMembers.filter((member) =>
        member.roles.some(
          (role) =>
            role.role === "R1" &&
            ((member.teamId === teamAF.id && role.teamType === "AF") ||
              (member.teamId === teamEC.id && role.teamType === "EC"))
        )
      ),
      R2: teamMembers.filter((member) =>
        member.roles.some(
          (role) =>
            role.role === "R2" &&
            ((member.teamId === teamAF.id && role.teamType === "AF") ||
              (member.teamId === teamEC.id && role.teamType === "EC"))
        )
      ),
      CONCLU: teamMembers.filter((member) =>
        member.roles.some(
          (role) =>
            role.role === "CONCLU" &&
            ((member.teamId === teamAF.id && role.teamType === "AF") ||
              (member.teamId === teamEC.id && role.teamType === "EC"))
        )
      ),
    };

    setRoleMembers(filteredMembers);
  }, [teamMembers, form, teams]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
      toast.success("Evaluación guardada correctamente");
      // Reset form
      form.reset({
        ...form.getValues(),
        mejorOradorId: undefined,
        mejorIntroductorId: undefined,
        mejorR1Id: undefined,
        mejorR2Id: undefined,
        mejorConcluId: undefined,
        fondo: {
          AF: Array(evaluationCriteria.fondo.length).fill(0),
          EC: Array(evaluationCriteria.fondo.length).fill(0),
        },
        forma: {
          AF: Array(evaluationCriteria.forma.length).fill(0),
          EC: Array(evaluationCriteria.forma.length).fill(0),
        },
        otros: {
          AF: Array(evaluationCriteria.otros.length).fill(0),
          EC: Array(evaluationCriteria.otros.length).fill(0),
        },
      });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al guardar la evaluación"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-8 p-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="ronda"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ronda</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    onChange={(e) => {
                      field.onChange(Number(e.target.value));
                    }}
                    value={field.value}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="aula"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aula</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    onChange={(e) => {
                      field.onChange(Number(e.target.value));
                    }}
                    value={field.value}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="equipoAF"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Equipo AF</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un equipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.name}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="equipoEC"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Equipo EC</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!form.getValues("equipoAF")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un equipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams
                        .filter(
                          (team) => team.name !== form.getValues("equipoAF")
                        )
                        .map((team) => (
                          <SelectItem key={team.id} value={team.name}>
                            {team.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mejorOradorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mejor Orador</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={eligibleOrators.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el mejor orador" />
                    </SelectTrigger>
                    <SelectContent>
                      {eligibleOrators.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mejorIntroductorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mejor Introductor</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={roleMembers.INTRO.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el mejor introductor" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleMembers.INTRO.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mejorR1Id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mejor R1</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={roleMembers.R1.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el mejor R1" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleMembers.R1.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mejorR2Id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mejor R2</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={roleMembers.R2.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el mejor R2" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleMembers.R2.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mejorConcluId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mejor Conclusión</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={roleMembers.CONCLU.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el mejor conclusor" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleMembers.CONCLU.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <Table>
          <TableCaption>Evaluaciones</TableCaption>

          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Fondo</TableHead>
              <TableHead>Equipo AF</TableHead>
              <TableHead>Equipo EC</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {evaluationCriteria.fondo.map((criterion, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{criterion}</TableCell>
                <TableCell>
                  <EvaluationField
                    control={form.control}
                    name={`fondo.AF.${index}`}
                  />
                </TableCell>

                <TableCell>
                  <EvaluationField
                    control={form.control}
                    name={`fondo.EC.${index}`}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

          <TableHeader>
            <TableRow>
              <TableHead>Forma</TableHead>
              <TableHead>Equipo AF</TableHead>
              <TableHead>Equipo EC</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {evaluationCriteria.forma.map((criterion, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{criterion}</TableCell>
                <TableCell>
                  <EvaluationField
                    control={form.control}
                    name={`forma.AF.${index}`}
                  />
                </TableCell>

                <TableCell>
                  <EvaluationField
                    control={form.control}
                    name={`forma.EC.${index}`}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

          <TableHeader>
            <TableRow>
              <TableHead>Otros Elementos de evaluacion</TableHead>
              <TableHead>Equipo AF</TableHead>
              <TableHead>Equipo EC</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {evaluationCriteria.otros.map((criterion, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{criterion}</TableCell>
                <TableCell>
                  <EvaluationField
                    control={form.control}
                    name={`otros.AF.${index}`}
                  />
                </TableCell>

                <TableCell>
                  <EvaluationField
                    control={form.control}
                    name={`otros.EC.${index}`}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Guardar"}
        </Button>
      </form>
    </Form>
  );
}
