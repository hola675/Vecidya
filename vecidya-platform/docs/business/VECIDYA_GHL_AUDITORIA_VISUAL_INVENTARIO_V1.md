# VECIDYA — Inventario de auditoría visual GHL V1

**Fecha:** 2026-11-11. **Estado:** auditoría en curso, solo observacional. **Evidencia E01:** captura enviada por el responsable de Vecidya del panel **Agency View > Subcuentas**, imagen de conversación `image(20261111-173655).png`. Contiene datos privados de negocios: el inventario registra únicamente los nombres y hechos necesarios, no teléfonos, direcciones ni identificadores personales.

## Regla de evidencia y clasificación
- **VISIBLE:** elemento mostrado en la captura; NO implica contratación, licencia SaaS, configuración ni funcionamiento.
- **OFICIAL:** característica respaldada por documentación publicada por GHL; no implica habilitación en esta cuenta.
- **PENDIENTE DE INSPECCIÓN:** no se ha examinado la pantalla específica.
- **PROBADO:** únicamente tras evidencia funcional E2E; no existen elementos probados todavía.
- **PROPUESTA COMERCIAL:** posible relación con Cuadra/Barrio/Ciudad/addons/servicios; no modificar las decisiones aprobadas sin consentimiento.

## E01 — Agencia > Subcuentas

### Evidencias directas
1. Se observa interfaz de **Agencia**, sección **Subcuentas**.
2. Encabezado indica **2 Subcuentas**; aparecen **Exterminaya** y **Vecidya**.
3. Ambas incluyen acción **Cambiar a subcuenta**; también se ve **Crear Subcuenta**. La existencia del botón **no certifica** que el plan permita crear otra ni que su provisión sea exitosa.
4. Ambas tienen etiqueta **«Cerrado (Ganado)»**; no permite deducir estado contractual, implantación CRM, cobros o automatizaciones.
5. Vecidya muestra «Último inicio de sesión: N/A». No demuestra inactividad total ni falla técnica.
6. Barra lateral muestra estas 18 entradas: AI Suite; Pregúntale a la IA; Tablero de la agencia; Prospección; Subcuentas; Instantáneas de la cuenta; Reventa; Complementos; Portal de afiliados; Biblioteca de plantillas; Socios; Universidad; Educación en SaaS; Swag de GHL; Ideas; Aplicación móvil; Aplicación de escritorio (texto truncado); Aplicaciones del mercado; además de **Configuración** abajo.
7. **No se observa una entrada rotulada «SaaS Configurator»** en esta vista. **Reventa** y **Educación en SaaS** no acreditan SaaS Mode habilitado. Podría estar restringido por plan, experiencia UI, permisos u otra causa: por verificar.

### Inventario acumulativo — primera sección
| ID | Elemento | Posible utilidad Vecidya | Evidencia de cuenta | Estado de prueba | Siguiente verificación |
|---|---|---|---|---|---|
| GHL-AG-001 | Agency View / Subcuentas | Aislar negocios con CRM Barrio/Ciudad | VISIBLE: 2 | NO PROBADO | Plan real, capacidad, aislamiento |
| GHL-AG-002 | Crear subcuenta | Onboarding CRM | VISIBLE: botón | NO PROBADO | Elegibilidad y flujo sin crear cuenta |
| GHL-AG-003 | Cambiar a subcuenta | Acceso al CRM de negocio | VISIBLE: botón | NO PROBADO | Inspeccionar después con autorización |
| GHL-AG-004 | Instantáneas de la cuenta | Plantillas Barrio/Ciudad | VISIBLE: menú | NO PROBADO | Inventario de snapshots y límites |
| GHL-AG-005 | Reventa | Addons y cargos | VISIBLE: menú | NO PROBADO | Pantalla y disponibilidad real |
| GHL-AG-006 | Complementos | Suscripciones/costos externos | VISIBLE: menú | NO PROBADO | Ver qué está contratado |
| GHL-AG-007 | AI Suite | IA opcional | VISIBLE: menú | NO PROBADO | Modelos, restricciones, usos |
| GHL-AG-008 | Prospección | Servicio o addon diferenciado | VISIBLE: menú | NO PROBADO | Elegibilidad y costes |
| GHL-AG-009 | Aplicaciones del mercado | Integraciones | VISIBLE: menú | NO PROBADO | Accesos, APIs, licencias |
| GHL-AG-010 | Configuración | Plan, facturación, permisos | VISIBLE: menú | NO PROBADO | Captura E02 solo de navegación |
| GHL-AG-011 | SaaS Configurator | Potencial futuro SaaS, upgrades | NO VISIBLE en E01; OFICIAL | NO PROBADO | Confirmar plan y acceso |
| GHL-AG-012 | Biblioteca de plantillas | Recursos y reutilización | VISIBLE: menú | NO PROBADO | Diferenciar de snapshots |

