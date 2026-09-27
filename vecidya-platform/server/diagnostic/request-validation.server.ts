import { MAX_REQUEST_BODY_BYTES } from "../../app/features/diagnostic/persistence";

/**
 * Límite de tamaño de payload (spec §34): 26 preguntas estructuradas caben en un margen amplio; no
 * se acepta un cuerpo HTTP arbitrariamente grande. Se comprueba antes y después de leer el cuerpo.
 */
export class RequestTooLargeError extends Error {}

export async function readBoundedJsonBody(request: Request): Promise<unknown> {
  const contentLength = request.headers.get("content-length");
  if (contentLength && Number(contentLength) > MAX_REQUEST_BODY_BYTES) {
    throw new RequestTooLargeError("Request body exceeds the maximum allowed size");
  }

  const text = await request.text();
  if (new TextEncoder().encode(text).length > MAX_REQUEST_BODY_BYTES) {
    throw new RequestTooLargeError("Request body exceeds the maximum allowed size");
  }

  return JSON.parse(text);
}
