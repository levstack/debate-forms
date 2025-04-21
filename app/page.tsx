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
import { useForm, Control, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Team, getAllTeams } from "@/lib/services/team-service";

import { TriangleDownIcon, TriangleUpIcon } from "@radix-ui/react-icons";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { NumberInput } from "@/components/ui/number-input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Settings2 } from "lucide-react";

type FormValues = z.infer<typeof formSchema>;

interface EvaluationFieldProps {
  control: Control<FormValues>;
  name:
    | keyof FormValues
    | `fondo.${"AF" | "EC"}.${number}`
    | `forma.${"AF" | "EC"}.${number}`
    | `otros.${"AF" | "EC"}.${number}`;
}

const EvaluationField = ({ control, name }: EvaluationFieldProps) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <NumberInput
          value={field.value as number}
          onChange={field.onChange}
          min={0}
          max={1}
          step={0.1}
          className="w-full"
        />
      )}
    />
  );
};

const evaluationCriteria = {
  fondo: [
    "Responde a la pregunta del debate",
    "Línea argumental definida y coherente dentro del equipo",
    "Razonamientos serios y estructurados",
    "Veracidad, profundidad y diversidad en los argumentos",
    "Refuta los argumentos del contrario",
    "Capacidad de improvisación",
  ],
  forma: [
    "Naturalidad y expresividad",
    "Comienzos cautivadores y finales contundentes",
    "Dominio del espacio",
    "Contacto visual",
    "Dominio de la voz y silencios",
    "Agilidad y acierto en las respuestas",
  ],
  otros: [
    "Equilibrio entre los miembros del equipo",
    <span key="respect">
      Actitud de respeto y cordialidad con el otro equipo{" "}
      <span className="font-bold">(x2)</span>
    </span>,
    <span key="impression">
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

// Add the DebatePropertiesPopover component
interface DebatePropertiesPopoverProps {
  control: Control<FormValues>;
}

const DebatePropertiesPopover = ({ control }: DebatePropertiesPopoverProps) => {
  // Use useWatch to properly watch the form values
  const rondaValue = useWatch({
    control,
    name: "ronda",
  });
  const aulaValue = useWatch({
    control,
    name: "aula",
  });

  // State to control the popover open state
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 text-sm">
        <span className="font-medium">Ronda:</span>
        <span>{rondaValue}</span>
        <span className="mx-1">|</span>
        <span className="font-medium">Aula:</span>
        <span>{aulaValue}</span>
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            <Settings2 className="h-4 w-4" />
            <span className="sr-only">Configuración de debate</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">
                Propiedades del debate
              </h4>
              <p className="text-sm text-muted-foreground">
                Configura la ronda y el aula para este debate.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={control}
                name="ronda"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="ronda">Ronda</FormLabel>
                    <FormControl>
                      <Input
                        id="ronda"
                        type="number"
                        min={1}
                        max={99}
                        onChange={(e) => {
                          // Allow empty values during editing
                          const value =
                            e.target.value === "" ? "" : Number(e.target.value);
                          field.onChange(value);
                        }}
                        onBlur={(e) => {
                          // Enforce minimum value of 1 when field loses focus
                          const value =
                            e.target.value === "" ? 1 : Number(e.target.value);
                          const validValue = Math.max(1, value);
                          field.onChange(validValue);
                          field.onBlur(); // Call the original onBlur handler
                        }}
                        value={field.value}
                        className="w-full"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="aula"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="aula">Aula</FormLabel>
                    <FormControl>
                      <Input
                        id="aula"
                        type="number"
                        min={1}
                        max={99}
                        onChange={(e) => {
                          // Allow empty values during editing
                          const value =
                            e.target.value === "" ? "" : Number(e.target.value);
                          field.onChange(value);
                        }}
                        onBlur={(e) => {
                          // Enforce minimum value of 1 when field loses focus
                          const value =
                            e.target.value === "" ? 1 : Number(e.target.value);
                          const validValue = Math.max(1, value);
                          field.onChange(validValue);
                          field.onBlur(); // Call the original onBlur handler
                        }}
                        value={field.value}
                        className="w-full"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
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
        className="space-y-6 flex flex-col w-full max-w-md mx-auto px-4 sm:px-6 md:max-w-2xl lg:max-w-4xl"
      >
        {/*Debate Properties group*/}
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-row items-center gap-2 w-full">
            <DebatePropertiesPopover control={form.control} />
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
            <FormField
              control={form.control}
              name="equipoAF"
              render={({ field }) => (
                <FormItem className="w-full sm:flex-1">
                  <FormLabel htmlFor="equipoAF">Equipo AF</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="equipoAF">
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
                <FormItem className="w-full sm:flex-1">
                  <FormLabel htmlFor="equipoEC">Equipo EC</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!form.getValues("equipoAF")}
                    >
                      <SelectTrigger id="equipoEC">
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
          </div>
        </div>
        {/*Mejor posicion group*/}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          <FormField
            control={form.control}
            name="mejorIntroductorId"
            render={({ field }) => (
              <div className="flex flex-col items-start justify-center h-full">
                <FormItem className="w-full">
                  <FormLabel htmlFor="mejorIntroductor">
                    Mejor Introductor
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={roleMembers.INTRO.length === 0}
                    >
                      <SelectTrigger id="mejorIntroductor">
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
              </div>
            )}
          />

          <FormField
            control={form.control}
            name="mejorR1Id"
            render={({ field }) => (
              <div className="flex flex-col items-start justify-center h-full">
                <FormItem className="w-full">
                  <FormLabel htmlFor="mejorR1">Mejor R1</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={roleMembers.R1.length === 0}
                    >
                      <SelectTrigger id="mejorR1">
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
              </div>
            )}
          />
          <FormField
            control={form.control}
            name="mejorR2Id"
            render={({ field }) => (
              <div className="flex flex-col items-start justify-center h-full">
                <FormItem className="w-full">
                  <FormLabel htmlFor="mejorR2">Mejor R2</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={roleMembers.R2.length === 0}
                    >
                      <SelectTrigger id="mejorR2">
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
              </div>
            )}
          />
          <FormField
            control={form.control}
            name="mejorConcluId"
            render={({ field }) => (
              <div className="flex flex-col items-start justify-center h-full">
                <FormItem className="w-full">
                  <FormLabel htmlFor="mejorConclu">Mejor Conclusión</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={roleMembers.CONCLU.length === 0}
                    >
                      <SelectTrigger id="mejorConclu">
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
              </div>
            )}
          />
          <FormField
            control={form.control}
            name="mejorOradorId"
            render={({ field }) => (
              <FormItem className="col-span-1 sm:col-span-2 flex flex-col items-center">
                <FormLabel htmlFor="mejorOrador">Mejor Orador</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={eligibleOrators.length === 0}
                  >
                    <SelectTrigger
                      id="mejorOrador"
                      className="w-full sm:w-auto"
                    >
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
        </div>
        <div
          id="BestDescription"
          className="text-muted-foreground mt-4 text-sm mx-auto"
        >
          Oradores destacados
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <Table className="min-w-full text-sm sm:text-base table-fixed">
              <TableCaption>Evaluaciones</TableCaption>

              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50%] sm:w-[40%] text-xs sm:text-sm break-words font-bold">
                    Fondo
                  </TableHead>
                  <TableHead className="w-[25%] sm:w-[30%] text-xs sm:text-sm font-bold">
                    Equipo AF
                  </TableHead>
                  <TableHead className="w-[25%] sm:w-[30%] text-xs sm:text-sm font-bold">
                    Equipo EC
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {evaluationCriteria.fondo.map((criterion, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium whitespace-normal text-xs sm:text-sm break-words p-1 sm:p-2">
                      {criterion}
                    </TableCell>
                    <TableCell className="text-center p-1 sm:p-2">
                      <EvaluationField
                        control={form.control}
                        name={`fondo.AF.${index}`}
                      />
                    </TableCell>
                    <TableCell className="text-center p-1 sm:p-2">
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
                  <TableHead className="w-[50%] sm:w-[40%] text-xs sm:text-sm break-words font-bold">
                    Forma
                  </TableHead>
                  <TableHead className="w-[25%] sm:w-[30%] text-xs sm:text-sm font-bold">
                    Equipo AF
                  </TableHead>
                  <TableHead className="w-[25%] sm:w-[30%] text-xs sm:text-sm font-bold">
                    Equipo EC
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {evaluationCriteria.forma.map((criterion, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium whitespace-normal text-xs sm:text-sm break-words p-1 sm:p-2">
                      {criterion}
                    </TableCell>
                    <TableCell className="text-center p-1 sm:p-2">
                      <EvaluationField
                        control={form.control}
                        name={`forma.AF.${index}`}
                      />
                    </TableCell>
                    <TableCell className="text-center p-1 sm:p-2">
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
                  <TableHead className="w-[50%] sm:w-[40%] text-xs sm:text-sm break-words font-bold">
                    Otros Elementos de evaluacion
                  </TableHead>
                  <TableHead className="w-[25%] sm:w-[30%] text-xs sm:text-sm font-bold">
                    Equipo AF
                  </TableHead>
                  <TableHead className="w-[25%] sm:w-[30%] text-xs sm:text-sm font-bold">
                    Equipo EC
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {evaluationCriteria.otros.map((criterion, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium whitespace-normal text-xs sm:text-sm break-words p-1 sm:p-2">
                      {criterion}
                    </TableCell>
                    <TableCell className="text-center p-1 sm:p-2">
                      <EvaluationField
                        control={form.control}
                        name={`otros.AF.${index}`}
                      />
                    </TableCell>
                    <TableCell className="text-center p-1 sm:p-2">
                      <EvaluationField
                        control={form.control}
                        name={`otros.EC.${index}`}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Mobile Stacked View */}
        <div className="sm:hidden space-y-8">
          {/* Fondo Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Fondo</h3>
            <div className="space-y-4">
              {evaluationCriteria.fondo.map((criterion, index) => (
                <div key={index} className="space-y-2">
                  <p className="text-sm font-medium">{criterion}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Equipo AF</p>
                      <EvaluationField
                        control={form.control}
                        name={`fondo.AF.${index}`}
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Equipo EC</p>
                      <EvaluationField
                        control={form.control}
                        name={`fondo.EC.${index}`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Forma Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Forma</h3>
            <div className="space-y-4">
              {evaluationCriteria.forma.map((criterion, index) => (
                <div key={index} className="space-y-2">
                  <p className="text-sm font-medium">{criterion}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Equipo AF</p>
                      <EvaluationField
                        control={form.control}
                        name={`forma.AF.${index}`}
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Equipo EC</p>
                      <EvaluationField
                        control={form.control}
                        name={`forma.EC.${index}`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Otros Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Otros Elementos de evaluación
            </h3>
            <div className="space-y-4">
              {evaluationCriteria.otros.map((criterion, index) => (
                <div key={index} className="space-y-2">
                  <p className="text-sm font-medium">{criterion}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Equipo AF</p>
                      <EvaluationField
                        control={form.control}
                        name={`otros.AF.${index}`}
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Equipo EC</p>
                      <EvaluationField
                        control={form.control}
                        name={`otros.EC.${index}`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? "Guardando..." : "Guardar"}
        </Button>
      </form>
    </Form>
  );
}
