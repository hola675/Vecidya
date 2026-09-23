import { isGoalId, isProfileId } from "./profiles";
import type { Answers, GoalId, ProfileId } from "./types";

/**
 * Contrato canónico de entrada contextual:
 *
 *   /diagnostico                         → selección normal de perfil
 *   /diagnostico?perfil=professional     → perfil preseleccionado; empieza en la siguiente pregunta
 *   /diagnostico?perfil=business&objetivo=stop_losing
 *
 * Los parámetros se tratan como entrada no confiable: solo se aceptan valores
 * de una lista cerrada; cualquier otro valor se ignora y el diagnóstico
 * arranca en su estado normal. Nada de la URL se renderiza como texto.
 */

export const DIAGNOSTIC_PATH = "/diagnostico";
export const PROFILE_PARAM = "perfil";
export const GOAL_PARAM = "objetivo";

export type DiagnosticEntry = { profile?: ProfileId; goal?: GoalId };

function readParam(params: URLSearchParams, name: string): string | undefined {
  const raw = params.get(name);
  if (raw === null) return undefined;
  const value = raw.trim().toLowerCase();
  return value.length > 0 && value.length <= 40 ? value : undefined;
}

export function parseDiagnosticEntry(search: string | URLSearchParams | null | undefined): DiagnosticEntry {
  if (search === null || search === undefined) return {};
  const params = typeof search === "string" ? new URLSearchParams(search) : search;
  const profile = readParam(params, PROFILE_PARAM);
  const goal = readParam(params, GOAL_PARAM);
  const entry: DiagnosticEntry = {};
  if (isProfileId(profile)) entry.profile = profile;
  if (isGoalId(goal)) entry.goal = goal;
  return entry;
}

export function buildDiagnosticPath(entry: DiagnosticEntry = {}): string {
  const params = new URLSearchParams();
  if (entry.profile && isProfileId(entry.profile)) params.set(PROFILE_PARAM, entry.profile);
  if (entry.goal && isGoalId(entry.goal)) params.set(GOAL_PARAM, entry.goal);
  const query = params.toString();
  return query ? `${DIAGNOSTIC_PATH}?${query}` : DIAGNOSTIC_PATH;
}

export function entryToAnswers(entry: DiagnosticEntry): Answers {
  const answers: Answers = {};
  if (entry.profile) answers.profile = entry.profile;
  if (entry.goal) answers.goal = entry.goal;
  return answers;
}
