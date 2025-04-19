import { PrismaClient, Role, TeamType } from "@prisma/client";

const prisma = new PrismaClient();

// Mock team data with members and roles
const mockTeams = [
  {
    name: "Losmen Osmalos",
    members: [
      {
        name: "Elmin Ibar",
        rolesAF: ["INTRO", "CAPITAN"],
        rolesEC: ["R1"],
      },
      {
        name: "Nitep Regunto",
        rolesAF: ["R1"],
        rolesEC: ["INTRO", "CAPITAN"],
      },
      {
        name: "Mela Mascan",
        rolesAF: ["R2"],
        rolesEC: ["R2"],
      },
      {
        name: "Bill Gates",
        rolesAF: ["CONCLU"],
        rolesEC: ["CONCLU"],
      },
    ],
  },
  {
    name: "La RAE",
    members: [
      {
        name: "Pablo Motos",
        rolesAF: ["INTRO", "CAPITAN"],
        rolesEC: ["R1"],
      },
      {
        name: "Elpi Olin",
        rolesAF: ["R1"],
        rolesEC: ["INTRO", "CAPITAN"],
      },
      {
        name: "Xinxonjuan Jan",
        rolesAF: ["R2"],
        rolesEC: ["R2"],
      },
      {
        name: "Elver Galarga",
        rolesAF: ["CONCLU"],
        rolesEC: ["CONCLU"],
      },
    ],
  },
  {
    name: "GigaBrains",
    members: [
      {
        name: "Noten Gonidea",
        rolesAF: ["INTRO", "CAPITAN"],
        rolesEC: ["R1"],
      },
      {
        name: "Soyun Pickme",
        rolesAF: ["R1"],
        rolesEC: ["INTRO", "CAPITAN"],
      },
      {
        name: "Mevareg Ular",
        rolesAF: ["R2"],
        rolesEC: ["R2"],
      },
      {
        name: "Ermi Gue",
        rolesAF: ["CONCLU"],
        rolesEC: ["CONCLU"],
      },
    ],
  },
  {
    name: "Lope De Vergas",
    members: [
      {
        name: "Joaquin Nadal",
        rolesAF: ["INTRO", "CAPITAN"],
        rolesEC: ["R1"],
      },
      {
        name: "Lefas Ecas",
        rolesAF: ["R1"],
        rolesEC: ["INTRO", "CAPITAN"],
      },
      {
        name: "Elja Jas",
        rolesAF: ["R2"],
        rolesEC: ["R2"],
      },
      {
        name: "Miguel Salguerazo",
        rolesAF: ["CONCLU"],
        rolesEC: ["CONCLU"],
      },
    ],
  },
];

// Generate random scores for evaluations
function generateRandomScores(count: number): number[] {
  return Array.from(
    { length: count },
    () => Math.round(Math.random() * 10) / 10
  );
}

// Generate mock debate data
function generateMockDebates(teams: any[]) {
  const debates = [];

  // Generate 6 rounds of debates
  for (let round = 1; round <= 2; round++) {
    for (let room = 1; room <= 3; room++) {
      // Get random teams for this debate
      const teamIndices = getRandomTeamIndices(teams.length);
      const afTeam = teams[teamIndices[0]];
      const ecTeam = teams[teamIndices[1]];

      // Double-check that we have different teams
      if (afTeam.name === ecTeam.name) {
        console.error("Error: Same team selected for both AF and EC positions");
        continue; // Skip this debate
      }

      debates.push({
        ronda: round,
        aula: room,
        equipoAF: afTeam.name,
        equipoEC: ecTeam.name,
        mejorOradorId: getRandomMember(afTeam, ecTeam),
        mejorIntroductorId: getRandomMember(afTeam, ecTeam),
        mejorR1Id: getRandomMember(afTeam, ecTeam),
        mejorR2Id: getRandomMember(afTeam, ecTeam),
        mejorConcluId: getRandomMember(afTeam, ecTeam),
        fondo: {
          AF: generateRandomScores(2),
          EC: generateRandomScores(2),
        },
        forma: {
          AF: generateRandomScores(2),
          EC: generateRandomScores(2),
        },
        otros: {
          AF: generateRandomScores(3),
          EC: generateRandomScores(3),
        },
      });
    }
  }

  return debates;
}

// Get two random team indices - ensuring AF and EC teams are always different
function getRandomTeamIndices(teamCount: number): number[] {
  const first = Math.floor(Math.random() * teamCount);
  let second = Math.floor(Math.random() * teamCount);
  // Make sure we select a different team for EC
  while (second === first) {
    second = Math.floor(Math.random() * teamCount);
  }
  return [first, second];
}

// Get random member ID from the teams for best speaker awards
function getRandomMember(afTeam: any, ecTeam: any): string | undefined {
  // 20% chance to have no selection
  if (Math.random() < 0.2) {
    return undefined;
  }

  const teams = [afTeam, ecTeam];
  const selectedTeam = teams[Math.floor(Math.random() * teams.length)];
  const selectedMember =
    selectedTeam.members[
      Math.floor(Math.random() * selectedTeam.members.length)
    ];
  return selectedMember.id;
}

