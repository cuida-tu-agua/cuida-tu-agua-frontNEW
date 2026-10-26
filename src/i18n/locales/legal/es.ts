import { LegalTexts } from '../../../domain/legal/LegalDocument';

/** Spanish is the original: the other languages translate this text section by section (same order, same lists). */
export const legalEs: LegalTexts = {
  and: 'y',
  emailPending: '(correo pendiente de publicar)',
  country: 'Colombia',
  documents: {
    terms: {
      title: 'Términos y Condiciones',
      summary: 'Las reglas para usar la app y el medidor: lo que hace el servicio, lo que no hace y de qué responde cada uno.',
      sections: [
        {
          title: '1. Quiénes somos',
          blocks: [
            'Cuida Tu Agua es un proyecto de {{responsible}}, con domicilio en {{city}} y correo {{email}} ("nosotros"). Estos Términos regulan el uso de la app móvil, la app web y el dispositivo medidor Cuida Tu Agua (el "Servicio").',
            'Al crear tu cuenta y marcar la casilla de aceptación, declaras que los leíste y los aceptas. Si no estás de acuerdo, no uses el Servicio.',
            'El tratamiento de tus datos se rige por la Política de Tratamiento de Datos, y el dispositivo, por la Garantía y uso seguro. Ambos forman parte de estos Términos.',
            'Nada de lo aquí escrito limita los derechos que te dan las leyes de protección al consumidor: en Colombia, la Ley 1480 de 2011; en Ecuador, la Ley Orgánica de Defensa del Consumidor. Si una cláusula las contradice, se aplica la ley.',
          ],
        },
        {
          title: '2. Qué hace el Servicio',
          blocks: [
            {
              items: [
                'Registrar tus lugares y vincular a cada uno un medidor con caudalímetro y electroválvula.',
                'Ver tu consumo de agua por hora, día y mes, y su costo estimado según la tarifa que registres.',
                'Abrir y cerrar la válvula a distancia, con confirmación.',
                'Recibir alertas en la app, por correo, SMS o WhatsApp.',
                'Fijar metas, ver consejos de ahorro y compartir un lugar con colaboradores o con un enlace de invitado.',
              ],
            },
          ],
        },
        {
          title: '3. Lo que el Servicio NO es',
          blocks: [
            {
              items: [
                '**No es un medidor oficial.** Las lecturas son referenciales: sirven para conocer y reducir tu consumo, pero no reemplazan el medidor ni la factura de tu empresa de acueducto, ni sirven para reclamarle.',
                '**No es un servicio de emergencia ni un sistema de seguridad.** Las alertas dependen de tu internet, de la energía, del dispositivo y de servicios de terceros, y pueden llegar tarde o no llegar. Ante una emergencia, cierra la llave de paso principal y llama a un plomero o a las autoridades.',
                '**No detecta todas las fugas y no es un seguro** contra daños por agua.',
              ],
            },
          ],
        },
        {
          title: '4. Tu cuenta',
          blocks: [
            {
              items: [
                'Debes ser **mayor de 18 años**.',
                'Registra datos verdaderos y mantenlos al día.',
                'Cuida tu contraseña: eres responsable de lo que se haga con tu cuenta. Si crees que alguien entró sin permiso, cámbiala y escríbenos.',
                'Para recibir SMS o WhatsApp debes verificar un número que sea tuyo o que tengas permiso de usar. Un número solo puede estar en una cuenta.',
                'Puedes eliminar tu cuenta cuando quieras desde Mi perfil → Eliminar cuenta, o como se explica en "Eliminar tu cuenta".',
              ],
            },
          ],
        },
        {
          title: '5. El dispositivo y su instalación',
          blocks: [
            'Al vincular un dispositivo declaras que:',
            {
              items: [
                'eres el **propietario** del inmueble o tienes **autorización del propietario** (por ejemplo, si vives en arriendo);',
                'lo instalarás **después del medidor de la empresa de acueducto**, sin tocar ese medidor ni la acometida. Manipularlos puede traer multas y la suspensión del servicio por parte de la empresa;',
                'en un edificio o conjunto, lo instalarás solo en la tubería de tu unidad, nunca en tuberías comunes;',
                'informarás a las personas que viven o trabajan en el lugar que hay un medidor conectado.',
              ],
            },
            'Sigue la guía de instalación, usa solo el adaptador original y solo agua fría potable. No abras ni modifiques el dispositivo. Recomendamos que lo instale un plomero y usar un protector de voltaje.',
          ],
        },
        {
          title: '6. La válvula a distancia',
          blocks: [
            'Cerrar la válvula corta el agua del lugar: antes de hacerlo, asegúrate de que nadie la esté usando. Las órdenes que das tú, o un colaborador al que le diste ese permiso, se consideran tuyas. Si no hay internet o energía, la orden puede no llegar al dispositivo: no la uses como única medida en una emergencia.',
          ],
        },
        {
          title: '7. Compartir tu lugar',
          blocks: [
            {
              items: [
                'Los **colaboradores** ven y hacen solo lo que les permitas. Puedes cambiar sus permisos o retirarlos cuando quieras.',
                '**Cualquier persona que tenga tu enlace de invitado** puede ver el consumo del lugar mientras esté activo. Compártelo con cuidado y desactívalo cuando no lo necesites.',
                'Compartir es tu decisión. Informa antes a las personas que viven en el lugar.',
              ],
            },
          ],
        },
        {
          title: '8. Uso aceptable',
          blocks: [
            'No está permitido:',
            {
              items: [
                'usar el Servicio para fines ilegales o para vigilar o acosar a otras personas;',
                'intentar entrar a cuentas, dispositivos o datos ajenos, o atacar el Servicio;',
                'usar las invitaciones o los mensajes para enviar publicidad o contenido no deseado;',
                'suplantar a otra persona.',
              ],
            },
            'Si incumples estas reglas podemos suspender o cerrar tu cuenta y te diremos el motivo, salvo que la ley o la seguridad lo impidan.',
          ],
        },
        {
          title: '9. Responsabilidad',
          blocks: [
            'Respondemos conforme a la ley por la calidad del Servicio y del dispositivo (garantía legal), por los daños que cause un defecto del dispositivo y por la seguridad de tus datos. **Estas responsabilidades no las excluimos.**',
            'No respondemos por los daños cuya causa sea, y así se demuestre:',
            {
              items: [
                '**fuerza mayor o caso fortuito:** desastres naturales, rayos, cortes del acueducto u órdenes de autoridad;',
                '**fallas de la red eléctrica:** sobrecargas, variaciones de voltaje o descargas que vengan de la red y no de un defecto del dispositivo o de su adaptador;',
                '**hechos de terceros:** caídas de tu internet, de tu WiFi o de los proveedores de los que dependen las notificaciones, o daños causados por otras personas;',
                '**una instalación que no siguió la guía:** antes del medidor de la empresa, en tuberías comunes o en mal estado;',
                '**el uso indebido del dispositivo:** abrirlo, modificarlo, usar otro adaptador, agua no potable o condiciones fuera de su especificación;',
                '**decisiones del usuario o de sus colaboradores:** abrir o cerrar la válvula, o compartir la contraseña o el enlace de invitado;',
                '**diferencias entre nuestras lecturas y la factura del acueducto**, porque nuestras lecturas son referenciales.',
              ],
            },
            'El Servicio puede tener interrupciones por mantenimiento o fallas; cuando estén programadas, avisaremos con anticipación. Nada de estos Términos te obliga a renunciar a tus derechos ni invierte la carga de la prueba en tu contra.',
          ],
        },
        {
          title: '10. Precio',
          blocks: [
            'Hoy el uso de la app es gratuito. Si en el futuro vendemos el dispositivo o un plan, informaremos el precio antes de la compra, y en las compras a distancia tendrás el derecho de retracto que da la ley. Los cobros de tu operador por datos o mensajes corren por tu cuenta.',
          ],
        },
        {
          title: '11. Propiedad intelectual',
          blocks: [
            'La app, el firmware, la marca y los contenidos son nuestros o tenemos licencia para usarlos. Te damos un permiso personal e intransferible para usarlos mientras tengas tu cuenta. **Tus datos de consumo son tuyos.**',
          ],
        },
        {
          title: '12. Cambios y contacto',
          blocks: [
            'Si cambiamos estos Términos de forma importante, te avisaremos antes por la app o por correo y te pediremos aceptarlos de nuevo cuando la ley lo exija.',
            'Para peticiones, quejas o reclamos escríbenos a {{email}}: respondemos en máximo 15 días hábiles. Si no quedas conforme, puedes acudir a la Superintendencia de Industria y Comercio (Colombia) o a la Defensoría del Pueblo (Ecuador).',
            'Se aplican las leyes del país donde uses el Servicio, y los conflictos se resuelven ante las autoridades de tu domicilio.',
          ],
        },
      ],
    },

    privacy: {
      title: 'Política de Tratamiento de Datos Personales',
      summary: 'Qué datos recogemos, para qué los usamos, con quién los compartimos, cuánto tiempo los guardamos y cómo ejerces tus derechos.',
      sections: [
        {
          title: '1. Responsable',
          blocks: [
            '{{responsible}}, integrantes del proyecto Cuida Tu Agua, con domicilio en {{city}}. Correo para temas de datos personales: {{email}}.',
            'Esta Política cumple la Ley 1581 de 2012 y el Decreto 1377 de 2013 (Colombia), y la Ley Orgánica de Protección de Datos Personales y su Reglamento (Ecuador).',
          ],
        },
        {
          title: '2. Qué datos recogemos',
          blocks: [
            {
              items: [
                '**Identificación y contacto:** nombre, apellido, correo, foto de perfil y celular (opcionales). Si entras con Google, recibimos de Google tu nombre, correo y foto.',
                '**Acceso:** tu contraseña, guardada cifrada de forma que nadie puede leerla, tus sesiones y la fecha en que aceptaste esta Política.',
                '**Lugares:** nombre, dirección, ciudad, tipo de inmueble y la tarifa que registres.',
                '**Consumo:** lecturas del medidor por hora, día y mes, estado e historial de la válvula, conexión del dispositivo y tus metas.',
                '**Compartir:** correos de las personas que invitas, sus permisos y tus enlaces de invitado.',
                '**Notificaciones:** tus preferencias, el identificador del celular para notificaciones push y el historial de alertas.',
                '**Seguridad:** dirección IP, tipo de dispositivo y registros de acceso y de acciones importantes.',
              ],
            },
            '**Tu consumo de agua es un dato personal:** puede revelar horarios, si la casa está vacía o cuántas personas viven en ella. Lo protegemos como tus datos de contacto.',
            '**No recogemos** tu ubicación GPS, tus contactos, el micrófono ni la cámara (solo la galería, si eliges una foto de perfil), datos sensibles ni datos de menores de edad.',
            'La contraseña de tu WiFi se escribe en el portal del dispositivo y **queda guardada solo en él**. No usamos publicidad, cookies de rastreo ni analítica de terceros: solo guardamos en tu equipo tu sesión y tus preferencias.',
          ],
        },
        {
          title: '3. Para qué los usamos',
          blocks: [
            {
              numbered: true,
              items: [
                'Crear y administrar tu cuenta: registro, inicio de sesión, recuperación de contraseña y verificaciones.',
                'Prestar el Servicio: consumo, costo estimado, válvula, metas y consejos.',
                'Enviarte las alertas y notificaciones del Servicio por los medios que elijas.',
                'Compartir tu lugar con quien tú invites, con los permisos que elijas.',
                'Proteger el Servicio: prevenir fraudes, accesos indebidos e incidentes.',
                'Atender tus consultas, reclamos y solicitudes.',
                'Mejorar el Servicio con estadísticas anónimas.',
                'Cumplir la ley y los requerimientos de autoridades competentes.',
              ],
            },
            '**No vendemos tus datos ni los usamos para publicidad.** Para otra finalidad te pediríamos una nueva autorización.',
          ],
        },
        {
          title: '4. Base para tratarlos',
          blocks: [
            {
              items: [
                '**En Colombia,** tu autorización previa, expresa e informada, que das al marcar la casilla del registro.',
                '**En Ecuador,** tu consentimiento, la ejecución del contrato de servicio, nuestro interés legítimo en la seguridad y el cumplimiento de la ley.',
              ],
            },
            'Puedes revocar tu autorización cuando quieras. Como algunos datos son indispensables para el Servicio, revocarla implica cerrar la cuenta.',
          ],
        },
        {
          title: '5. Con quién los compartimos',
          blocks: [
            {
              items: [
                '**Personas que tú autorizas:** tus colaboradores, que ven solo lo que les permitas, y quien tenga tu enlace de invitado, que ve el consumo del lugar.',
                '**Autoridades,** cuando la ley lo exija.',
              ],
            },
            '**Proveedores que nos ayudan a prestar el Servicio**, que solo usan los datos para eso:',
            {
              items: [
                'Google, para el inicio de sesión;',
                'Expo y los servicios de notificaciones de Google y Apple, para las notificaciones push;',
                'Twilio y Meta (WhatsApp), para los SMS y WhatsApp;',
                'nuestros proveedores de correo y servidores.',
              ],
            },
            'Algunos proveedores están en Estados Unidos, país que la Superintendencia de Industria y Comercio considera con nivel adecuado de protección. Les exigimos medidas de seguridad equivalentes a las de esta Política.',
          ],
        },
        {
          title: '6. Cuánto tiempo los guardamos',
          blocks: [
            {
              items: [
                '**Mientras tengas la cuenta activa:** tu cuenta, tus lugares, tu consumo y tus notificaciones.',
                '**Al eliminar la cuenta:** tus datos de identificación se borran o anonimizan de inmediato, y los de consumo, en máximo 30 días.',
                '**Registros de seguridad:** 12 meses.',
                '**Prueba de tu autorización y de tus solicitudes:** hasta 5 años después de cerrar la cuenta, para atender reclamos.',
                '**Estadísticas anónimas:** sin límite, porque no te identifican.',
              ],
            },
          ],
        },
        {
          title: '7. Tus derechos',
          blocks: [
            {
              items: [
                'Conocer, actualizar y corregir tus datos.',
                'Pedir prueba de la autorización que nos diste.',
                'Saber cómo usamos tus datos.',
                'Revocar la autorización o pedir que los eliminemos, salvo que la ley nos obligue a conservarlos.',
                'En Ecuador, además: oponerte, pedir la portabilidad de tus datos y la suspensión del tratamiento. No tomamos decisiones automatizadas sobre ti.',
                'Acceder gratis a tus datos.',
                'Presentar quejas ante la Superintendencia de Industria y Comercio (Colombia) o la Superintendencia de Protección de Datos Personales (Ecuador).',
              ],
            },
            'Muchos de estos derechos los ejerces tú mismo en Mi perfil: editar tus datos, cambiar la contraseña, elegir tus notificaciones y eliminar la cuenta.',
          ],
        },
        {
          title: '8. Cómo hacer una consulta o un reclamo',
          blocks: [
            'Escríbenos a {{email}} con tu nombre, el correo de tu cuenta y lo que pides. Antes de entregar o cambiar datos verificamos que seas el titular.',
            {
              items: [
                '**Consultas:** respondemos en 10 días hábiles, prorrogables 5.',
                '**Reclamos:** respondemos en 15 días hábiles, prorrogables 8.',
                '**En Ecuador:** respondemos en 15 días.',
              ],
            },
            'Si el reclamo está incompleto, te pediremos completarlo en 5 días. Mientras lo resolvemos, lo marcamos como "reclamo en trámite".',
          ],
        },
        {
          title: '9. Seguridad',
          blocks: [
            'Usamos conexión cifrada, contraseñas cifradas, sesiones que vencen, confirmación para cerrar la válvula, permisos por colaborador y registros de actividad.',
            'Ningún sistema es 100 % seguro. Si un incidente pone en riesgo tus datos, lo informaremos a la autoridad en los plazos de ley (15 días hábiles en Colombia y 5 días en Ecuador) y te avisaremos sin demora, con lo que puedes hacer para protegerte.',
          ],
        },
        {
          title: '10. Datos de otras personas',
          blocks: [
            {
              items: [
                'El consumo refleja los hábitos de todos los que viven en el lugar: te comprometes a informarles que hay un medidor conectado y quién ve la información.',
                'Al invitar a alguien nos das su correo: solo lo usamos para enviarle la invitación.',
              ],
            },
          ],
        },
        {
          title: '11. Menores de edad',
          blocks: ['El Servicio es solo para mayores de 18 años. Si detectamos la cuenta de un menor, la eliminaremos.'],
        },
        {
          title: '12. Cambios y vigencia',
          blocks: [
            'Te avisaremos de los cambios importantes antes de aplicarlos y te pediremos una nueva autorización cuando la ley lo exija.',
            'Esta Política rige desde el {{date}}. Las bases de datos estarán vigentes mientras se preste el Servicio y durante los plazos de la sección 6.',
          ],
        },
      ],
    },

    notice: {
      title: 'Aviso de Privacidad',
      summary: 'La versión corta de cómo usamos tus datos.',
      sections: [
        {
          title: 'Responsable',
          blocks: ['{{responsible}}, integrantes del proyecto Cuida Tu Agua, con domicilio en {{city}}, son responsables del tratamiento de tus datos personales.'],
        },
        {
          title: 'Qué datos y para qué',
          blocks: [
            'Usamos:',
            {
              items: [
                'tu nombre y correo;',
                'tu celular, si lo registras;',
                'la dirección de tus lugares;',
                'el consumo de agua que mide tu dispositivo y el estado de la válvula;',
                'datos técnicos de seguridad.',
              ],
            },
            'Los usamos para:',
            {
              items: [
                'prestarte el servicio: ver tu consumo, operar la válvula y enviarte alertas;',
                'compartir tu lugar con quien tú decidas;',
                'proteger tu cuenta;',
                'atender tus solicitudes.',
              ],
            },
            'No vendemos tus datos ni los usamos para publicidad. Algunos proveedores que nos ayudan (Google, Twilio y Meta, Expo y nuestros servidores) los procesan en Estados Unidos, con medidas de protección adecuadas.',
          ],
        },
        {
          title: 'Tus derechos',
          blocks: [
            'Puedes:',
            {
              items: [
                'conocer, actualizar, corregir y eliminar tus datos;',
                'pedir prueba de tu autorización y revocarla;',
                'presentar quejas ante la Superintendencia de Industria y Comercio (Colombia) o la Superintendencia de Protección de Datos Personales (Ecuador).',
              ],
            },
            'Para ejercerlos, escríbenos a {{email}}. La Política de Tratamiento de Datos completa está en esta misma sección de la app.',
          ],
        },
      ],
    },

    deletion: {
      title: 'Eliminar tu cuenta',
      summary: 'Cómo borrar tu cuenta y tus datos, con o sin la app, y qué conservamos.',
      sections: [
        {
          title: 'Desde la app',
          blocks: [
            {
              numbered: true,
              items: ['Inicia sesión.', 'Entra a Mi perfil → Eliminar cuenta.', 'Confirma con tu contraseña o con tu cuenta de Google.'],
            },
            'La eliminación es inmediata.',
          ],
        },
        {
          title: 'Sin la app',
          blocks: [
            'Inicia sesión en la versión web y sigue los mismos pasos.',
            'Si no puedes entrar, escríbenos a {{email}} desde el correo de tu cuenta, con el asunto "Eliminar mi cuenta". Verificamos que seas el titular y la eliminamos en máximo 15 días hábiles.',
          ],
        },
        {
          title: 'Qué se elimina',
          blocks: [
            {
              items: [
                '**Nombre, correo, celular y foto:** se borran o anonimizan de inmediato.',
                '**Sesiones:** se cierran en todos tus equipos.',
                '**Medidores:** se desvinculan y pueden vincularse a otra cuenta.',
                '**Lugares, consumo, metas y notificaciones:** se eliminan o anonimizan en máximo 30 días.',
                '**Accesos compartidos:** se cancelan los que diste a colaboradores e invitados, y pierdes el acceso a los lugares que otros compartieron contigo.',
              ],
            },
          ],
        },
        {
          title: 'Qué conservamos',
          blocks: [
            {
              items: [
                '**Registros de seguridad:** 12 meses.',
                '**Prueba de tu autorización y de tu solicitud:** hasta 5 años.',
                '**Estadísticas anónimas:** no te identifican.',
              ],
            },
            'La eliminación no se puede deshacer.',
          ],
        },
      ],
    },

    device: {
      title: 'Garantía y uso seguro del dispositivo',
      summary: 'Qué cubre la garantía del medidor, cuándo no aplica y cómo instalarlo de forma segura.',
      sections: [
        {
          title: 'Garantía',
          blocks: [
            'El medidor Cuida Tu Agua (módulo electrónico, caudalímetro, electroválvula y adaptador) tiene garantía de 12 meses desde la entrega por defectos de fabricación, de funcionamiento o de calidad.',
            {
              items: [
                'Primero lo reparamos gratis.',
                'Si la falla se repite o no se puede reparar, lo cambiamos o te devolvemos el dinero, a tu elección.',
                'Mientras está en reparación, el tiempo de garantía se suspende.',
              ],
            },
            'Para usarla, escríbenos a {{email}} con el código del dispositivo (SW-…, en la etiqueta y en la app) y la falla.',
          ],
        },
        {
          title: 'Cuándo no aplica',
          blocks: [
            'La garantía no aplica cuando la falla se debe, y así se demuestre, a:',
            {
              items: [
                'fuerza mayor o caso fortuito: rayos, inundaciones o incendios;',
                'sobrecargas o variaciones de voltaje que vengan de la red eléctrica;',
                'daños causados por otras personas;',
                'uso indebido: abrir o modificar el dispositivo, cambiar su firmware, usar otro adaptador, agua no potable, agua caliente o condiciones fuera de especificación;',
                'una instalación que no siguió esta guía.',
              ],
            },
            'La garantía **siempre** aplica si la falla viene de un defecto del propio dispositivo.',
          ],
        },
        {
          title: 'Instalación segura',
          blocks: [
            {
              items: [
                'Instálalo **siempre después del medidor de la empresa de acueducto**, en la tubería interna. Nunca abras, muevas ni conectes nada al medidor de la empresa ni a la acometida.',
                'En edificios o conjuntos, solo en la tubería de tu unidad.',
                'Ten autorización del propietario si no eres el dueño.',
                'Recomendamos que lo instale un plomero.',
                'Respeta la flecha de sentido del flujo.',
                'Deja una llave de paso manual antes del dispositivo y, si puedes, un filtro de sedimentos.',
                'Usa solo agua fría potable y el adaptador original, en un tomacorriente protegido de la humedad.',
                'Recomendamos un protector o regulador de voltaje.',
                'Si tus tuberías son antiguas, pide al plomero que revise si conviene un amortiguador de golpe de ariete.',
              ],
            },
          ],
        },
        {
          title: 'Recuerda',
          blocks: [
            {
              items: [
                'Las lecturas son referenciales y las alertas no son un servicio de emergencia: ante una emergencia, cierra la llave de paso manual.',
                'Informa a quienes viven en el lugar que hay un medidor conectado.',
                'Al final de su vida útil, lleva el dispositivo a un punto de reciclaje de residuos electrónicos o devuélvenoslo.',
              ],
            },
          ],
        },
      ],
    },
  },
};
