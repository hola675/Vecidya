import assert from "node:assert/strict";
import { test } from "node:test";

import { publicAssets } from "../../app/assets/public-assets.ts";

test("public assets register the approved catalog replacements", () => {
  assert.equal(publicAssets.catalog.diagnostic.low, "/assets/catalog/diagnostic/presencia-por-fortalecer-mal.png");
  assert.equal(publicAssets.catalog.diagnostic.developing, "/assets/catalog/diagnostic/presencia-en-desarrollo-regular.png");
  assert.equal(publicAssets.catalog.diagnostic.solid, "/assets/catalog/diagnostic/presencia-solida-bien.png");
  assert.equal(publicAssets.catalog.plans.cuadra, "/assets/catalog/plans/plan-cuadra.png");
  assert.equal(publicAssets.catalog.plans.barrio, "/assets/catalog/plans/plan-barrio.png");
  assert.equal(publicAssets.catalog.plans.ciudad, "/assets/catalog/plans/plan-ciudad.png");
  assert.equal(publicAssets.catalog.addons.whatsapp, "/assets/catalog/features/communication/whatsapp-01.png");
  assert.equal(publicAssets.catalog.addons.sms, "/assets/catalog/features/communication/sms-01.png");
  assert.equal(publicAssets.catalog.addons.telefonia, "/assets/catalog/features/communication/llamadas-01.png");
  assert.equal(publicAssets.catalog.addons.automatizaciones, "/assets/catalog/features/operations/automatizaciones-01.png");
  assert.equal(publicAssets.catalog.addons.aiConversacional, "/assets/catalog/features/communication/ia-chatbot.png");
  assert.equal(publicAssets.catalog.addons.aiVoice, "/assets/catalog/features/communication/ia-agente-de-voz-01.png");
  assert.equal(publicAssets.catalog.addons.integraciones, "/assets/catalog/features/operations/api-e-integraciones.png");
  assert.equal(publicAssets.catalog.services.organizacion, "/assets/catalog/features/operations/crm-avanzado.png");
  assert.equal(publicAssets.catalog.services.presenciaDigital, "/assets/catalog/features/operations/sitio-web-01.png");
  assert.equal(publicAssets.catalog.services.automatizacion, "/assets/catalog/features/operations/automatizaciones-01.png");
  assert.equal(publicAssets.catalog.services.inteligenciaArtificial, "/assets/catalog/features/marketing/ia-contenido-01.png");
  assert.equal(publicAssets.catalog.services.visibilidad, "/assets/catalog/features/marketing/redes-sociales-01.png");
});
