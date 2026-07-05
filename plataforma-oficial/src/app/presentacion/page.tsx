'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ChevronDown, ChevronRight, Shield, Lock, Users, Code2, Brain, Database, Menu, X, FileText } from 'lucide-react';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface H3Item {
  title: string;
  body: string;
}

interface H2Section {
  icon: React.ElementType;
  tag: string;
  title: string;
  body: string;
  image?: string;
  h3: H3Item[];
}

interface H1Section {
  number: string;
  tag: string;
  title: string;
  description: string;
  h2sections: H2Section[];
}

// ─────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────
const sections: H1Section[] = [
  {
    number: '01',
    tag: 'INTRODUCCIÓN',
    title: 'El Valor Estratégico del Dato y las Limitaciones de la IA Comercial',
    description: 'Buenos días a todos. Antes de profundizar en metodologías o líneas de código, queremos invitarlos a que abran en las pantallas de sus ordenadores el enlace que les hemos compartido. Lo que están viendo en este momento es RAG Platform, nuestro producto final. No se trata de un simple proyecto de simulación teórica, sino de una plataforma B2B SaaS híbrida real y funcional, diseñada para resolver un desafío crítico en las empresas actuales.\n\nY es que, en el contexto organizacional contemporáneo, los datos y el conocimiento ya no son un simple subproducto operativo; estudios de referencia como los de Mikalef o Côrte-Real demuestran que se han convertido en un activo organizacional central, con una relevancia estratégica idéntica a la de los activos tradicionales para mejorar el desempeño y la competitividad. Sin embargo, el valor real de estos datos no se manifiesta por su mera acumulación, sino por la capacidad de transformarlos en conocimiento accionable. Y aquí es donde las empresas chocan con la realidad, porque la información hoy en día está severamente fragmentada. Por un lado, las organizaciones poseen conocimiento no estructurado y narrativo que se queda cautivo dentro de normativas, manuales y PDFs extensos; y por otro lado, manejan métricas y datos numéricos estructurados en bases de datos relacionales.',
    h2sections: [
      {
        icon: Brain,
        tag: 'PLATAFORMA',
        title: 'Presentación de RAG Platform',
        body: 'Si se fijan en la interfaz de la plataforma que tienen en sus pantallas —y como también se ilustra en el diagrama de flujo del usuario final que estamos proyectando—, nuestro producto ofrece utilidades diseñadas justamente para unificar este ecosistema fragmentado bajo una arquitectura de Inquilino Múltiple o Multi-Tenant. Esto significa que diferentes organizaciones pueden usar la misma infraestructura de software manteniendo sus datos completamente invisibles y aislados entre sí mediante identificadores únicos. Para validar esta versatilidad de forma práctica, pusimos a prueba el sistema con dos perfiles de clientes corporativos que sufren esta fragmentación en su día a día:\n\nPor un lado, piensen en nuestro primer cliente piloto: el Área de Seguros de un Entorno Bancario. Su gran problema es la enorme densidad de sus manuales de cobertura y pólizas. Nuestra plataforma procesa de forma recursiva esos PDFs no estructurados, permitiendo a los gestores comerciales preguntar en lenguaje natural sobre exclusiones o coberturas y recibir respuestas semánticas precisas con citas de origen en tiempo real. Por otro lado, miren a nuestro segundo cliente piloto: un Estudio Contable. Aquí, los profesionales lidian con la alta volatilidad de los boletines fiscales y exigen parámetros numéricos exactos. En este caso, el sistema activa nuestro motor analítico Text-to-SQL, ejecutando consultas rígidas directamente sobre tablas indexadas en formatos CSV o Excel, anulando por completo el riesgo de error numérico al verificar una alícuota o un vencimiento.',
        h3: [],
      },
      {
        icon: Database,
        tag: 'PROPUESTA',
        title: 'Propuesta',
        body: 'Para lograr un producto con este nivel de utilidad empresarial, se estructuró una propuesta concebida fundamentalmente a través del diseño del sistema, que abarca la arquitectura de la solución, los casos de uso corporativos que otorgan contexto al sistema, la gestión multimodal y multilingüe de diversos tipos de archivos y lenguajes, y la lógica del flujo agéntico.',
        image: '/imagenes_tfm/arquitectura_sistema.jpeg',
        h3: [],
      },
      {
        icon: Shield,
        tag: 'SOLUCIÓN',
        title: 'Solución y Limitaciones',
        body: 'Tuvimos que superar las dos grandes limitaciones que impiden usar herramientas comerciales como ChatGPT o Claude en entornos corporativos: los problemas insalvables de privacidad —ya que subir información financiera a servidores de terceros vulnera el secreto comercial— y las peligrosas alucinaciones de los modelos genéricos, que al desconocer el contexto privado de la compañía inventan respuestas que carecen de anclaje con la realidad. Nosotros resolvimos esto ejecutando modelos Open-Source en local, garantizando la soberanía absoluta sobre los datos estratégicos de la empresa.\n\nEn resumen, lo que tienen ante ustedes es una solución híbrida que fusiona la comprensión de documentos mediante RAG y el análisis de bases de datos mediante Text-to-SQL para transformar el conocimiento fragmentado en decisiones inmediatas. Y ahora que ya conocen el producto final, sus utilidades y el impacto directo que genera en el negocio... les expondremos todo lo que hay detrás y cómo se estructuró técnicamente el producto para hacerlo realidad.',
        image: '/imagenes_tfm/tfm_flujo.jpg.jpg',
        h3: [
          {
            title: 'Arquitectura de la solución',
            body: 'Respecto de la arquitectura, esta funciona como un ecosistema de componentes interconectados que priorizan la precisión mediante un flujo de datos estructurado en cuatro etapas principales: (i) recepción y clasificación, (ii) procesamiento de contexto y recuperación, (iii) síntesis y razonamiento, y (iv) entrega de respuesta y trazabilidad.',
          },
          {
            title: 'Estrategias de Ingesta Diferenciadas',
            body: 'Datos No Estructurados: Procesados en Python con PyPDFDirectoryLoader de LangChain. Se aplica un particionado recursivo (RecursiveCharacterTextSplitter) para mantener cohesión semántica. Datos Estructurados (Tablas): Cargados mediante la librería Pandas y openpyxl. El motor se apoya en búsquedas léxicas precisas y comandos de filtrado deterministas para evitar la desviación probabilística del LLM.',
          },
          {
            title: 'Orquestación del Backend',
            body: 'Desarrollado sobre la clase núcleo BaseModel utilizando FastAPI (asincronía nativa para operaciones no bloqueantes) y Uvicorn como servidor ASGI. La modularidad permite intercambiar el LLM subyacente entre APIs en la nube (langchain-google-genai) y entornos locales de inferencia con Ollama (Llama-3 / Phi-3).',
          },
          {
            title: 'Mitigación Activa de Alucinaciones',
            body: 'Se implementó un enrutador inteligente de intenciones (Intent Router) mediante ingeniería de prompts estricta en el orquestador. Las búsquedas vectoriales imponen un filtro de confianza con un umbral de similitud semántica (score < 0.85); si no se alcanza, el agente intercepta el flujo y commuta a un protocolo de respaldo explícito ([USAR_TABLA]) para comprobar repositorios tabulares relacionales.',
          },
          {
            title: 'Frontend y Entrega',
            body: 'Construido en Next.js 15 (App Router) aprovechando React Server Components y la renderización en el servidor con streaming (Streaming SSR) vía Server-Sent Events (SSE) para renderizar la respuesta progresivamente (token a token). Autenticación y RBAC (control de accesos basado en roles) delegados en Clerk. Despliegue cloud ejecutado en Vercel acoplado a túneles seguros con Ngrok durante la fase operativa local.',
          }
        ],
      },
    ],
  },
  {
    number: '02',
    tag: 'INGENIERÍA',
    title: 'Ingeniería de Datos EMBEDDINGS: Ingesta, Chunking y Bases de Datos Vectoriales',
    description: 'El conocimiento de la IA no es mágico; requiere un pipeline de Ingesta de Datos (Data Ingestion Pipeline) sumamente robusto. La solución técnica se despliega mediante una infraestructura desacoplada y robusta en el backend, implementando una arquitectura asíncrona de alto rendimiento utilizando FastAPI y Uvicorn, orquestada mediante el ecosistema LangChain.',
    h2sections: [
      {
        icon: FileText,
        tag: 'CHUNKING',
        title: 'Parseo y Fragmentación (Chunking)',
        body: 'Aquí entraría también el sistema de roles. Los usuarios con rol de “Admin”, tienen la opción de acceder a la pestaña de “Documentación” y subir los archivos de alta complejidad, como podrían ser los diccionarios de datos de Excel del modelo. El backend no puede enviar ese excel entero al LLM, por lo que se aplica un script de ETL, y lo formateamos en estructuras JSON para que puedan ser legibles.\n\nDado que los LLMs tienen una ventana de contexto limitada, aplicamos un proceso de chunking, para dividir la gran cantidad de texto del que dispone el modelo, en pequeños bloques de información que mantienen el contexto original.',
        h3: [
          {
            title: 'Administración y gestión del documento',
            body: 'El usuario "Admin" accede a nuestra pestaña de Documentación y sube archivos de alta complejidad (por ejemplo, los diccionarios de datos Excel del modelo de Seguros y Contable). El backend no puede enviar un Excel entero a un LLM. Por tanto, aplicamos un script ETL que extrae el texto de estos documentos y lo formatea en estructuras JSON legibles. Dado que los LLMs tienen una "ventana de contexto" limitada, aplicamos un proceso de Chunking (fragmentación semántica). Dividimos los textos masivos en pequeños bloques de información que mantienen el contexto original.',
          }
        ],
      },
      {
        icon: Code2,
        tag: 'EMBEDDINGS',
        title: 'Generación de Embeddings y Modelos Agnósticos',
        body: 'Aquí es donde entra nuestro modelo de embeddings. Cabe destacar la elección de este modelo de embedding, es el resultado de un estudio comparativo previo entre diversas alternativas, seleccionando así la opción que mejor balanceaba precisión de recuperación, y tiempos de ejecución entre otras cosas.\n\nUna vez fragmentados, los textos deben ser comprensibles para la máquina. Aquí radica una de las mayores fortalezas del sistema: su adaptabilidad polimórfica y agnosticismo de proveedor. Lo que va a realizar es la transformación del texto en un vector matemático de 768 dimensiones, el cual actuará como una representación matemática del significado semántico del texto, de manera que fragmentos con un contenido similar quedan situados próximos entre sí en el espacio vectorial. Gracias a ello, durante la búsqueda será posible recuperar los fragmentos más relevantes para la consulta del usuario, proporcionando al LLM el contexto adecuado para generar respuestas más precisas y fundamentadas.\n\nEn otras palabras, el modelo no almacena las palabras tal y como fueron escritas, sino que las representa mediante coordenadas en un espacio matemático donde textos con significados similares quedan cerca unos de otros. Esto permite localizar información relevante aunque la consulta utilice palabras diferentes a las del documento original.',
        h3: [
          {
            title: 'Conmutación Dinámica de Modelos',
            body: 'El sistema permite la conmutación dinámica entre modelos de lenguaje comerciales en la nube (como Google Gemini 2.0 Flash) para razonamiento general, y modelos locales de código abierto (como Llama 3 o Phi-3) a través de Ollama. El modelo local lee el texto y lo transforma en un vector matemático de 768 dimensiones.',
          }
        ],
      },
      {
        icon: Database,
        tag: 'ALMACENAMIENTO',
        title: 'Almacenamiento Vectorial Local (Chroma) y Base Relacional (Supabase)',
        body: 'La presencia y recuperación de esta información, combina un enfoque híbrido. Por un lado, usamos una base de datos relacional en Supabase, donde disponemos de los usuarios, roles, etc. Y por otro lado, el almacenamiento de vectores comentados previamente, de forma local en disco mediante Chroma, así lo que hacemos es acortar el tiempo de respuesta de nuestra IA.',
        image: '/imagenes_tfm/diagrama_embeddings.jpg',
        h3: [
          {
            title: 'Persistencia Híbrida Vectorial y Relacional',
            body: 'La persistencia y recuperación de la información combina un enfoque híbrido. Por un lado, utilizamos una base de datos relacional robusta en Supabase (PostgreSQL con la extensión pgvector) para la gestión de usuarios, perfiles, auditoría y seguridad. Por otro lado, el almacenamiento de los vectores (embeddings) de los documentos corporativos se realiza de forma local y embebida en disco mediante Chroma. Esta base de datos vectorial local está estructurada de forma estanca por cada tenant. Cuando el usuario hace una pregunta, la búsqueda semántica (Cosine Similarity Search) se ejecuta en Chroma, recuperando exclusivamente los chunks de su organización sin exponer el conocimiento a bases de datos públicas.',
          }
        ],
      }
    ],
  },
  {
    number: '03',
    tag: 'LLM',
    title: 'Modelo de LLM',
    description: '¿Qué sucede una vez que hemos transformado, almacenado y recuperado la información? Aquí es donde entra en juego nuestra "Clase Madre", el verdadero núcleo de toma de decisiones del agente.',
    h2sections: [
      {
        icon: Brain,
        tag: 'ORQUESTADOR',
        title: 'El Cerebro del Sistema: El Orquestador LLM y Arquitectura Agnóstica',
        body: 'Una de las mayores fortalezas es que el backend detecta dinámicamente el entorno y está preparado para alternar entre consultas de datos en la nube o despliegues locales mediante Ollama, garantizando así la privacidad total de los datos si el cliente lo requiere.',
        h3: [
          {
            title: 'Personalización Dinámica (Manifiesto JSON)',
            body: 'Además, el comportamiento se personaliza dinámicamente gracias a un "manifiesto" JSON que le inyecta sus instrucciones de sistema.',
          },
          {
            title: 'Prevención de Alucinaciones y Umbral de Confianza',
            body: 'Para asegurar la fiabilidad en entornos corporativos y evitar alucinaciones, hemos configurado las instancias del modelo con una "temperatura cero", lo que lo obliga a ser estrictamente determinista. Aquí es donde se ligaría con el modelo de embeddings y donde el motor se encargará de detectar las distancias vectoriales para evitar así respuestas sacadas de documentos irrelevantes con la pregunta del usuario.',
          }
        ],
      },
      {
        icon: Code2,
        tag: 'ENRUTAMIENTO',
        title: 'Enrutamiento de Intenciones y Herramientas Dinámicas (Tooling)',
        body: 'Pero, ¿qué ocurre si el usuario pide un dato estructurado exacto, como el saldo o el identificador de un cliente? Sabemos que la búsqueda vectorial es increíble para semántica, pero no es buena para buscar un dato exacto en una BDD.\n\nPara no entrar mucho en detalle ya que a continuación mi compañera explicará cómo hemos implementado esto, gracias a un “Intent Router”, el modelo evaluará si la respuesta que se requiere, es proveniente de los documentos, por lo que dará una respuesta que pueda encontrar en ellos, o si tiene que buscar en las tablas.',
        h3: [
          {
            title: 'Generación Final y Experiencia de Usuario (Streaming)',
            body: 'Finalmente, una vez que el agente cuenta con el contexto adecuado y validado procedente de los fragmentos recuperados, redacta la respuesta definitiva.',
          }
        ],
      }
    ],
  },
  {
    number: '04',
    tag: 'NÚCLEO',
    title: 'El Núcleo Computacional: El Patrón "Intent Router"',
    description: 'Una vez que les hemos explicado el proceso de selección del modelo de LLM y lo que implica, es el momento de analizar el verdadero motor del proyecto: el núcleo computacional gobernado por la clase BaseModel.',
    h2sections: [
      {
        icon: Code2,
        tag: 'INTENT ROUTER',
        title: 'El Discurso de la Diapositiva',
        body: 'Cuando un usuario interactúa con un asistente inteligente y escribe una consulta en texto plano, surge un desafío de arquitectura crítico. Si el usuario pregunta algo como: "Dime las coberturas de esta póliza", el sistema debe buscar en textos no estructurados. Pero si pregunta: "¿Cuáles fueron las ventas o alícuotas del mes pasado?", la respuesta está en una base de datos tabular. El sistema no sabe a priori qué estructura consultar. La solución tradicional en la industria suele ser el "RAG ciego", es decir, lanzar la pregunta contra todos los repositorios a la vez. Esto es un error en entornos corporativos porque satura la memoria, dispara el consumo y coste de tokens, aumenta la latencia e incrementa exponencialmente el riesgo de alucinación.\n\nPara solucionar esto, aplicamos principios de ingeniería de software SOLID. Refactorizamos por completo el backend para construir un subsistema modular que llamamos Intent Router o Enrutador Inteligente de Consultas. Como pueden observar en el diagrama de ramificación abstracta del código que estamos proyectando, cuando entra una petición, el sistema la clasifica algorítmicamente en tiempo real mediante lógica booleana estricta y decide, antes de tocar la base de datos, cuál es la estrategia de resolución óptima.\n\nDependiendo de esta clasificación, el router deriva el flujo de ejecución e invoca de manera aislada a un componente especializado que hereda de una clase abstracta común: Si la intención es puramente narrativa, se activa el VectorStoreHandler; si exige datos numéricos, se delega en el TablasHandler; y si es una pregunta abierta, se enruta al DirectoHandler o InternetHandler. Lo valioso de esta arquitectura no es solo el ahorro computacional, sino que el flujo de ejecución queda completamente aislado.',
        image: '/imagenes_tfm/baseLLM.jpg',
        h3: [
          {
            title: 'Detalle de la Refactorización (SOLID)',
            body: 'El código original residía en un módulo monolítico denominado BaseModelLLM/base_llm.py. Se aplicó rigurosamente el Principio de Responsabilidad Única (SRP) y el Principio de Abierto/Cerrado (OCP). Se definió una interfaz abstracta para los Handlers, permitiendo que el sistema sea extensible a nuevos pipelines (como bases de datos de grafos en el futuro) simplemente añadiendo una clase, sin modificar el código del enrutador central.',
          },
          {
            title: 'Mecanismo de Clasificación (Intent Router)',
            body: 'No se utiliza un clasificador probabilístico simple o un modelo de Machine Learning tradicional que añada latencia. El enrutamiento se ejecuta mediante un prompt del sistema altamente optimizado inyectado en el LLM orquestador (langchain), estructurado con JSON Schema estructurado (PydanticOutputParser). El modelo es forzado a devolver un objeto JSON estricto con la clave intent (RAG, TABLA, DIRECTO, INTERNET). Si el JSON es inválido, un bloque try-except captura el error y activa la ruta de contingencia de forma segura.',
          },
          {
            title: 'Intercambio Dinámico de Contexto',
            body: 'El Intent Router actúa en la capa del backend asíncrono (async/await en FastAPI). Al recibir la petición, encapsula los metadatos del usuario, incluyendo el org_id y el historial de chat comprimido (ConversationBufferWindowMemory), pasándolos como argumentos al handler seleccionado para evitar la pérdida de memoria de la sesión durante la conmutación de rutas.',
          },
          {
            title: 'Flujo Logístico y Manejo de Errores en Handlers',
            body: 'Cada Handler implementa su propio bloque de manejo de excepciones. Por ejemplo, si el TablasHandler falla al parsear una consulta con Pandas debido a un formato inesperado en el archivo .csv, levanta una excepción controlada que es capturada por el orquestador principal, evitando un error 500 Internal Server Error en el frontend y ofreciendo una respuesta de degradación elegante (graceful degradation) al usuario.',
          }
        ],
      }
    ],
  },
  {
    number: '05',
    tag: 'SEGURIDAD',
    title: 'Arquitectura Base y Seguridad: Multi-Tenancy y RBAC',
    description: 'Para asegurar que esta plataforma sea un producto B2B verdaderamente viable y seguro en el mundo real, tuvimos que construir un entorno donde cada empresa opera en un espacio totalmente hermético, garantizando así la privacidad de sus datos y un funcionamiento constante sin costes desorbitados de servidores. A continuación, veremos las dos claves de este logro: cómo protegemos la información corporativa y cómo estructuramos nuestra red de forma inteligente.',
    h2sections: [
      {
        icon: Shield,
        tag: 'AISLAMIENTO',
        title: 'Seguridad y Aislamiento de la Información Corporativa',
        body: 'Para que esta plataforma sea un producto empresarial viable, el primer pilar es la seguridad absoluta. En el mundo de los negocios, un cliente jamás debe tener acceso a los documentos o datos de otro cliente. A esto lo llamamos un entorno aislado. Además de proteger los datos entre diferentes empresas, nuestro sistema controla estrictamente quién entra y qué puede hacer cada empleado dentro de su propia organización. Si un empleado no tiene los permisos suficientes, la plataforma simplemente se adapta y oculta botones u opciones críticas, asegurando que un usuario básico pueda consultar la Inteligencia Artificial, pero nunca borrar información estratégica.',
        image: '/imagenes_tfm/aislamiento_multi_tenant.png',
        h3: [
          {
            title: 'Gestión de Identidad en el Edge (Clerk)',
            body: 'Hemos integrado Clerk como solución de autenticación moderna compatible con arquitecturas Edge, evaluando el acceso en el middleware de Next.js antes de renderizar la página y ofreciendo flujos de acceso avanzados (Email y credenciales clásicas).',
          },
          {
            title: 'Control de Acceso Basado en Roles (RBAC) y Sincronización',
            body: 'Clerk emite un Token JWT con un publicMetadata que contiene el orgId (identificador de la empresa) y el role (admin, editor, viewer). Un hook especializado en React (AuthContext.tsx) captura este JWT en el inicio de sesión y sincroniza el perfil mediante una operación upsert en la tabla relacional user_profiles de Supabase.',
          },
          {
            title: 'Aislamiento Físico de Datos (Row Level Security - RLS)',
            body: 'Para garantizar el Multi-Tenancy a nivel de infraestructura profunda, implementamos políticas de seguridad a nivel de fila (RLS) nativas de PostgreSQL en Supabase. Al inyectar dinámicamente el orgId en cada consulta, la base de datos rechaza a nivel criptográfico cualquier lectura o escritura de registros que no pertenezcan a la organización del usuario, neutralizando el riesgo de "Cross-Tenant Data Leakage".',
          },
          {
            title: 'Prevención de Fugas en la Capa Visual',
            body: 'La arquitectura de roles condiciona completamente el DOM de Next.js. A los perfiles con rol viewer, el servidor les re-renderiza la interfaz bloqueando dinámicamente el acceso a funcionalidades de manipulación de archivos y diccionarios corporativos, creando una degradación elegante del sistema.',
          }
        ],
      },
      {
        icon: Lock,
        tag: 'DESPLIEGUE',
        title: 'Despliegue Híbrido: Privacidad Absoluta y Ahorro de Costes',
        body: 'El segundo gran reto operativo fue la conectividad. Alquilar potentes ordenadores en la nube para alojar y hacer funcionar nuestro cerebro de Inteligencia Artificial hubiera disparado los costes a cientos de euros mensuales, haciendo el proyecto inviable. Por ello, diseñamos una arquitectura "híbrida": la interfaz gráfica y la aplicación web que usan los clientes están alojadas en la nube, pero todo el núcleo de razonamiento de la Inteligencia Artificial se ejecuta directamente en los servidores locales físicos de la empresa. Gracias a esto, no pagamos por servidores en la nube, las respuestas son instantáneas y la empresa mantiene el control 100% sobre sus propios datos sin depender de terceros.',
        image: '/imagenes_tfm/arquitectura_hibrida.png',
        h3: [
          {
            title: 'Túnel Reverso para Bypassing NAT',
            body: 'Al ejecutar el frontend en Vercel (Cloud) y el backend en FastAPI local (On-Premise), la red Serverless de Vercel arrojaba errores 503/404 por culpa de los cortafuegos y el NAT local. Implementamos un túnel reverso persistente y seguro mediante Pinggy / Ngrok, inyectando un dominio estático (PYTHON_BACKEND_URL) en las variables de entorno de Vercel.',
          },
          {
            title: 'Resolución del Hydration Mismatch en Next.js',
            body: 'A nivel de interfaz, el nuevo App Router de Next.js generó conflictos de hidratación porque el servidor (Vercel) pre-renderizaba la barra lateral sin la sesión autenticada, mientras el cliente (navegador) tenía la cookie de Clerk activa. Unificamos el manejo de estado asíncrono en el RootLayout para lograr una hidratación síncrona sin colapsos visuales.',
          },
          {
            title: 'Configuración de Red y Timeouts Serverless',
            body: 'Debido a que el LLM genera respuestas en streaming (SSE) y a veces tiene alta latencia de inferencia en hardware local, el ruteo asíncrono requirió un rediseño manual en el archivo vercel.json para extender la tolerancia de red de larga duración en la capa de Vercel y evitar cortes de conexión abruptos.',
          }
        ],
      }
    ],
  },
  {
    number: '06',
    tag: 'CONCLUSIONES',
    title: 'Conclusiones y Logros',
    description: 'Para cerrar nuestra exposición, queremos conectar este recorrido técnico con la visión estratégica del proyecto. Este Trabajo de Fin de Máster ha culminado en el desarrollo de una solución productiva real que trasciende por completo el concepto básico de un "chatbot" corporativo. Lo que hemos diseñado, validado y desplegado es una verdadera Arquitectura Empresarial e integral para la gestión de activos intangibles.',
    h2sections: [
      {
        icon: Users,
        tag: 'LOGROS',
        title: 'Logros Alcanzados',
        body: 'Si tuviéramos que resumir los grandes hitos que validan nuestras hipótesis iniciales, destacaríamos cuatro pilares fundamentales:\n\n• Primero, garantizamos un aislamiento absoluto de datos por cliente mediante un modelo multi-tenant nativo, demostrando que es posible escalar horizontalmente e incorporar nuevas organizaciones sin alterar el código núcleo.\n• Segundo, consolidamos un motor de IA híbrido sumamente robusto, capaz de combinar comprensión semántica (RAG) con rigor matemático estructurado (Text-to-SQL).\n• Tercero, implementamos un despliegue de red asimétrico Nube-Local, reduciendo los costes operativos a cero usando hardware propio y blindando la privacidad al 100%.\n• Y cuarto, establecemos una gobernanza de roles estricta directamente en la capa de datos (PostgreSQL), asegurando trazabilidad y auditoría.',
        image: '/imagenes_tfm/logros.png',
        h3: [],
      }
    ],
  },
  {
    number: '07',
    tag: 'FUTURO',
    title: 'Trabajo Futuro',
    description: 'Sin embargo, el verdadero valor de este desarrollo es que no representa un punto final. Gracias a la flexibilidad de nuestra arquitectura, el sistema está perfectamente preparado para evolucionar hacia las dos grandes macro-tendencias de la industria tecnológica actual.',
    h2sections: [
      {
        icon: Brain,
        tag: 'AGENTIC AI',
        title: 'Evolución a Modelos de Agentes Autónomos (Agentic AI)',
        body: 'La primera línea futura es transformar la IA de un sistema "consultivo" a un sistema "ejecutivo". El objetivo es que nuestro enrutador no se limite a leer datos, sino que adquiera capacidades de acción (operaciones de escritura). Esto permitirá a la IA rellenar formularios, agendar reuniones o redactar y emitir correos electrónicos corporativos de forma totalmente autónoma.',
        h3: [],
      },
      {
        icon: Code2,
        tag: 'FINE-TUNING',
        title: 'Fine-Tuning Especializado de Modelos Abiertos',
        body: 'La segunda línea es el entrenamiento especializado (Fine-Tuning). El siguiente paso lógico es entrenar modelos locales más eficientes (Llama o Mistral) inyectándoles directamente la jerga contable y los diccionarios técnicos de los clientes. Esto optimizará el rendimiento en hardware local, reduciendo drásticamente los tiempos de respuesta y eliminando cualquier dependencia de proveedores de IA externos.\n\nCon esto demostramos que "RAG Platform" no es solo una solución para los problemas de hoy, sino una infraestructura escalable, segura y preparada para el futuro de la inteligencia artificial empresarial. Quedamos a su entera disposición para sus preguntas. Muchas gracias.',
        h3: [],
      },
      {
        icon: Database,
        tag: 'TÉCNICO',
        title: 'Detalles Técnicos del Trabajo Futuro (Backup)',
        body: 'A continuación se exponen los detalles técnicos y metodológicos que respaldan las líneas de evolución propuestas para el sistema.',
        h3: [
          {
            title: 'Mecanismos de Extensión Agéntica (LangGraph / Tool Calling)',
            body: 'La evolución hacia Agentic AI se plantea sustituyendo la lógica secuencial actual por grafos de conocimiento utilizando librerías como LangGraph o la API de Tool Calling nativa de LangChain. Al mapear funciones de Python como herramientas específicas (ej. API de Microsoft Graph o pasarelas SQL con permisos de escritura), el LLM puede secuenciar llamadas, evaluar si la ejecución fue exitosa y auto-corregirse en caso de error.',
          },
          {
            title: 'Técnicas de Fine-Tuning Local (QLoRA / Unsloth)',
            body: 'Se plantea un flujo de entrenamiento utilizando QLoRA para reducir exigencias de memoria de video (VRAM) en GPUs corporativas, procesado mediante frameworks como Unsloth o Hugging Face TRL. Los pesos adaptativos se entrenarán con datasets sintéticos extraídos de nuestras trazas (evaluaciones_pendientes.json).',
          },
          {
            title: 'Soberanía y Seguridad en Operaciones CRUD',
            body: 'Otorgar permisos de escritura introduce riesgos de inyección. El respaldo se basará en flujos de validación humana (Human-in-the-loop) para confirmación de transacciones (commit) y sanitización estricta de variables con Pydantic.',
          },
          {
            title: 'Persistencia en Producción',
            body: 'La persistencia de memoria en FastAPI se migrará a un clúster de Redis para evitar sobrecarga de RAM ante picos masivos de múltiples inquilinos.',
          }
        ]
      }
    ]
  }
];

