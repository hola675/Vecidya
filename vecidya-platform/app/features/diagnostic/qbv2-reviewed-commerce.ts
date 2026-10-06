import type { QuestionDefinitionV2 } from "./qbv2-contract";
import { andV2, archetypeIncludes, contextEquals, orV2 } from "./qbv2-rules";

const activeRetail = andV2(contextEquals("activity", "active"), archetypeIncludes("retail"));

/** R2H keeps capabilities only. Outcomes, tactics and operational circumstances remain excluded. */
export const REVIEWED_COMMERCE_QUESTIONS_V2: readonly QuestionDefinitionV2[] = [
  {
    id: "q2_retail_product_visibility",
    version: 2,
    evidenceMigration: "pending",
    module: "retail",
    type: "single",
    routingRole: "adaptive",
    prompt: "Si alguien busca tu negocio en internet, ¿puede entender fácilmente qué productos vendes?",
    hint: "Piensa si una persona nueva entiende qué vendes. No necesitas mostrar todo el inventario ni el stock en tiempo real.",
    purpose: ["diagnostic"],
    priority: "normal",
    materialAppliesWhen: andV2(activeRetail, contextEquals("primaryGoal", "explain")),
    options: [
      { value: "clear", label: "Sí, puede ver claramente qué tipo de productos vendo" },
      { value: "partial", label: "Puede ver algunos productos, pero no queda claro todo lo que ofrezco" },
      { value: "unclear", label: "Normalmente tiene que preguntarme o ir a la tienda para saber qué vendo" },
      { value: "unknown", label: "No lo sé o no lo he revisado desde fuera", kind: "unknown" },
    ],
  },
  {
    id: "q2_retail_customer_capture",
    version: 2,
    evidenceMigration: "pending",
    module: "retail",
    type: "single",
    routingRole: "adaptive",
    prompt: "Después de una compra, ¿sueles tener una forma de volver a comunicarte con ese cliente cuando tiene sentido hacerlo?",
    hint: "Piensa en una vía directa que puedas usar con permiso del cliente. Que alguien te siga en redes no cuenta por sí solo.",
    purpose: ["diagnostic"],
    priority: "normal",
    materialAppliesWhen: andV2(activeRetail, orV2(contextEquals("primaryGoal", "stop_losing"), contextEquals("primaryFriction", "follow_up"))),
    options: [
      { value: "consistent", label: "Sí, con la mayoría de los clientes" },
      { value: "partial", label: "Solo con algunos clientes" },
      { value: "no", label: "Normalmente no me queda una forma directa de contacto" },
      { value: "not_applicable", label: "No necesito volver a contactar a mis clientes después de la compra", kind: "not_applicable" },
      { value: "unknown", label: "No estoy seguro", kind: "unknown" },
    ],
  },
  {
    id: "q2_ecommerce_product_discovery",
    version: 2,
    evidenceMigration: "pending",
    module: "ecommerce",
    type: "single",
    routingRole: "adaptive",
    prompt: "En tu tienda en línea, ¿qué tan fácil es encontrar el producto que se busca?",
    hint: "Piensa en recorrer el catálogo como una persona que entra por primera vez, sin que tú la guíes.",
    purpose: ["diagnostic"],
    priority: "normal",
    appliesWhen: andV2(contextEquals("activity", "active"), archetypeIncludes("ecommerce")),
    options: [
      { value: "easy", label: "Es fácil encontrarlo" },
      { value: "confusing", label: "A veces cuesta encontrarlo" },
      { value: "difficult", label: "Normalmente es difícil encontrarlo" },
      { value: "not_applicable", label: "No tengo un catálogo de productos que la persona pueda recorrer", kind: "not_applicable" },
      { value: "unknown", label: "No lo sé o no lo he probado desde fuera", kind: "unknown" },
    ],
  },
];
