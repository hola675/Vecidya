import type { GoalId, ProfileId, StageId, TeamId } from "./types";

export type ProfileDefinition = {
  id: ProfileId;
  label: string;
  description: string;
  /** El perfil depende de que lo encuentren en búsquedas locales (Google, mapas). */
  localSearch: boolean;
};

export const profiles: ProfileDefinition[] = [
  { id: "business", label: "Un negocio o empresa", description: "Una actividad comercial con clientes", localSearch: true },
  { id: "professional", label: "Mi perfil profesional", description: "Tu trabajo, experiencia y reputación", localSearch: true },
  { id: "creator", label: "Artista o creador de contenido", description: "Una voz, audiencia o trabajo creativo", localSearch: false },
  { id: "project", label: "Un proyecto o iniciativa", description: "Una idea o proyecto en construcción", localSearch: false },
  { id: "organization", label: "Una organización o comunidad", description: "Un grupo, colectivo o comunidad", localSearch: true },
];

export const profileIds = profiles.map((profile) => profile.id) as ProfileId[];

export const stageIds: StageId[] = ["idea", "launching", "occasional", "regular", "growing"];

export const teamIds: TeamId[] = ["only_me", "small", "medium", "large", "xl"];

export const goalIds: GoalId[] = [
  "be_found",
  "explain",
  "trust",
  "opportunities",
  "stop_losing",
  "organize",
  "automate",
  "measure",
  "unsure",
];

export function isProfileId(value: unknown): value is ProfileId {
  return typeof value === "string" && (profileIds as string[]).includes(value);
}

export function isStageId(value: unknown): value is StageId {
  return typeof value === "string" && (stageIds as string[]).includes(value);
}

export function isTeamId(value: unknown): value is TeamId {
  return typeof value === "string" && (teamIds as string[]).includes(value);
}

export function isGoalId(value: unknown): value is GoalId {
  return typeof value === "string" && (goalIds as string[]).includes(value);
}

export function getProfile(id: ProfileId): ProfileDefinition {
  return profiles.find((profile) => profile.id === id) ?? profiles[0];
}

/** Etapas en las que ya existe actividad que ordenar (consultas, clientes, participantes). */
export function isOperating(stage: StageId | undefined): boolean {
  return stage === "occasional" || stage === "regular" || stage === "growing";
}

/** Etapas con actividad regular: aplican preguntas de proceso y volumen. */
export function isEstablished(stage: StageId | undefined): boolean {
  return stage === "regular" || stage === "growing";
}

export function hasTeam(team: TeamId | undefined): boolean {
  return Boolean(team) && team !== "only_me";
}