// ─────────────────────────────────────────────
// Lightbox
// ─────────────────────────────────────────────
function Lightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.92)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24, cursor: 'zoom-out',
        }}
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          onClick={e => e.stopPropagation()}
          style={{ position: 'relative', maxWidth: '95vw', maxHeight: '90vh', borderRadius: 16, overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.6)' }}
        >
          <img src={src} alt={alt} style={{ display: 'block', maxWidth: '95vw', maxHeight: '90vh', width: 'auto', height: 'auto', objectFit: 'contain' }} />
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 12, right: 12,
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 700, lineHeight: 1,
            }}
          >
            ×
          </button>
          <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.5)', borderRadius: 6, padding: '4px 12px', fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
            {alt} · ESC para cerrar
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────
// H2 Image with Lightbox
// ─────────────────────────────────────────────
function H2Image({ src, alt }: { src: string; alt: string }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{ marginBottom: 36, position: 'relative' }}
      >
        {/* Thumbnail container */}
        <div
          onClick={() => setLightboxOpen(true)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            borderRadius: 14,
            overflow: 'hidden',
            border: `1px solid ${hovered ? 'var(--accent)' : 'var(--border-primary)'}`,
            background: 'var(--bg-secondary)',
            cursor: 'zoom-in',
            position: 'relative',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            boxShadow: hovered ? '0 8px 32px rgba(59,130,246,0.18)' : '0 2px 12px rgba(0,0,0,0.08)',
          }}
        >
          <img
            src={src}
            alt={alt}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              borderRadius: 13,
              transform: hovered ? 'scale(1.015)' : 'scale(1)',
              transition: 'transform 0.3s ease',
            }}
          />
          {/* Hover overlay */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 13,
            background: 'rgba(59,130,246,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.2s',
            pointerEvents: 'none',
          }}>
            <div style={{
              background: 'rgba(59,130,246,0.9)', borderRadius: 10, padding: '8px 16px',
              display: 'flex', alignItems: 'center', gap: 8,
              color: '#fff', fontSize: 13, fontWeight: 600,
              boxShadow: '0 4px 16px rgba(59,130,246,0.4)',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
              </svg>
              Click para ampliar
            </div>
          </div>
        </div>

        {/* Caption */}
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-tertiary)', marginTop: 8, fontStyle: 'italic' }}>
          {alt} — haz click para ver a pantalla completa
        </p>
      </motion.div>

      {/* Lightbox portal */}
      {lightboxOpen && <Lightbox src={src} alt={alt} onClose={() => setLightboxOpen(false)} />}
    </>
  );
}