### Contraste con documentación oficial (consultado 2026-11-11)
- Tarifas publicadas: Starter USD 97/mes y 3 subcuentas; Unlimited USD 297/mes y subcuentas ilimitadas, rebilling teléfono/email sin markup; plan superior USD 497/mes incluye modalidad SaaS y otras funciones según edición comercial vigente. **No se conoce el plan real de esta cuenta**. https://www.gohighlevel.com/pricing
- SaaS Configurator gestiona planes, características, snapshots, addons y facturación, incluyendo las arquitecturas SaaS V1/V2; la documentación **no prueba activación en esta cuenta**. https://help.gohighlevel.com/support/solutions/articles/155000008015-getting-started-with-the-saas-configurator
- Reventa tiene opciones separadas para suscripciones/consumos/marketplace, dependientes de la UI y producto. https://help.gohighlevel.com/support/solutions/articles/155000008356-unified-reselling-experience-in-highlevel-wallet

### Clasificación comercial preliminar
- **Cuadra:** no requiere GHL; las 3 organizaciones Vecidya y sus MiniWeb no son subcuentas GHL.
- **Barrio:** proceso comercial estándar **para una organización** en una subcuenta GHL aislada, sujeto a verificación.
- **Ciudad:** hereda Barrio + biblioteca de seis módulos estándar incluida, activados según necesidad, sin recargo; sujeto a verificación de permisos y modelado CRM.
- **Addons:** WhatsApp, IA, SEO/listados y otros según tarifas Vecidya aprobadas; cuota del addon separada del consumo real.
- **Servicios:** implementación extraordinaria/integraciones y operación especializada fuera del estándar, presupuesto individual.
- Mantener **facturación externa** hasta contratación de GHL Unlimited y evaluación real del rebilling; no asumir SaaS Configurator en Unlimited.

### Incertidumbres y restricciones
- Sin pantalla de facturación/plan **no se identifica Starter/Unlimited/otro**.
- Dos subcuentas visibles no garantizan derecho a crear una tercera.
- No comprobados contratos, permisos, facturación, snapshots, workflows, canales ni aislamiento.
- No hacer cambios, crear subcuentas, habilitar reventa/SaaS ni comprar planes durante la auditoría.

### Próxima evidencia E02
**Agency View > Configuración**, mostrar navegación/menú del área de configuración, sin abrir formas de pago ni mostrar credenciales. Objetivo: localizar datos de plan, facturación y permisos, y luego definir una inspección puntual.


## E02 — Agencia > Configuración > Mi perfil

**Fecha:** 2026-11-11. **Evidencia E02:** segunda captura recibida por conversación. Contiene datos personales visibles (nombre, email, teléfono): **no reproducirlos ni trasladarlos al inventario**. Se observa la pestaña **General** (activa), pestaña **Seguridad**, y sección Mi perfil. No se abrió Facturación ni ninguna información de pago.

### Evidencia directa en captura E02
- Menú Configuración a nivel agencia con: Mi perfil, Empresa, Usuarios, Facturación, Configuración de flujo de trabajo (etiqueta truncada), Integración telefónica, Servicios de correo electrónico (truncado), Correos electrónicos del sistema (truncado), Anuncios, Flujo de trabajo - Funciones (truncado), Flujo de trabajo - Modelos (truncado), Compra de dominio, Integraciones Privado, Afiliados, Enlaces de menú personalizados (truncado), Stripe, Claves de API, Conformidad, Laboratorios, Registros de auditoría y Uso de contenido multimedia (truncado). **20 entradas de configuración observables**; algunas denominaciones requieren apertura para identificar el título completo.
- Dentro de Mi perfil aparecen pestañas **General** y **Seguridad**. **Ninguna de estas entradas demuestra SaaS Mode, una integración de pagos activa ni uso de API habilitado**.
- Se ven botones/controles de edición de perfil, pero no fueron pulsados ni modificados.

