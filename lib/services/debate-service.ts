import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Form schema from the frontend
export const formSchema = z.object({
  ronda: z.number(),
  aula: z.number(),
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
});

type FormData = z.infer<typeof formSchema>;

export async function saveDebateResult(formData: FormData) {
  // Get or create teams
  const teamAF = await getOrCreateTeam(formData.equipoAF);
  const teamEC = await getOrCreateTeam(formData.equipoEC);

  // Create or update debate
  const debate = await prisma.debate.upsert({
    where: {
      ronda_aula: {
        ronda: formData.ronda,
        aula: formData.aula,
      },
    },
    update: {
      teamAFId: teamAF.id,
      teamECId: teamEC.id,
    },
    create: {
      ronda: formData.ronda,
      aula: formData.aula,
      teamAFId: teamAF.id,
      teamECId: teamEC.id,
    },
  });

  // Create a new result
  const result = await prisma.result.create({
    data: {
      debateId: debate.id,
      mejorOradorId: formData.mejorOradorId,
      mejorIntroductorId: formData.mejorIntroductorId,
      mejorR1Id: formData.mejorR1Id,
      mejorR2Id: formData.mejorR2Id,
      mejorConcluId: formData.mejorConcluId,
    },
  });

  // Save all evaluations
  const evaluations = [
    ...createEvaluations("FONDO", "AF", formData.fondo.AF, result.id),
    ...createEvaluations("FONDO", "EC", formData.fondo.EC, result.id),
    ...createEvaluations("FORMA", "AF", formData.forma.AF, result.id),
    ...createEvaluations("FORMA", "EC", formData.forma.EC, result.id),
    ...createEvaluations(
      "OTROS",
      "AF",
      formData.otros.AF,
      result.id,
      [1, 2, 3]
    ), // Weights for otros
    ...createEvaluations(
      "OTROS",
      "EC",
      formData.otros.EC,
      result.id,
      [1, 2, 3]
    ), // Weights for otros
  ];

  await prisma.evaluation.createMany({
    data: evaluations,
  });

  return { debate, result };
}

async function getOrCreateTeam(name: string) {
  return prisma.team.upsert({
    where: { name },
    update: {},
    create: { name },
  });
}

const criteriaMap = {
  FONDO: ["Responde a la pregunta del debate", "Otras Evaluaion"],
  FORMA: ["Evaluamos Forma", "Otras Evaluaion"],
  OTROS: [
    "Equilibrio entre los miembros del equipo",
    "Actitud de respeto y cordialidad con el otro equipo",
    "Impresion general del debate",
  ],
};

function createEvaluations(
  category: "FONDO" | "FORMA" | "OTROS",
  team: "AF" | "EC",
  scores: number[],
  resultId: string,
  weights: number[] = []
) {
  return scores.map((score, index) => ({
    resultId,
    category,
    team,
    criteria: criteriaMap[category][index],
    score,
    weight: weights[index] || 1,
  }));
}
