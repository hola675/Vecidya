import type { QuestionDefinitionV2 } from "../qbv2-contract";

/**
 * Catálogo editorial canónico de QA-03B: 45 enunciados y ayudas.
 *
 * Este catálogo NO cambia IDs, versiones, valores, opciones, señales,
 * reglas, evidencias ni puntuaciones, y no modifica el banco histórico.
 * variantPrompts solo sustituye el enunciado, nunca las etiquetas ni el target.
 */
type EditorialCopy = {
  readonly prompt: string;
  readonly hint: string;
  readonly variantPrompts?: Readonly<Record<number, string>>;
};

export const QA03B_EDITORIAL_COPY = {
  "q2_entity": {
    "prompt": "¿Qué describe mejor el negocio, trabajo profesional, organización o proyecto que quieres evaluar?",
    "hint": "Elige la opción que mejor represente lo que haces o estás preparando, aunque todavía no hayas comenzado."
  },
  "q2_other_staff": {
    "prompt": "Además de ti, ¿hay alguna otra persona remunerada que trabaje habitualmente contigo?",
    "hint": "Incluye empleados y colaboradores remunerados habituales. No cuentes ayudas puntuales ni proveedores ocasionales."
  },
  "q2_has_customers": {
    "prompt": "¿Alguna persona ha comprado, contratado, utilizado o recibido realmente lo que ofreces?",
    "hint": "Cuenta experiencias anteriores, incluso si ahora estás en pausa. Los seguidores o interesados no cuentan por sí solos."
  },
  "q2_operational_status": {
    "prompt": "¿En qué situación se encuentra actualmente tu negocio, trabajo profesional, organización o proyecto?",
    "hint": "Indica si ya está disponible, todavía lo preparas o está en pausa, aunque hayas atendido personas antes."
  },
  "q2_sector": {
    "prompt": "¿A qué se dedica principalmente tu negocio o emprendimiento?",
    "hint": "Elige el sector de tu negocio o del emprendimiento que preparas. Vender por internet no es, por sí solo, un sector.",
    "variantPrompts": {
      "0": "¿A qué se dedica principalmente tu organización?"
    }
  },
  "q2_delivery": {
    "prompt": "¿De qué maneras atiendes a las personas, prestas tus servicios o vendes tus productos?",
    "hint": "Puedes marcar varias. Si estás en pausa, piensa en cómo trabajabas; si estás preparando el proyecto, en cómo planeas hacerlo.",
    "variantPrompts": {
      "0": "¿De qué maneras planeas atender a las personas, prestar servicios o vender productos?"
    }
  },
  "q2_customer_buyer": {
    "prompt": "¿Quién suele comprar o contratar directamente lo que ofreces?",
    "hint": "Piensa en quien realiza la compra o contratación, aunque otra persona utilice o reciba el producto o servicio."
  },
  "q2_buyer_recipient_relation": {
    "prompt": "¿Quien paga o contrata es también quien recibe o utiliza lo que ofreces?",
    "hint": "Por ejemplo, una empresa puede contratar un servicio para sus empleados o una entidad financiarlo para beneficiarios."
  },
  "q2_customer_reach": {
    "prompt": "¿En qué zonas geográficas se encuentran principalmente las personas u organizaciones a las que atiendes o vendes?",
    "hint": "Elige dónde está la mayoría. Marca «mixto» si atiendes habitualmente tu zona y lugares más lejanos.",
    "variantPrompts": {
      "0": "¿En qué zonas geográficas están las personas a las que quieres llegar?",
      "1": "¿En qué zonas geográficas están las personas que atiende tu organización?",
      "2": "¿En qué zonas geográficas están las personas que atiende tu organización?"
    }
  },
  "q2_monetization": {
    "prompt": "¿Cuál es la principal fuente de ingresos o aportes de tu negocio, trabajo, organización o proyecto?",
    "hint": "Si está en pausa, piensa en la fuente anterior. Si todavía lo preparas, indica la que esperas tener.",
    "variantPrompts": {
      "0": "Si comienzas a operar, ¿de dónde esperas obtener principalmente ingresos o aportes?"
    }
  },
  "q2_goal": {
    "prompt": "¿Qué te gustaría mejorar primero en tu negocio, trabajo, organización o proyecto?",
    "hint": "Elige tu prioridad principal, aunque también haya otras áreas que necesiten mejoras."
  },
  "q2_friction": {
    "prompt": "¿Cuál de estas dificultades afecta más a tu negocio, trabajo u organización actualmente?",
    "hint": "Elige la situación que más te preocupa o limita, aunque también tengas otras dificultades.",
    "variantPrompts": {
      "0": "¿Cuál de estas dificultades afecta más a tu organización actualmente?"
    }
  },
  "q2_regularity": {
    "prompt": "En los últimos meses, ¿con qué regularidad has tenido clientes, ventas, citas, pedidos o personas atendidas?",
    "hint": "Piensa en el comportamiento habitual, no solo en una semana especialmente buena o mala."
  },
  "q2_demand_trend": {
    "prompt": "En los últimos meses, ¿cómo ha cambiado la cantidad de clientes, ventas, citas o pedidos que recibes?",
    "hint": "Usa el indicador que mejor represente lo que ofreces y compara varios meses, no una semana aislada.",
    "variantPrompts": {
      "0": "En los últimos meses, ¿cómo ha cambiado la cantidad de pacientes o citas?",
      "1": "En los últimos meses, ¿cómo ha cambiado la cantidad de personas que atiende o apoya tu organización?"
    }
  },
  "q2_capacity_signal": {
    "prompt": "En los últimos meses, ¿cómo ha sido tu capacidad para atender el trabajo, los pedidos o las personas que llegan?",
    "hint": "Marca todas las situaciones que correspondan, incluso si ampliaste personal, horarios o recursos para atender más."
  },
  "q2_process_systemization": {
    "prompt": "Cuando realizas tareas habituales, ¿sigues normalmente los mismos pasos para completarlas?",
    "hint": "Piensa en responder consultas, preparar presupuestos, registrar pedidos, confirmar citas o atender solicitudes."
  },
  "q2_operations_handoffs": {
    "prompt": "Cuando otra persona continúa un trabajo iniciado por alguien más, ¿recibe toda la información que necesita?",
    "hint": "Incluye instrucciones, datos o pendientes. No importa si se transmiten hablando, en papel o digitalmente."
  },
  "q2_operations_information_base": {
    "prompt": "Cuando necesitas información para continuar un trabajo, ¿puedes encontrarla fácilmente y saber que está actualizada?",
    "hint": "Puede estar en una agenda, documento, papel o sistema digital. Importa encontrar la versión correcta."
  },
  "q2_digital_tools_in_use": {
    "prompt": "¿Qué herramientas digitales utilizas actualmente para organizar tareas, citas, clientes, pedidos o información?",
    "hint": "Marca las que utilizas realmente, aunque sean sencillas. Usar una herramienta no significa que todo el proceso funcione bien."
  },
  "q2_followup_general_process": {
    "prompt": "Cuando debes volver a contactar a alguien o completar un asunto pendiente, ¿sueles hacerlo a tiempo?",
    "hint": "Piensa en seguimientos reales. Puedes organizarte de memoria, con notas, recordatorios o herramientas digitales."
  },
  "q2_discovery_reliable_reach": {
    "prompt": "En los últimos meses, ¿has conseguido llegar con constancia a personas nuevas interesadas en lo que ofreces?",
    "hint": "Cuenta cualquier vía: Google, redes sociales, recomendaciones, anuncios u otros medios."
  },
  "q2_local_presence_consistency": {
    "prompt": "Si alguien busca tu negocio en internet, ¿encuentra correctamente tus datos de contacto, ubicación u horarios?",
    "hint": "Considera teléfono, WhatsApp, dirección y horarios, solo cuando correspondan a tu negocio."
  },
  "q2_reputation_flow": {
    "prompt": "¿Quien busca lo que ofreces puede encontrar reseñas, opiniones o testimonios de personas con experiencia contigo?",
    "hint": "Incluye reseñas de Google, testimonios públicos y opiniones en tu web u otros lugares visibles."
  },
  "q2_service_response_speed": {
    "prompt": "Cuando alguien te contacta por primera vez para preguntar por lo que ofreces, ¿sueles responderle a tiempo?",
    "hint": "Piensa en llamadas, WhatsApp, redes sociales o formularios. Incluye los mensajes que quedan sin responder."
  },
  "q2_service_quote_followup": {
    "prompt": "Después de enviar un presupuesto o cotización, si la persona no responde, ¿sueles volver a contactarla?",
    "hint": "Responde según lo que haces habitualmente cuando entregas un precio o propuesta antes de realizar el trabajo."
  },
  "q2_appointments_noshow": {
    "prompt": "En los últimos meses, ¿con qué frecuencia las personas no se presentaron a citas que ya tenían reservadas?",
    "hint": "Cuenta citas reservadas a las que no asistieron, no solicitudes de cita que nunca llegaron a agendarse.",
    "variantPrompts": {
      "0": "En los últimos meses, ¿con qué frecuencia tus pacientes faltaron a citas que tenían reservadas?"
    }
  },
  "q2_appointments_booking_friction": {
    "prompt": "Cuando alguien quiere reservar una cita, ¿con qué frecuencia resulta difícil acordar un horario?",
    "hint": "Cuenta demoras o varios intentos innecesarios. Una conversación normal para elegir la hora no es un problema."
  },
  "q2_appointments_lead_to_booking": {
    "prompt": "De las personas que preguntan o intentan reservar una cita, ¿cuántas consiguen agendarla finalmente?",
    "hint": "Cuenta tanto las solicitudes que terminaron en una cita reservada como las que no llegaron a confirmarse."
  },
  "q2_appointments_confirmation_reminders": {
    "prompt": "Antes de una cita reservada, ¿con qué frecuencia la persona recibe un recordatorio?",
    "hint": "Puede ser por WhatsApp, SMS, correo o llamada. Cuenta recordatorios enviados antes de la cita."
  },
  "q2_appointments_rebooking": {
    "prompt": "Cuando un cliente necesita otra cita para continuar su atención o servicio, ¿cómo se organiza esa próxima visita?",
    "hint": "Piensa si acuerdan la siguiente cita con anticipación o si el cliente debe contactar de nuevo por su cuenta."
  },
  "q2_professional_authority_signals": {
    "prompt": "Si una persona todavía no te conoce, ¿puede encontrar información que muestre tu experiencia o trabajos realizados?",
    "hint": "Por ejemplo: proyectos anteriores, casos, resultados, certificaciones o experiencia profesional."
  },
  "q2_professional_intake_flow": {
    "prompt": "Cuando alguien quiere contratar tus servicios o solicitar atención, ¿sabe qué debe hacer a continuación?",
    "hint": "Por ejemplo, escribirte, llamar, solicitar información, reservar una cita o enviar los datos necesarios."
  },
  "q2_ecommerce_traffic_sources": {
    "prompt": "¿Desde qué lugares de internet llegan habitualmente personas a tu tienda online?",
    "hint": "Marca todas las fuentes habituales, como redes, Google, anuncios, otras plataformas o enlaces directos."
  },
  "q2_retail_product_visibility": {
    "prompt": "Si alguien encuentra tu negocio en internet, ¿puede ver claramente qué tipos de productos vendes?",
    "hint": "No necesitas publicar todo el inventario ni las existencias exactas; basta con mostrar qué productos ofreces."
  },
  "q2_retail_customer_capture": {
    "prompt": "Después de una compra, ¿conservas una forma autorizada de volver a contactar directamente con ese cliente?",
    "hint": "Cuenta solo medios de contacto que puedes utilizar con su permiso. Tener seguidores en redes no basta."
  },
  "q2_ecommerce_product_discovery": {
    "prompt": "Si alguien entra por primera vez en tu tienda online, ¿puede encontrar fácilmente el producto que necesita?",
    "hint": "Piensa en cómo están organizados los productos y si se encuentran sin pedirte ayuda."
  },
  "q2_b2b_pipeline": {
    "prompt": "Cuando una empresa u organización muestra interés en contratarte, ¿sigues un proceso claro hasta conocer el resultado?",
    "hint": "Puede ser con notas, agenda o software. Importa saber qué hacer después y cómo terminó cada posible contratación."
  },
  "q2_b2b_status_visibility": {
    "prompt": "Cuando tienes conversaciones sobre posibles contrataciones, ¿puedes consultar fácilmente en qué quedó cada una?",
    "hint": "Piensa si puedes recuperar lo hablado, la respuesta recibida y los pasos pendientes, aunque uses notas o memoria."
  },
  "q2_creator_audience_ownership": {
    "prompt": "Además de publicar contenido, ¿puedes volver a contactar directamente con las personas interesadas en lo que haces?",
    "hint": "Por ejemplo, mediante correo o mensajes autorizados, sin depender solo de que vuelvan a ver tus publicaciones."
  },
  "q2_presence_digital_base": {
    "prompt": "Si alguien busca lo que ofreces, ¿encuentra en internet un lugar con información actualizada para conocerte y contactarte?",
    "hint": "Puede ser una web, ficha de Google o perfil público. No hace falta tener un sitio propio, pero los datos deben estar correctos."
  },
  "q2_presence_offer_clarity": {
    "prompt": "Cuando alguien encuentra tu negocio o proyecto en internet, ¿entiende claramente qué productos, servicios o ayuda ofreces?",
    "hint": "Piensa en lo que puede entender sin preguntarte. No estamos evaluando cuántas personas compran."
  },
  "q2_measurement_rate_estimate": {
    "prompt": "De las consultas o pedidos que recibes, ¿puedes estimar cuántos terminan en una compra o contratación?",
    "hint": "No necesitas calcularlo ahora. Responde según los registros o información que tienes normalmente disponible."
  },
  "q2_measurement_result_recording": {
    "prompt": "Aunque no puedas estimar un porcentaje, ¿registras si cada consulta o pedido terminó en una compra o contratación?",
    "hint": "Importa si anotas el resultado de cada consulta o pedido, aunque todavía no calcules una tasa de conversión."
  },
  "q2_measurement_review_cycle": {
    "prompt": "¿Revisas periódicamente resultados como consultas, ventas, citas o pedidos para decidir qué mejorar?",
    "hint": "Piensa en revisiones reales que ayudan a tomar decisiones, no solo en disponer de herramientas o datos."
  },
  "q2_measurement_practice": {
    "prompt": "En los últimos tres meses, ¿cómo has registrado y revisado resultados para decidir qué mejorar?",
    "hint": "Piensa en consultas, ventas, citas, personas atendidas o aportes. No es necesario usar herramientas digitales."
  }
} as const satisfies Readonly<Record<string, EditorialCopy>>;

const EDITORIAL_LOOKUP: Readonly<Record<string, EditorialCopy>> = QA03B_EDITORIAL_COPY;

export function applyQA03BEditorialCopy(question: QuestionDefinitionV2): QuestionDefinitionV2 {
  const copy = EDITORIAL_LOOKUP[question.id];
  if (!copy) return question;

  const variants = question.variants?.map((variant, index) => {
    const prompt = copy.variantPrompts?.[index];
    return prompt === undefined ? variant : { ...variant, prompt };
  });
  return { ...question, prompt: copy.prompt, hint: copy.hint, ...(variants === undefined ? {} : { variants }) };
}