### Declaración del titular (no acreditada visualmente)
El titular informa que su plan vigente es **GHL Starter USD 97/mes** y que **mantendrá Starter hasta que el aumento de clientes e ingresos justifique contratar Unlimited USD 297/mes**. Esto es **PLAN DECLARADO POR USUARIO**, no verificación de Facturación. No pedir nuevamente el dato mientras no se necesite comprobar un detalle contractual.

### Contraste con documentación oficial
- Starter: **3 subcuentas en total** de la agencia; Unlimited: **subcuentas ilimitadas** y rebilling de teléfono/email sin markup; Founder/Agency Pro USD 497: SaaS Mode y rebilling con markup, según elegibilidad. https://www.gohighlevel.com/pricing
- E01 mostraba dos subcuentas; bajo Starter el máximo documentado es tres, por lo que **podría existir una tercera plaza**, pero quedan por verificar asignaciones, excepciones y capacidad efectiva antes de crear otra.
- **API estándar:** la guía oficial actual describe OAuth2 y Private Integration Tokens disponibles también en Starter, mientras ciertos endpoints como creación programática de subcuentas o habilitación SaaS siguen reservados a plan superior. No afirmar «API imposible en Starter». https://help.gohighlevel.com/support/solutions/articles/48001060529

### Inventario ampliado
| ID | Elemento | Evidencia | Estado | Próxima comprobación |
|---|---|---|---|---|
| GHL-AG-013 | Agencia > Configuración > Mi perfil | VISIBLE E02 | Sin probar | No prioritaria; evitar datos personales |
| GHL-AG-014 | Pestaña Seguridad del perfil | VISIBLE E02 | Sin abrir | Auditoría posterior de controles sin credenciales |
| GHL-AG-015 | Empresa | VISIBLE E02 | Sin abrir | Identidad/marca de agencia |
| GHL-AG-016 | Usuarios | VISIBLE E02 | Sin abrir | Roles agencia vs subcuentas |
| GHL-AG-017 | Facturación | VISIBLE E02 | Sin abrir | Ver cargos y suscripción sin mostrar métodos de pago |
| GHL-AG-018 | Configuraciones globales de workflows | VISIBLE E02 (etiquetas truncadas) | Sin abrir | Identificar nombre completo, restricciones y costes |
| GHL-AG-019 | Integración telefónica/email | VISIBLE E02 | Sin abrir | Canal, proveedor, consumos y permisos |
| GHL-AG-020 | Anuncios | VISIBLE E02 | Sin abrir | Gestor y cargos |
| GHL-AG-021 | Compra de dominio | VISIBLE E02 | Sin abrir | Costes/domaines |
| GHL-AG-022 | Integraciones Privado | VISIBLE E02 | Sin abrir | PIT, OAuth, accesos y scopes; no compartir claves |
| GHL-AG-023 | Stripe | VISIBLE E02 | Sin abrir | Solo presencia del menú, sin certificar conexión |
| GHL-AG-024 | Claves de API | VISIBLE E02 | Sin abrir | Elegibilidad sin exponer credenciales |
| GHL-AG-025 | Conformidad | VISIBLE E02 | Sin abrir | Regulación y datos |
| GHL-AG-026 | Laboratorios | VISIBLE E02 | Sin abrir | Funciones experimentales, no prometer a clientes |
| GHL-AG-027 | Registros de auditoría | VISIBLE E02 | Sin abrir | Acciones y control |
| GHL-AG-028 | Personalización de menús | VISIBLE E02 | Sin abrir | Comprobar alcances técnicos |
| GHL-AG-029 | Facturación externa actual Vecidya | DECISIÓN APROBADA, no visible en E02 | Por implementar | Proveedor externo a seleccionar e integrar |

