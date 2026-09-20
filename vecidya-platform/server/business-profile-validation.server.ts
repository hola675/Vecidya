import type { BusinessProfileInput } from "../db/queries/business-profile.server";
import type { BusinessHoursEntry } from "../db/queries/business-hours.server";
export { getBusinessProfileCompletion, getBusinessProfilePublicationIssues } from "../db/business-profile-rules";
import { getBusinessProfilePublicationIssues } from "../db/business-profile-rules";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function optionalText(value: FormDataEntryValue | null, maxLength: number) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return null;
  if (text.length > maxLength) throw new Response("Uno de los campos supera su longitud máxima.", { status: 400 });
  return text;
}

function optionalUrl(value: FormDataEntryValue | null, field: string) {
  const text = optionalText(value, 2_048);
  if (!text) return null;

  try {
    const url = new URL(text);
    if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error();
    return url.toString();
  } catch {
    throw new Response(`${field} debe ser una URL HTTP o HTTPS válida.`, { status: 400 });
  }
}

function optionalSocialUrl(value: FormDataEntryValue | null, field: string, allowedHosts: string[]) {
  const url = optionalUrl(value, field);
  if (!url) return null;

  const hostname = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  if (!allowedHosts.includes(hostname)) {
    throw new Response(`${field} debe ser un enlace de ${allowedHosts.join(" o ")}.`, { status: 400 });
  }
  return url;
}

const whatsappPattern = /^\+\d{8,15}$/;

function optionalWhatsApp(value: FormDataEntryValue | null) {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return null;

  const normalized = raw.replace(/[\s\-().]/g, "");
  if (!whatsappPattern.test(normalized)) {
    throw new Response("El WhatsApp debe ser un número internacional válido con indicativo de país, por ejemplo +573244321864.", { status: 400 });
  }
  return normalized;
}

const serviceModes = ["in_person", "remote", "hybrid"] as const;

function optionalServiceMode(value: FormDataEntryValue | null) {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return null;
  if (!serviceModes.includes(raw as (typeof serviceModes)[number])) {
    throw new Response("La modalidad de atención no es válida.", { status: 400 });
  }
  return raw as (typeof serviceModes)[number];
}

export function parseBusinessProfileForm(formData: FormData): BusinessProfileInput {
  const displayName = optionalText(formData.get("displayName"), 120);
  const slug = optionalText(formData.get("slug"), 80);

  if (!displayName) throw new Response("El nombre visible es obligatorio.", { status: 400 });
  if (!slug || !slugPattern.test(slug)) {
    throw new Response("El slug debe usar minúsculas, números y guiones simples.", { status: 400 });
  }

  const publicEmail = optionalText(formData.get("publicEmail"), 254);
  if (publicEmail && !emailPattern.test(publicEmail)) {
    throw new Response("El email público no es válido.", { status: 400 });
  }

  return {
    displayName,
    slug,
    shortDescription: optionalText(formData.get("shortDescription"), 280),
    description: optionalText(formData.get("description"), 5_000),
    category: optionalText(formData.get("category"), 100),
    city: optionalText(formData.get("city"), 120),
    country: optionalText(formData.get("country"), 120),
    phone: optionalText(formData.get("phone"), 50),
    publicEmail,
    websiteUrl: optionalUrl(formData.get("websiteUrl"), "La web"),
    logoUrl: optionalUrl(formData.get("logoUrl"), "El logo"),
    whatsapp: optionalWhatsApp(formData.get("whatsapp")),
    instagramUrl: optionalSocialUrl(formData.get("instagramUrl"), "Instagram", ["instagram.com"]),
    facebookUrl: optionalSocialUrl(formData.get("facebookUrl"), "Facebook", ["facebook.com", "fb.com"]),
    linkedinUrl: optionalSocialUrl(formData.get("linkedinUrl"), "LinkedIn", ["linkedin.com"]),
    serviceMode: optionalServiceMode(formData.get("serviceMode")),
    serviceArea: optionalText(formData.get("serviceArea"), 280),
  };
}

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
const dayOfWeekRange = [1, 2, 3, 4, 5, 6, 7] as const;

export function parseBusinessHoursForm(formData: FormData): BusinessHoursEntry[] {
  const entries: BusinessHoursEntry[] = [];

  for (const dayOfWeek of dayOfWeekRange) {
    const isClosed = formData.get(`hours_${dayOfWeek}_closed`) === "on";
    const opensAtRaw = formData.get(`hours_${dayOfWeek}_opens`);
    const closesAtRaw = formData.get(`hours_${dayOfWeek}_closes`);
    const opensAt = typeof opensAtRaw === "string" ? opensAtRaw.trim() : "";
    const closesAt = typeof closesAtRaw === "string" ? closesAtRaw.trim() : "";

    if (isClosed) {
      entries.push({ dayOfWeek, isClosed: true, opensAt: null, closesAt: null });
      continue;
    }

    if (!opensAt && !closesAt) continue;

    if (!opensAt || !closesAt || !timePattern.test(opensAt) || !timePattern.test(closesAt)) {
      throw new Response(`El horario del ${dayOfWeek === 7 ? "domingo" : "día " + dayOfWeek} debe tener hora de apertura y cierre válidas (HH:MM).`, { status: 400 });
    }
    if (opensAt >= closesAt) {
      throw new Response("La hora de apertura debe ser anterior a la hora de cierre.", { status: 400 });
    }

    entries.push({ dayOfWeek, isClosed: false, opensAt, closesAt });
  }

  return entries;
}