// ─────────────────────────────────────────────
// H3 Accordion
// ─────────────────────────────────────────────
function H3Accordion({ item, refNum, parentTag }: { item: H3Item; refNum: string; parentTag: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderLeft: '2px solid var(--accent)', marginTop: 8, borderRadius: '0 8px 8px 0', overflow: 'hidden', background: 'rgba(59,130,246,0.04)' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 12 }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Code2 size={13} />
          <span style={{ opacity: 0.6, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{refNum}</span>
          <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(59,130,246,0.1)', color: 'var(--accent)', textTransform: 'uppercase' }}>{parentTag}</span>
          {item.title}
        </span>
        <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronRight size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="body" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: 'easeInOut' }} style={{ overflow: 'hidden' }}>
            <p style={{ padding: '0 16px 14px', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8, textAlign: 'justify' }}>{item.body}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────
// H1 Slide
// ─────────────────────────────────────────────
function H1Slide({ data, sectionNum }: { data: H1Section; sectionNum: number }) {
  const refLabel = `${sectionNum}`;
  return (
    <section style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', padding: '100px 0 60px', background: 'var(--bg-secondary)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', right: -20, top: '50%', transform: 'translateY(-50%)', fontSize: 'clamp(140px, 22vw, 300px)', fontWeight: 900, color: 'var(--border-primary)', lineHeight: 1, userSelect: 'none', pointerEvents: 'none', opacity: 0.35 }}>
        {data.number}
      </div>
      <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: 860, margin: '0 auto' }}>
        {/* Reference number */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: 'var(--accent)', background: 'var(--accent-light)', padding: '2px 10px', borderRadius: 6, letterSpacing: '0.05em' }}>
            § {refLabel}
          </span>
          <motion.div initial={{ opacity: 0, y: -10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', borderRadius: 100, background: 'var(--accent-light)', fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
            {data.tag}
          </motion.div>
        </div>
        <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
          style={{ fontSize: 'clamp(32px, 4.5vw, 58px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 28 }}>
          {data.title}
        </motion.h2>
        <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
          style={{ fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.85, textAlign: 'justify' }}>
          {data.description}
        </motion.p>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// H2 Slide
// ─────────────────────────────────────────────
function H2Slide({ data, sectionNum, h2Num, index, parentTag }: { data: H2Section; sectionNum: number; h2Num: number; index: number; parentTag: string }) {
  const Icon = data.icon;
  const refLabel = `${sectionNum}.${h2Num}`;
  const paragraphs = data.body.split('\n\n');

  return (
    <section id={`h2-${sectionNum}-${h2Num}`} style={{ padding: '80px 0', borderTop: '1px solid var(--border-primary)' }}>
      <div className="container" style={{ maxWidth: 860, margin: '0 auto' }}>
        {/* Reference + tag row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: 'var(--text-tertiary)', background: 'var(--bg-secondary)', padding: '2px 9px', borderRadius: 6, border: '1px solid var(--border-primary)', letterSpacing: '0.05em' }}>
            § {refLabel}
          </span>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', background: 'var(--border-primary)', padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {parentTag}
          </span>
          <ChevronRight size={14} style={{ color: 'var(--text-tertiary)' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{data.tag}</span>
        </div>

        {/* H2 Header */}
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
          style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 4 }}>
            <Icon size={24} style={{ color: 'var(--accent)' }} />
          </div>
          <h3 style={{ fontSize: 'clamp(22px, 3vw, 34px)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2 }}>{data.title}</h3>
        </motion.div>

        {/* H2 Body */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.15 }}
          style={{ marginBottom: 36 }}>
          {paragraphs.map((p, i) => (
            <p key={i} style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.85, textAlign: 'justify', marginBottom: i < paragraphs.length - 1 ? 16 : 0 }}>
              {p}
            </p>
          ))}
        </motion.div>

        {/* H2 Image */}
        {data.image && <H2Image src={data.image} alt={data.title} />}

        {/* H3 expandables */}
        {data.h3.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.25 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
              Detalle Técnico
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {data.h3.map((h3, i) => (
                <H3Accordion key={i} item={h3} refNum={`${refLabel}.${i + 1}`} parentTag={parentTag} />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Left Drawer Navigation
// ─────────────────────────────────────────────
function LeftDrawerNav({ sections }: { sections: H1Section[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed', left: 20, top: 100, zIndex: 60,
          width: 48, height: 48, borderRadius: '50%',
          background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'var(--text-primary)'
        }}
      >
        <Menu size={24} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 90, backdropFilter: 'blur(2px)' }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed', top: 0, left: 0, bottom: 0, width: 340, maxWidth: '85vw',
              background: 'var(--bg-primary)', borderRight: '1px solid var(--border-primary)',
              zIndex: 100, display: 'flex', flexDirection: 'column', overflow: 'hidden',
              boxShadow: '20px 0 40px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={16} style={{ color: 'var(--accent)' }}/> ÍNDICE DE PRESENTACIÓN
              </span>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px' }}>
              {sections.map((sec, sIdx) => (
                <div key={sIdx} style={{ marginBottom: 28 }}>
                  <div 
                    onClick={() => {
                      document.querySelectorAll('[data-section]')[sIdx]?.scrollIntoView({ behavior: 'smooth' });
                      setOpen(false);
                    }}
                    style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16, cursor: 'pointer', display: 'flex', gap: 10, lineHeight: 1.3 }}
                  >
                    <span style={{ color: 'var(--accent)' }}>{sIdx + 1}.</span> {sec.title}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingLeft: 18, borderLeft: '2px solid var(--border-primary)' }}>
                    {sec.h2sections.map((h2, h2Idx) => (
                      <div
                        key={h2Idx}
                        onClick={() => {
                          const el = document.getElementById(`h2-${sIdx + 1}-${h2Idx + 1}`);
                          if (el) { el.scrollIntoView({ behavior: 'smooth' }); setOpen(false); }
                        }}
                        style={{ fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer', lineHeight: 1.4, display: 'flex', gap: 10, padding: '4px 0' }}
                      >
                         <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', marginTop: 2 }}>{sIdx + 1}.{h2Idx + 1}</span>
                         <span style={{ flex: 1 }}>{h2.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────
export default function PresentacionPage() {
  return (
    <>
      <Header />
      <div className="mesh-gradient" />
      <LeftDrawerNav sections={sections} />

      {/* Hero */}
      <section style={{ paddingTop: 'calc(var(--header-height) + 80px)', paddingBottom: 80, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div className="container" style={{ maxWidth: 900, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 18px', borderRadius: 100, background: 'var(--accent-light)', fontSize: 12, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 28 }}>
            TFM — UPF Barcelona School of Management · 2026
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            style={{ fontSize: 'clamp(36px, 5.5vw, 72px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: 24 }}>
            Gestión del Conocimiento Organizacional mediante{' '}
            <span style={{ background: 'var(--gradient-accent)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              IA Generativa
            </span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.7 }}>
            Juan Ignacio Botindari Rugnone · Marcel Portaz Blay · Isabella Rebolledo Domínguez
          </motion.p>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 1.5s infinite' }} />
            Desplázate para recorrer la presentación
          </motion.p>
        </div>
      </section>

      {/* Sections */}
      {sections.map((section, sIdx) => (
        <div key={sIdx} data-section={sIdx}>
          <H1Slide data={section} sectionNum={sIdx + 1} />
          {section.h2sections.map((h2, h2Idx) => (
            <H2Slide key={h2Idx} data={h2} sectionNum={sIdx + 1} h2Num={h2Idx + 1} index={h2Idx} parentTag={section.tag} />
          ))}
        </div>
      ))}

      <Footer />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
      `}</style>
    </>
  );
}