### Implicaciones para Vecidya
- No comprar ni recomendar upgrade inmediato: **Starter sigue siendo el plan operativo elegido**.
- No mezclar tres plazas GHL con las tres organizaciones permitidas por licencia Vecidya; CRM solo para una organización autorizada por licencia Barrio/Ciudad.
- Diseñar Biblioteca Ciudad de seis módulos bajo capacidades verificadas de cada subcuenta y snapshots reproducibles.
- Mantener addon con precio fijo + consumos reales separados y facturación externa; reexaminar rebilling al contratar Unlimited, sin prometer SaaS Configurator.
- Próxima pantalla: **Agency View > Reventa**, para auditar catálogo de reventa y condiciones de addons, **sin activar nada, sin cambios de margen y sin datos de pago**.


## E03 — Agencia > Reventa (Subscription / Usage / Marketplace)

**Fecha:** 2026-11-11. **Evidencia E03:** 11 capturas proporcionadas por el usuario, segmentos de tres pestañas de Reventa. Auditoría observacional **sin cambios, sin guardar precios y sin activar servicios**. Mercado comercial predominante indicado por usuario: **Colombia**. Esta preferencia NO determina automáticamente la moneda de cobro ni autoriza transformar tarifas USD en COP sin tasa/términos aprobados.

### 1. Plan y capacidades declaradas por la propia interfaz (VISIBLE E03)
- Banda superior: «Estás en el plan $97 — upgrade to $297 for static markup (1.05x), or $497 to unlock fully configurable custom markups». Es **confirmación visual de Starter $97/mes**, antes solo declarado por titular.
- GHL ofrece pestañas **Subscription**, **Usage**, **Marketplace** en Reventa. La presencia de campos editables, interruptores y «Guardar cambios» **no confirma** la posibilidad de cobrar, ni que exista un método de pago válido, ni que los cambios se hayan guardado.
- El plan Unlimited $297 sigue siendo **objetivo futuro, no contratado**. SaaS Mode y custom rebilling avanzado requieren comprobación de plan superior, especialmente $497.
- «Habilitado 2 / Deshabilitado 0» aparece repetidamente bajo «Gestión de Subcuentas» para varias fichas. Describe estado de gestión/reventa en la UI, **NO significa dos clientes pagando**, ni asegura que producto esté activado funcionalmente. Usar «Administrar» solo para inspección autorizada en una captura futura, sin cambios.

### 2. Pestaña Subscription — categorías listadas (VISIBLE E03)
Ad Manager, AI Employee, Branded Client Portal Mobile App, Listings, Prospecting, SEO (By Search Atlas), WhatsApp, WordPress y Workflow Pro. **Nueve familias** en menú. Ad Manager presenta coste agencia $0, precio cliente $0, beneficio $0, pero **no hay base para añadirle una cuota fija artificial**. Workflow Pro aparece como producto separado de las automatizaciones CRM estándar incluidas en Barrio/Ciudad.

### 3. Precios efectivos visibles en formulario GHL vs catálogo comercial Vecidya
| Producto | Coste mostrado GHL (USD) | «El precio de su cliente» visible (USD) | Vecidya aprobado (USD) | Nota/estado |
|---|---:|---:|---:|---|
| Ad Manager | 0 | 0 | Sin cuota fija adicional | Gasto ads y operación gestionada separados |
| AI Employee Growth | 50/mes | 75/mes | **62.50/mes** | Discrepancia; cuota Growth según uso incluido vigente |
| AI Employee Unlimited | 97/mes | 127/mes | **121.25/mes** | Discrepancia; no prometer uso ilimitado absoluto |
| Branded Client Portal Mobile App | 49/mes | 79/mes | **61.25/mes** | Discrepancia |
| Listings mensual | 30/mes | 49/mes | **37.50/mes** | Discrepancia |
| Listings 6 meses | 150/6 meses | 200/6 meses | Sin aprobación específica | **NO asumir** regla 25% del precio mensual en plazo semestral |
| Listings anual | 300/año | 450/año | Sin aprobación específica | **NO asumir** precio anual de Vecidya |
| Prospecting | 29/mes | 45/mes | **36.25/mes** | Discrepancia |
| SEO Search Atlas | 79/mes | 97/mes | **98.75/mes** | Discrepancia inversa |
| WhatsApp | 10/mes | 29.99/mes | **12.50/mes** | **Discrepancia crítica** frente a catálogo aprobado |
| WordPress Standard por sitio | 10/mes | Campo con cadena no traducida / sin precio válido; «beneficio NaN» | **12.50/mes** | **Anomalía visible de UI**, no guardar, comprobar método real |

