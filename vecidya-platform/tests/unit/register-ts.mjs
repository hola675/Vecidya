// Registra un hook de resolución para que Node ejecute módulos TypeScript del
// código de la app (importaciones relativas sin extensión) con type stripping.
// Sin dependencias: solo `node --import ./tests/unit/register-ts.mjs --test ...`.
import { register } from "node:module";

register("./ts-resolve-hooks.mjs", import.meta.url);