async function createTeamWithMembers(teamData: any) {
  console.log(`Creating team: ${teamData.name}`);

  // Create the team
  const team = await prisma.team.create({
    data: {
      name: teamData.name,
    },
  });

  // Create team members and their roles
  for (const memberData of teamData.members) {
    console.log(`Creating team member: ${memberData.name}`);

    // Create the team member
    const teamMember = await prisma.teamMember.create({
      data: {
        name: memberData.name,
        teamId: team.id,
      },
    });

    // Create AF roles
    const afRoles = memberData.rolesAF.map((role: string) => ({
      role: role as Role,
      teamType: TeamType.AF,
      memberId: teamMember.id,
    }));

    // Create EC roles
    const ecRoles = memberData.rolesEC.map((role: string) => ({
      role: role as Role,
      teamType: TeamType.EC,
      memberId: teamMember.id,
    }));

    // Create all roles
    await prisma.teamRole.createMany({
      data: [...afRoles, ...ecRoles],
    });
  }

  // Return the created team with members
  return await prisma.team.findUnique({
    where: { id: team.id },
    include: {
      members: true,
    },
  });
}

async function main() {
  try {
    console.log("Starting to generate mock data...");
    console.log(
      "NOTE: AF and EC teams will always be different for each debate"
    );

    // Create teams and members
    const createdTeams = [];
    for (const teamData of mockTeams) {
      const team = await createTeamWithMembers(teamData);
      createdTeams.push(team);
    }

    // Create mock debates
    const mockDebates = generateMockDebates(createdTeams);

    // Save each debate
    for (const debateData of mockDebates) {
      console.log(
        `Creating debate: Round ${debateData.ronda}, Room ${debateData.aula}`
      );

      // Get team ids
      const teamAF = await prisma.team.findUnique({
        where: { name: debateData.equipoAF },
      });

      const teamEC = await prisma.team.findUnique({
        where: { name: debateData.equipoEC },
      });

      if (!teamAF || !teamEC) {
        console.error("Could not find teams");
        continue;
      }

      // Validate that teams are different
      if (teamAF.id === teamEC.id) {
        console.error("Error: Same team assigned as both AF and EC", {
          round: debateData.ronda,
          room: debateData.aula,
          teamAF: debateData.equipoAF,
          teamEC: debateData.equipoEC,
        });
        continue; // Skip this debate
      }

      // Create debate
      const debate = await prisma.debate.create({
        data: {
          ronda: debateData.ronda,
          aula: debateData.aula,
          teamAFId: teamAF.id,
          teamECId: teamEC.id,
        },
      });

      // Create result
      const result = await prisma.result.create({
        data: {
          debateId: debate.id,
          mejorOradorId: debateData.mejorOradorId,
          mejorIntroductorId: debateData.mejorIntroductorId,
          mejorR1Id: debateData.mejorR1Id,
          mejorR2Id: debateData.mejorR2Id,
          mejorConcluId: debateData.mejorConcluId,
        },
      });

      // Create evaluations for FONDO
      const fondoAF = debateData.fondo.AF.map(
        (score: number, index: number) => ({
          resultId: result.id,
          category: "FONDO" as const,
          team: "AF" as const,
          criteria:
            index === 0
              ? "Responde a la pregunta del debate"
              : "Otras Evaluaion",
          score,
          weight: 1,
        })
      );

      const fondoEC = debateData.fondo.EC.map(
        (score: number, index: number) => ({
          resultId: result.id,
          category: "FONDO" as const,
          team: "EC" as const,
          criteria:
            index === 0
              ? "Responde a la pregunta del debate"
              : "Otras Evaluaion",
          score,
          weight: 1,
        })
      );

      // Create evaluations for FORMA
      const formaAF = debateData.forma.AF.map(
        (score: number, index: number) => ({
          resultId: result.id,
          category: "FORMA" as const,
          team: "AF" as const,
          criteria: index === 0 ? "Evaluamos Forma" : "Otras Evaluaion",
          score,
          weight: 1,
        })
      );

      const formaEC = debateData.forma.EC.map(
        (score: number, index: number) => ({
          resultId: result.id,
          category: "FORMA" as const,
          team: "EC" as const,
          criteria: index === 0 ? "Evaluamos Forma" : "Otras Evaluaion",
          score,
          weight: 1,
        })
      );

      // Create evaluations for OTROS with weights
      const otrosAF = debateData.otros.AF.map(
        (score: number, index: number) => ({
          resultId: result.id,
          category: "OTROS" as const,
          team: "AF" as const,
          criteria:
            index === 0
              ? "Equilibrio entre los miembros del equipo"
              : index === 1
              ? "Actitud de respeto y cordialidad con el otro equipo"
              : "Impresion general del debate",
          score,
          weight: index === 0 ? 1 : index === 1 ? 2 : 3,
        })
      );

      const otrosEC = debateData.otros.EC.map(
        (score: number, index: number) => ({
          resultId: result.id,
          category: "OTROS" as const,
          team: "EC" as const,
          criteria:
            index === 0
              ? "Equilibrio entre los miembros del equipo"
              : index === 1
              ? "Actitud de respeto y cordialidad con el otro equipo"
              : "Impresion general del debate",
          score,
          weight: index === 0 ? 1 : index === 1 ? 2 : 3,
        })
      );

      // Create all evaluations
      await prisma.evaluation.createMany({
        data: [
          ...fondoAF,
          ...fondoEC,
          ...formaAF,
          ...formaEC,
          ...otrosAF,
          ...otrosEC,
        ],
      });
    }

    console.log("Mock data generation completed successfully!");
  } catch (error) {
    console.error("Error generating mock data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