Los campos capturados no prueban que esas ofertas sean comprables ni que las subcuentas estén efectivamente abonándolas. La cuenta presenta distintos valores base de margen aparentemente precargados. **No alterar precios ni guardar durante la auditoría**. Si los clientes tienen acceso al muro de compra de GHL, existe riesgo potencial de ver importes incoherentes con la web Vecidya; verificar acceso antes de abrir contratación. El cobro por proveedor externo sigue aprobado y **aún pendiente de integración**.

### 4. Pestaña Usage (VISIBLE E03)
Menú: **Domain Purchase; Email System; Email Verification; Phone System; Workflow - External AI Models; Workflow - Premium Features**. Texto del panel indica que los recargos configurados podrían aplicarse cuando clientes agreguen tarjeta de pago. Los campos aparecen difuminados/inactivos/no legibles en varias capturas; **no se puede inferir porcentaje aplicado ni cobros activos**. Banner advierte sobre disponibilidad de markup por plan. Política Vecidya aprobada: consumos medidos se repercuten al coste real verificable, sin el 25% de recargo del addon; cobro externo, conciliación de registros por subcuenta y alertas.

### 5. Pestaña Marketplace (VISIBLE E03)
Encabezado «Agency App Reselling For All Sub-Accounts»; listado indica **1.544 apps** disponibles en catálogo de reventa, búsqueda y filtros, casillas y control de recargo masivo inicialmente **0%**. Se muestran, por ejemplo, «All The Apps» y «myCRMSIM» como anuncios del marketplace; **no se han inspeccionado, contratado, recomendado o certificado**. La presencia de una app no implica compatibilidad Colombia, garantía de precio, seguridad o disponibilidad en Starter. No aplicar márgenes masivos.

### 6. Colombia — prioridad comercial y técnica (DECISIÓN DE ENFOQUE)
- Clientes principalmente **colombianos**: evaluar casos de uso y facturación de país de destino; no usar tarifas de números, SMS, A2P o minutos de Estados Unidos para cotizar Colombia.
- WhatsApp: GHL cobra **USD 10/mes por subcuenta + mensajes/llamadas variables** según producto y mercado. El precio fijo Vecidya sigue **USD 12.50/mes + consumo real**; las tablas de WhatsApp distinguen Marketing, Utility, Authentication y Service. Desde **2026-10-01** servicio y utility dentro de ventana pueden facturarse; los primeros 1.000 mensajes de servicio/mes/número siguen gratuitos. Consultar guía actualizada al cotizar; no prometer todo gratis ni ilimitado.
- Verificar números y operaciones locales, consentimiento y normativa colombiana aplicable, moneda de venta USD/COP, tipo de cambio, impuestos/facturación local y plataforma externa concreta antes de cobrar. **No se ha aprobado moneda COP, tasa de cambio o proveedor de pagos.**
- No inferir que todos los negocios colombianos requieren telefonía/SMS, portal móvil, WordPress o SEO de pago; recomendar por necesidad y viabilidad.

### 7. Contraste oficial (PUBLICADO; no certifica cuenta)
- GHL Pricing: https://www.gohighlevel.com/pricing (Starter $97/3 subcuentas; Unlimited $297/subcuentas ilimitadas, rebilling teléfono/email sin markup; superior $497 SaaS Mode y markup).
- Guide: https://help.gohighlevel.com/support/solutions/articles/155000001156-highlevel-pricing-guide (suscripciones / uso, precios y wallet).
- WhatsApp guía modificada 2026-11-04: https://help.gohighlevel.com/support/solutions/articles/155000001428-whatsapp-pricing-billing-and-rebilling-guide (vigencia de cargos desde 2026-10-01, cambios por mercado).
- AI Employee: https://help.gohighlevel.com/support/solutions/articles/155000003906-ai-employee-overview (reventa vs rebilling, uso e inclusiones).
- SaaS direct deployment: https://help.gohighlevel.com/support/solutions/articles/155000007221-how-to-package-add-ons-as-part-of-saas-plans (coste de addon absorbido por agencia dentro del paquete SaaS).
- Marketplace y pagos SaaS V2: https://help.gohighlevel.com/support/solutions/articles/155000005083/ (reventa/cartera si el producto cumple condiciones de SaaS V2).

### 8. Inventario ampliado E03
| ID | Capacidad/área | Evidencia | Clasificación comercial | Validación pendiente |
|---|---|---|---|---|
| GHL-AG-030 | Reventa / Subscription | VISIBLE E03 | Addons de cuota fija | Compatibilidad venta externa vs pago directo |
| GHL-AG-031 | Reventa / Usage | VISIBLE E03 | Consumos variables | Lectura de tarifas, estado y factura real |
| GHL-AG-032 | Reventa / Marketplace | VISIBLE E03 | Integraciones de terceros | Riesgo, elegibilidad, condiciones |
| GHL-AG-033 | WhatsApp mensual | VISIBLE 10→29.99 | Aprobado Vecidya 12.50 + consumo | Estado de comercialización y muro pago |
| GHL-AG-034 | AI Employee Growth/Unlimited | VISIBLE 50→75 / 97→127 | Aprobados 62.50 / 121.25 | Incluidos, restricciones y cobro |
| GHL-AG-035 | Listings mensual/6m/anual | VISIBLE 30→49 / 150→200 / 300→450 | Mensual aprobado 37.50; otros periodos sin aprobar | Periodos y precio final |
| GHL-AG-036 | Prospecting | VISIBLE 29→45 | Aprobado 36.25 | Activación y alcance |
| GHL-AG-037 | SEO Search Atlas | VISIBLE 79→97 | Aprobado 98.75 | Alcance, soporte, reselling |
| GHL-AG-038 | Portal móvil marca | VISIBLE 49→79 | Aprobado 61.25 | Disponibilidad vs app Vecidya |
| GHL-AG-039 | WordPress Standard | VISIBLE coste 10, cliente inválido NaN | Aprobado 12.50 por sitio | Error UI / modalidad |
| GHL-AG-040 | Workflow Pro | VISIBLE en menú | Producto externo/consumo | No confundir con workflows incluidos en CRM |
| GHL-AG-041 | Ad Manager | VISIBLE 0→0 | Herramienta sin cuota fija; gestión servicio | Publicidad real aparte |
| GHL-AG-042 | Marketplace 1.544 apps | VISIBLE en catálogo | Solo extensiones verificadas | No instalar por aparecer listada |
| GHL-AG-043 | Banners de elegibilidad plan | VISIBLE Starter 97 y 297/497 upgrades | Administración / restricciones | Mecanismo de cobro real |
| GHL-AG-044 | Mercado principal Colombia | DECLARADO por titular | Criterio geográfico de ofertas | Moneda, tasas, facturación y servicios compatibles |

### Hallazgos / clasificación por riesgo
- **ALTO — Desalineación de precios públicos vs muro GHL:** WhatsApp, IA, Listings, Prospecting, Portal; confirmar visibilidad a clientes antes de abrir checkout directo. Sin pruebas de cargo efectivo.
- **MEDIO — Estado «Habilitado 2»:** no tratar como 2 clientes pagos; comprobar elegibilidad por subcuenta posteriormente.
- **MEDIO — WordPress «NaN»:** error de visualización o estado incompleto; no guardar campos afectados.
- **MEDIO — Cobros de consumo por país:** para Colombia se precisan tarifas y reglas específicas, no extrapolar EE. UU.
- **BAJO — Anuncios Marketplace y Ad Manager:** no recomendar addons hasta validación individual.

### Próxima captura E04
Desde **Agencia > Subcuentas > Vecidya > Cambiar a subcuenta**, enviar captura de la **barra lateral y pantalla inicial**. Objetivo: inventariar navegación real CRM (contactos, oportunidades, calendarios, conversaciones, automatizaciones y ajustes) y comenzar diferenciación funcional Barrio/Ciudad. **No abrir datos privados, no crear pruebas ni modificar configuraciones.**

## Changelog
- **2026-11-11 E03:** revisión 11 capturas Reventa Subscription/Usage/Marketplace, detección de precios incompatibles, Starter confirmado visualmente y segmentación prioritaria Colombia.
