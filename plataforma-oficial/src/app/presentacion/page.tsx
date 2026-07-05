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
  body: React.ReactNode;
}

interface H2Section {
  icon: React.ElementType;
  tag: string;
  title: string;
  body: React.ReactNode;
  image?: string;
  h3: H3Item[];
}

interface H1Section {
  number: string;
  tag: string;
  title: string;
  description: React.ReactNode;
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
    description: (
          <>
            <p style={{ marginBottom: '12px' }}>
              Los datos y el conocimiento ya no son un simple subproducto operativo; se han convertido en un <b>activo organizacional central</b>.
            </p>
            <p style={{ marginBottom: '12px' }}>
              El valor real de estos datos no se manifiesta por su mera acumulación, sino por la capacidad de transformarlos en <i>conocimiento accionable</i>.
            </p>
            <p style={{ marginBottom: '8px' }}>
              Surge un desafío de cara a la fragmentación de la información. Las organizaciones poseen:
            </p>
            <ul style={{ listStyleType: 'disc', paddingLeft: '20px', margin: '0' }}>
              <li style={{ marginBottom: '6px' }}>
                <b>Conocimiento no estructurado y narrativo:</b> que se queda cautivo dentro de normativas, manuales y PDFs extensos.
              </li>
              <li style={{ marginBottom: '6px' }}>
                <b>Métricas y datos numéricos estructurados:</b> en bases de datos relacionales.
              </li>
            </ul>
          </>
        ),
    h2sections: [
      {
        icon: Brain,
        tag: 'PLATAFORMA',
        title: 'RAG Platform',
        body: (
                      <>
                        <p style={{ marginBottom: '12px' }}>
                          Plataforma que ofrece utilidades diseñadas para unificar el ecosistema fragmentado de datos bajo una arquitectura de <b>Inquilino Múltiple o Multi-Tenant</b>. 
                        </p>
                        <p style={{ marginBottom: '8px' }}>
                          Sistema validado con dos perfiles de clientes corporativos que sufren esta fragmentación cotidianamente:
                        </p>
                        <ul style={{ listStyleType: 'disc', paddingLeft: '20px', margin: '0' }}>
                          <li style={{ marginBottom: '6px' }}>
                            <b>Área de seguros de un entorno bancario:</b> caracterizado por una enorme densidad de manuales de cobertura y pólizas.
                          </li>
                          <li style={{ marginBottom: '6px' }}>
                            <b>Estudio contable:</b> expuesto a una alta volatilidad de los boletines fiscales y con exigencia de parámetros numéricos exactos.
                          </li>
                        </ul>
                      </>
                    ),
                h3: [],
      },
      {
        icon: Database,
        tag: 'PROPUESTA',
        title: 'Propuesta',
        body: '',
        image: '/imagenes_tfm/arquitectura_solucion.png',
        h3: [],
      },
      {
        icon: Database,
        tag: 'PROPUESTA',
        title: 'Casos de uso',
        body: '',
        image: '/imagenes_tfm/contexto_solucion.png',
        h3: [],
      },
      {
        icon: Database,
        tag: 'PROPUESTA',
        title: 'Gestión de la información',
        body: '',
        image: '/imagenes_tfm/gestion_multimodal_multilingual.png',
        h3: [],
      },
      {
        icon: Database,
        tag: 'PROPUESTA',
        title: 'Flujo agéntico',
        body: '',
        image: '/imagenes_tfm/flujo_agentico.png',
        h3: [],
      },
      {
        icon: Shield,
        tag: 'SOLUCIÓN',
        title: 'Solución y Limitaciones',
        body: (
              <>
                <p style={{ marginBottom: '8px' }}>
                  Limitaciones en el uso de herramientas comerciales como ChatGPT o Claude en entornos corporativos: 
                </p>
                <ul style={{ listStyleType: 'disc', paddingLeft: '20px', margin: '0 0 16px 0' }}>
                  <li style={{ marginBottom: '6px' }}><b>Problemas de privacidad</b>.</li>
                  <li style={{ marginBottom: '6px' }}><b>Alucinaciones de los modelos genéricos</b> debido al desconocimiento del contexto.</li>
                </ul>
                <p style={{ margin: 0 }}>
                  Ante las limitaciones, <b>RAG Platform</b> pretende ser una solución híbrida que fusiona la comprensión de documentos mediante RAG y el análisis de bases de datos para transformar el conocimiento fragmentado en decisiones inmediatas.
                </p>
              </>
            ),

        h3: [
          {
            title: 'Arquitectura de la solución',
            body: (
              <>
                <p style={{ margin: 0 }}>
                  Respecto de la arquitectura, esta funciona como un ecosistema de componentes interconectados que priorizan la precisión mediante un flujo de datos estructurado en cuatro etapas principales: (i) recepción y clasificación, (ii) procesamiento de contexto y recuperación, (iii) síntesis y razonamiento, y (iv) entrega de respuesta y trazabilidad.
                </p>
              </>
            ),
          },
          {
            title: 'Estrategias de ingesta diferenciadas',
            body: (
              <>
                <ul style={{ listStyleType: 'disc', paddingLeft: '20px', margin: '0' }}>
                  <li style={{ marginBottom: '8px' }}>
                    <b>Datos no estructurados:</b> procesados en Python con <code style={{ backgroundColor: '#1f2937', padding: '2px 4px', borderRadius: '4px', fontFamily: 'monospace' }}>PyPDFDirectoryLoader</code> de LangChain. Se aplica un particionado recursivo (<code style={{ backgroundColor: '#1f2937', padding: '2px 4px', borderRadius: '4px', fontFamily: 'monospace' }}>RecursiveCharacterTextSplitter</code>) para mantener cohesión semántica.
                  </li>
                  <li style={{ marginBottom: '8px' }}>
                    <b>Datos estructurados (Tablas):</b> cargados mediante la librería Pandas y <code style={{ backgroundColor: '#1f2937', padding: '2px 4px', borderRadius: '4px', fontFamily: 'monospace' }}>openpyxl</code>. El motor se apoya en búsquedas léxicas precisas y comandos de filtrado deterministas para evitar la desviación probabilística del LLM.
                  </li>
                </ul>
              </>
            ),
          },
          {
            title: 'Orquestación del backend',
            body: (
              <>
                <ul style={{ listStyleType: 'disc', paddingLeft: '20px', margin: '0' }}>
                  <li style={{ marginBottom: '8px' }}>
                    Backend desarrollado sobre la clase núcleo <code style={{ backgroundColor: '#1f2937', padding: '2px 4px', borderRadius: '4px', fontFamily: 'monospace' }}>BaseModel</code> utilizando FastAPI (asincronía nativa para operaciones no bloqueantes) y Uvicorn como servidor ASGI.
                  </li>
                  <li style={{ marginBottom: '8px' }}>
                    La modularidad permite intercambiar el LLM subyacente entre APIs en la nube (<code style={{ backgroundColor: '#1f2937', padding: '2px 4px', borderRadius: '4px', fontFamily: 'monospace' }}>langchain-google-genai</code>) y entornos locales de inferencia con Ollama (Llama-3 / Phi-3).
                  </li>
                </ul>
              </>
            ),
          },
          {
            title: 'Mitigación activa de alucinaciones',
            body: (
              <>
                <ul style={{ listStyleType: 'disc', paddingLeft: '20px', margin: '0' }}>
                  <li style={{ marginBottom: '8px' }}>
                    Se implementó un enrutador inteligente de intenciones (<b>Intent Router</b>) mediante ingeniería de prompts estricta en el orquestador.
                  </li>
                  <li style={{ marginBottom: '8px' }}>
                    Las búsquedas vectoriales imponen un filtro de confianza con un umbral de similitud semántica (<code style={{ backgroundColor: '#1f2937', padding: '2px 4px', borderRadius: '4px', fontFamily: 'monospace' }}>score &lt; 0.85</code>); si no se alcanza, el agente intercepta el flujo y conmuta a un protocolo de respaldo explícito (<code style={{ backgroundColor: '#1f2937', padding: '2px 4px', borderRadius: '4px', fontFamily: 'monospace' }}>[USAR_TABLA]</code>) para comprobar repositorios tabulares relacionales.
                  </li>
                </ul>
              </>
            ),
          },
          {
            title: 'Frontend y despliegue',
            body: (
              <>
                <ul style={{ listStyleType: 'disc', paddingLeft: '20px', margin: '0' }}>
                  <li style={{ marginBottom: '8px' }}>
                    Construido en Next.js 15 (App Router) aprovechando React Server Components y la renderización en el servidor con streaming (<b>Streaming SSR</b>) vía Server-Sent Events (SSE) para renderizar la respuesta progresivamente (token a token).
                  </li>
                  <li style={{ marginBottom: '8px' }}>
                    Autenticación y RBAC (control de accesos basado en roles) desplegados en Clerk.
                  </li>
                  <li style={{ marginBottom: '8px' }}>
                    Despliegue cloud ejecutado en Vercel acoplado a túneles seguros con Ngrok durante la fase operativa local.
                  </li>
                </ul>
              </>
            ),
          }
        ],

      },
    ],
  },
  {
    number: '02',
    tag: 'INGENIERÍA',
    title: 'Ingeniería de Datos EMBEDDINGS: Ingesta, Chunking y Bases de Datos Vectoriales',
    description: 'Esta solución técnica se despliega en el backend mediante una infraestructura completamente desacoplada y asíncrona, configurada bajo una arquitectura de alto rendimiento que aprovecha las capacidades de FastAPI y Uvicorn. Toda la lógica de conexión, flujos de datos y manipulación semántica se encuentra orquestada de manera sistemática a través del ecosistema LangChain, garantizando así la escalabilidad, la eficiencia en el manejo de peticiones concurrentes y la viabilidad técnica a largo plazo de todo el sistema.',
    h2sections: [
      {
        icon: FileText,
        tag: 'CHUNKING',
        title: 'Parseo y Fragmentación (Chunking)',
        body: 'Desde esta interfaz se permite la carga de archivos corporativos complejos, como diccionarios de datos en Excel. Dado que los LLMs no procesan eficientemente documentos tabulares masivos, el backend ejecuta un pipeline ETL automatizado que extrae y transforma esta información a un formato JSON estandarizado y legible.\n\nPosteriormente, para no desbordar la ventana de contexto del modelo, se aplica una técnica de fragmentación semántica (*chunking*). Esta fase divide los datos masivos en bloques mínimos e independientes, lo que optimiza la latencia de procesamiento sin comprometer la cohesión ni la integridad del contexto original.',
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
        body: 'La arquitectura destaca por su adaptabilidad polimórfica y agnosticismo de proveedor. Tras la fragmentación, el motor transforma cada bloque de texto en un vector matemático de 768 dimensiones que actúa como su representación semántica.\n\nEl sistema no almacena las palabras de forma literal, sino mediante coordenadas en un espacio geométrico multidimensional donde los conceptos similares se posicionan de manera adyacente. Esta propiedad viabiliza búsquedas conceptuales precisas que localizan información relevante mediante sinónimos o términos implícitos, proveyendo al LLM del contexto idóneo para generar respuestas fundamentadas.',
        image: '/imagenes_tfm/modulo_embeddings.png',
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
        body: 'La arquitectura del sistema implementa un enfoque de persistencia híbrido diseñado de forma estratégica para optimizar tanto la gestión operativa como los tiempos de respuesta de la inteligencia artificial. Esta dualidad tecnológica separa las responsabilidades de datos en dos capas complementarias:\n\n• Capa Relacional (Supabase): Gestiona de manera centralizada la estructura transaccional del sistema, incluyendo el control de usuarios, la asignación de roles, las políticas de acceso y los registros de auditoría.\n\n• Capa Vectorial Embebida (Chroma): Almacena de forma local en disco los vectores semánticos correspondientes a los documentos corporativos. Al procesar las búsquedas vectoriales de manera perimetral e interna en el backend, se reduce drásticamente la latencia de las consultas semánticas y se agiliza la inyección de contexto en la IA.',
        image: '/imagenes_tfm/diagrama_embeddings.png',
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
        body: 'Frente a consultas que exigen datos estructurados exactos, la búsqueda vectorial semántica resulta ineficiente. Para resolver esta limitación, el sistema incorpora un enrutador de intenciones (Intent Router) en la capa de orquestación.\n\nEste componente evalúa dinámicamente la naturaleza de la petición del usuario y determina el flujo de ejecución óptimo: bifurca el proceso hacia la recuperación de documentos no estructurados (RAG) o activa herramientas dinámicas (Tooling) para consultar directamente las tablas de la base de datos relacional. Esta estrategia asegura que cada tipología de pregunta sea resuelta por el motor de datos más adecuado.',
        h3: [],
      }
    ],
  },
  {
    number: '04',
    tag: 'NÚCLEO',
    title: 'El Núcleo Computacional: El Patrón "Intent Router"',
    description: '',
    h2sections: [
      {
        icon: Code2,
        tag: 'CLASE BASE MODEL',
        title: 'Clase BaseModel',
        body: (
          <>
            <p style={{ marginBottom: '12px' }}>
              Clase base modular que destaca por su <b>adaptabilidad polimórfica</b> y <b>agnosticismo de proveedor</b>.
            </p>
            <p style={{ marginBottom: '12px' }}>
              Hace factible la conmutación dinámica entre modelos de lenguaje comerciales en la nube y modelos locales de código abierto a través de Ollama.
            </p>
            <ul style={{ listStyleType: 'disc', paddingLeft: '20px', margin: '0' }}>
              <li style={{ marginBottom: '6px' }}>
                Si el usuario pregunta algo como <i>"Dime las coberturas de esta póliza"</i>, el sistema debe buscar en textos no estructurados.
              </li>
              <li style={{ marginBottom: '6px' }}>
                Si pregunta <i>"¿Cuáles fueron las ventas o alícuotas del mes pasado?"</i>, la respuesta está en una base de datos tabular.
              </li>
            </ul>
          </>
        ),
        h3: [ ],
      },

      {
        icon: Code2,
        tag: 'INTENT ROUTER',
        title: 'Intent Router',
        body: (
              <>
                <p style={{ marginBottom: '8px' }}>
                  Subsistema que clasifica en tiempo real la intención del usuario para derivar la petición hacia el pipeline óptimo:
                </p>
                <ul style={{ listStyleType: 'disc', paddingLeft: '20px', margin: '0' }}>
                  <li style={{ marginBottom: '6px' }}>Búsqueda semántica RAG.</li>
                  <li style={{ marginBottom: '6px' }}>Consultas léxicas exactas sobre datos tabulares mediante Pandas.</li>
                  <li style={{ marginBottom: '6px' }}>Navegación web.</li>
                  <li style={{ marginBottom: '6px' }}>Respuesta directa.</li>
                </ul>
              </>
            ),
        image: '/imagenes_tfm/intent_router.png',
        h3: [],
      },

      {
        icon: Code2,
        tag: 'Ventajas',
        title: 'Ventajas',
        body: (
          <>
            <p style={{ marginBottom: '8px' }}>
              La implementación del enrutador inteligente de consultas trae consigo beneficios como:
            </p>
            <ul style={{ listStyleType: 'disc', paddingLeft: '20px', margin: '0' }}>
              <li style={{ marginBottom: '6px' }}>
                <b>Ahorro computacional:</b> pues evita el sobrecosto de contexto.
              </li>
              <li style={{ marginBottom: '6px' }}>
                <b>El aislamiento del flujo de ejecución</b>.
              </li>
            </ul>
          </>
        ),
        h3: [
          {
            title: 'Refactorización (SOLID)',
            body: (
              <>
                <p style={{ marginBottom: '12px' }}>
                  El código original residía en un módulo monolítico denominado <code style={{ backgroundColor: '#1f2937', padding: '2px 4px', borderRadius: '4px', fontFamily: 'monospace' }}>BaseModelLLM/base_llm.py</code>. 
                </p>
                <p style={{ marginBottom: '12px' }}>
                  Se aplicó rigurosamente el <b>Principio de Responsabilidad Única (SRP)</b> y el <b>Principio de Abierto/Cerrado (OCP)</b>. 
                </p>
                <p style={{ margin: 0 }}>
                  Se definió una interfaz abstracta para los Handlers, permitiendo que el sistema fuese extensible a nuevos pipelines (como bases de datos de grafos en el futuro), simplemente añadiendo una clase, sin modificar el código del enrutador central.
                </p>
              </>
            ),
          },
          {
            title: 'Mecanismo de clasificación (Intent Router)',
            body: (
              <>
                <ul style={{ listStyleType: 'disc', paddingLeft: '20px', margin: '0' }}>
                  <li style={{ marginBottom: '8px' }}>
                    No se utiliza un clasificador probabilístico simple o un modelo de Machine Learning tradicional que añada latencia. 
                  </li>
                  <li style={{ marginBottom: '8px' }}>
                    El enrutamiento se ejecuta mediante un prompt del sistema altamente optimizado inyectado en el LLM orquestador (langchain), estructurado con JSON Schema estructurado (<code style={{ backgroundColor: '#1f2937', padding: '2px 4px', borderRadius: '4px', fontFamily: 'monospace' }}>PydanticOutputParser</code>). 
                  </li>
                  <li style={{ marginBottom: '8px' }}>
                    El modelo es forzado a devolver un objeto JSON estricto con la clave <code style={{ backgroundColor: '#1f2937', padding: '2px 4px', borderRadius: '4px', fontFamily: 'monospace' }}>intent</code> (RAG, TABLA, DIRECTO, INTERNET). 
                  </li>
                  <li style={{ marginBottom: '8px' }}>
                    Si el JSON es inválido, un bloque <code style={{ backgroundColor: '#1f2937', padding: '2px 4px', borderRadius: '4px', fontFamily: 'monospace' }}>try-except</code> captura el error y activa la ruta de contingencia de forma segura.
                  </li>
                </ul>
              </>
            ),
          },
          {
            title: 'Intercambio dinámico de contexto',
            body: (
              <>
                <p style={{ margin: 0 }}>
                  El Intent Router actúa en la capa del backend asíncrono (<code style={{ backgroundColor: '#1f2937', padding: '2px 4px', borderRadius: '4px', fontFamily: 'monospace' }}>async/await</code> en FastAPI). Al recibir la petición, encapsula los metadatos del usuario, incluyendo el <code style={{ backgroundColor: '#1f2937', padding: '2px 4px', borderRadius: '4px', fontFamily: 'monospace' }}>org_id</code> y el historial de chat comprimido (<code style={{ backgroundColor: '#1f2937', padding: '2px 4px', borderRadius: '4px', fontFamily: 'monospace' }}>ConversationBufferWindowMemory</code>), pasándolos como argumentos al handler seleccionado para evitar la pérdida de memoria de la sesión durante la conmutación de rutas.
                </p>
              </>
            ),
          },
          {
            title: 'Flujo logístico y manejo de errores en handlers',
            body: (
              <>
                <p style={{ marginBottom: '12px' }}>
                  Cada handler implementa su propio bloque de manejo de excepciones:
                </p>
                <ul style={{ listStyleType: 'disc', paddingLeft: '20px', margin: '0 0 16px 0' }}>
                  <li style={{ marginBottom: '10px' }}>
                    <b>TablasHandler:</b> si el handler falla al parsear una consulta con Pandas debido a un formato inesperado en el archivo .csv, levanta una excepción controlada que es capturada por el orquestador principal, evitando un error 500 Internal Server Error en el frontend y ofreciendo una respuesta de <i>degradación elegante</i> (graceful degradation) al usuario.
                  </li>
                  <li style={{ marginBottom: '10px' }}>
                    <b>VectorStoreHandler:</b> este componente gestiona operaciones críticas de E/S de alta dimensionalidad con la base de datos vectorial (Supabase/Chroma) y la API del modelo de embeddings. Ante fallos de conectividad de red, picos de latencia, problemas de autenticación con el token del inquilino, o saturación del límite de peticiones (Rate Limiting), el handler intercepta la excepción técnica. En lugar de interrumpir el hilo de ejecución asíncrono en FastAPI, el sistema mitiga el error mediante una política de reintentos con retraso exponencial. Si el fallo persiste, se genera un mensaje estructurado que informa al usuario sobre la indisponibilidad temporal del repositorio documental, manteniendo intacta la sesión conversacional.
                  </li>
                  <li style={{ marginBottom: '10px' }}>
                    <b>DirectoHandler / InternetHandler:</b> al interactuar con capas de charla casual o motores de búsqueda externa, las principales vulnerabilidades radican en la recepción de respuestas malformadas o timeouts prolongados por parte de los servicios de navegación. El bloque de excepciones de estos handlers implementa un temporizador estricto (timeout threshold). Si la solicitud web o la inferencia abierta excede el tiempo límite establecido, la excepción es capturada para activar un protocolo de degradación, forzando al orquestador principal a emitir una respuesta de contingencia predefinida que invita al usuario a reformular su consulta.
                  </li>
                </ul>
                <p style={{ margin: 0 }}>
                  <b>Mecanismo de Auto-corrección y Fallback:</b> un aspecto clave en la robustez del núcleo computacional es que, si la excepción levantada por un handler se debe a la ausencia de información válida (por ejemplo, un score de similitud semántica inferior al umbral de confianza de 0.85 en el VectorStoreHandler), el orquestador intercepta el evento no como un error crítico de software, sino como un desencadenante lógico. Esto permite desviar de forma autónoma el flujo de la petición hacia el comando interno <code style={{ backgroundColor: '#1f2937', padding: '2px 4px', borderRadius: '4px', fontFamily: 'monospace' }}>[USAR_TABLA]</code>, intentando resolver la consulta en repositorios alternativos antes de admitir la falta de datos.
                </p>
              </>
            ),
          }
        ],
      },
    ],
  },
  {
    number: '05',
    tag: 'SEGURIDAD',
    title: 'Arquitectura Base y Seguridad: Multi-Tenancy y RBAC',
    description: (
          <>
            <b>Plataforma B2B ofreciendo:</b>
            <ul style={{ listStyleType: 'disc', marginLeft: '20px', marginTop: '10px' }}>
              <li>En un <i>espacio totalmente hermético</i>.</li>
              <li>Garantizando así la privacidad de sus datos.</li>
              <li>Un funcionamiento constante sin costes desorbitados de servidores.</li>
            </ul><br />
            A continuación, veremos las dos claves de este logro: cómo protegemos la información corporativa y cómo estructuramos nuestra red de forma inteligente
          </>
        ),
    h2sections: [
      {
        icon: Shield,
        tag: 'AISLAMIENTO',
        title: 'Seguridad y Aislamiento de la Información Corporativa',
        body: (
            <>
                    <b>Los pilares fundamentales:</b>
                    <ul style={{ listStyleType: 'disc', marginLeft: '20px', marginTop: '10px' }}>
                      <li style={{ marginBottom: '5px' }}>Entorno <i>aislado</i>.</li>
                      <li style={{ marginBottom: '5px' }}>Control <b>estricto</b> de quién entra y quién sale.</li>
                      <li>Administración de permisos.</li>
                    </ul>
                  </>
                ),       
        image: '/imagenes_tfm/aislamiento_multi_tenant.png',
        h3: [
          {
            title: 'Gestión de Identidad en el Edge (Clerk)',
            body: (
              <>
                <p style={{ marginBottom: '12px' }}>
                  Hemos integrado Clerk como solución de autenticación moderna compatible con arquitecturas Edge, evaluando el acceso en el middleware de Next.js antes de renderizar la página y ofreciendo flujos de acceso avanzados (Email y credenciales clásicas).
                </p>
                <ul style={{ listStyleType: 'disc', paddingLeft: '20px', margin: '0 0 16px 0' }}>
                  <li style={{ marginBottom: '8px' }}><b>¿Qué es el Edge?</b> Significa que el código de seguridad no se ejecuta en un único servidor lejano, sino en una red global de servidores ultra-rápidos de Vercel distribuidos por todo el mundo, operando en el nodo más cercano al usuario.</li>
                  <li style={{ marginBottom: '8px' }}><b>¿Qué es el Middleware?</b> Es un "guardia de seguridad" a la entrada de la aplicación. Inspecciona al usuario antes de que la página web empiece siquiera a cargarse o renderizarse en el navegador.</li>
                  <li style={{ marginBottom: '8px' }}><b>¿Qué hace Clerk aquí?</b> Es la herramienta que gestiona los usuarios y las empresas. Emite un pase digital (Token JWT) que el Middleware lee al instante para comprobar quién eres y a qué empresa perteneces.</li>
                </ul>
                <b style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af' }}>¿Por qué es genial esta solución? (El valor técnico)</b>
                <ul style={{ listStyleType: 'disc', paddingLeft: '20px', margin: '0' }}>
                  <li style={{ marginBottom: '4px' }}><b>Seguridad Total:</b> Bloquea a los intrusos en la periferia de la red, antes de que puedan tocar vuestros datos o consumir recursos del sistema.</li>
                  <li style={{ marginBottom: '4px' }}><b>Velocidad Absoluta:</b> Al verificar la identidad en el servidor más cercano al usuario y sin consultar bases de datos lentas en cada clic, la aplicación responde de manera inmediata.</li>
                  <li style={{ marginBottom: '4px' }}><b>Control Multi-Empresa:</b> Permite estructurar de forma limpia los accesos para que cada cliente (como el Estudio Contable o el Banco) se mantenga en su entorno privado.</li>
                </ul>
              </>
            )
          },
          {
            title: 'Control de Acceso Basado en Roles (RBAC) y Sincronización',
            body: (
              <>
                <p style={{ marginBottom: '12px' }}>
                  Clerk emite un Token JWT con un <code style={{ backgroundColor: '#1f2937', padding: '2px 4px', borderRadius: '4px', fontFamily: 'monospace' }}>publicMetadata</code> que contiene el <code style={{ backgroundColor: '#1f2937', padding: '2px 4px', borderRadius: '4px', fontFamily: 'monospace' }}>orgId</code> (identificador de la empresa) y el <code style={{ backgroundColor: '#1f2937', padding: '2px 4px', borderRadius: '4px', fontFamily: 'monospace' }}>role</code> (<code style={{ backgroundColor: '#1f2937', padding: '2px 4px', borderRadius: '4px', fontFamily: 'monospace' }}>admin</code>, <code style={{ backgroundColor: '#1f2937', padding: '2px 4px', borderRadius: '4px', fontFamily: 'monospace' }}>editor</code>, <code style={{ backgroundColor: '#1f2937', padding: '2px 4px', borderRadius: '4px', fontFamily: 'monospace' }}>viewer</code>). Un hook especializado en React (<code style={{ backgroundColor: '#1f2937', padding: '2px 4px', borderRadius: '4px', fontFamily: 'monospace' }}>AuthContext.tsx</code>) captura este JWT en el inicio de sesión y sincroniza el perfil mediante una operación <code style={{ backgroundColor: '#1f2937', padding: '2px 4px', borderRadius: '4px', fontFamily: 'monospace' }}>upsert</code> en la tabla relacional <code style={{ backgroundColor: '#1f2937', padding: '2px 4px', borderRadius: '4px', fontFamily: 'monospace' }}>user_profiles</code> de Supabase.
                </p>
                <ul style={{ listStyleType: 'disc', paddingLeft: '20px', margin: '0 0 16px 0' }}>
                  <li style={{ marginBottom: '8px' }}><b>¿Qué es RBAC?</b> Significa "Control de Acceso Basado en Roles". Es el sistema que decide qué puede hacer cada empleado según su rango: Admin (control total), Editor (modifica datos) o Viewer (solo lee).</li>
                  <li style={{ marginBottom: '8px' }}><b>El "Pase VIP" (Token JWT con publicMetadata):</b> Cuando el usuario inicia sesión, Clerk le entrega una tarjeta digital de identificación (el Token JWT). Dentro de esta tarjeta viene grabado a fuego un chip invisible (publicMetadata) que dice dos cosas esenciales: a qué empresa perteneces (orgId) y qué puesto tienes (role).</li>
                  <li style={{ marginBottom: '8px' }}><b>El Receptor (AuthContext.tsx):</b> Es un componente espía en la interfaz de usuario (React). En cuanto el usuario entra, este componente "caza" la tarjeta digital (el JWT) para saber al instante qué botones debe mostrarle u ocultarle en la pantalla.</li>
                  <li style={{ marginBottom: '8px' }}><b>La Sincronización (upsert en Supabase):</b> Para que la base de datos sepa también quién ha entrado, el sistema hace un upsert (un comando inteligente que significa: "Si el usuario ya existe en la base de datos, actualiza sus datos; si es nuevo, regístralo"). Así, la tabla de perfiles en Supabase se mantiene idéntica a la de Clerk en tiempo real.</li>
                </ul>
                <b style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af' }}>¿Por qué es genial esta solución? (El valor técnico)</b>
                <ul style={{ listStyleType: 'disc', paddingLeft: '20px', margin: '0' }}>
                  <li style={{ marginBottom: '4px' }}><b>Eficiencia Máxima:</b> Al guardar el rol y la empresa dentro de la tarjeta digital (JWT), el frontend no tiene que preguntar a la base de datos qué permisos tiene el usuario cada vez que hace un clic. El pase ya lleva toda la información encima.</li>
                  <li style={{ marginBottom: '4px' }}><b>Consistencia de Datos:</b> La operación upsert garantiza que la base de datos de la aplicación y el sistema de autenticación jamás se descoordinen, evitando errores de permisos.</li>
                </ul>
              </>
            )
          },
          {
            title: 'Aislamiento Físico de Datos (Row Level Security - RLS)',
            body: (
              <>
                <p style={{ marginBottom: '12px' }}>
                  Para garantizar el Multi-Tenancy a nivel de infraestructura profunda, implementamos políticas de seguridad a nivel de fila (RLS) nativas de PostgreSQL en Supabase. Al inyectar dinámicamente el <code style={{ backgroundColor: '#1f2937', padding: '2px 4px', borderRadius: '4px', fontFamily: 'monospace' }}>orgId</code> en cada consulta, la base de datos rechaza a nivel criptográfico cualquier lectura o escritura de registros que no pertenezcan a la organización del usuario, neutralizando el riesgo de "Cross-Tenant Data Leakage".
                </p>
                <ul style={{ listStyleType: 'disc', paddingLeft: '20px', margin: '0 0 16px 0' }}>
                  <li style={{ marginBottom: '8px' }}><b>¿Qué es el Multi-Tenancy?</b> Es el modelo de software donde una sola aplicación da servicio a múltiples empresas clientes (tenants), pero cada una debe vivir en su propio espacio estanco.</li>
                  <li style={{ marginBottom: '8px' }}><b>¿Qué es el RLS (Row Level Security)?</b> Tradicionalmente, si tienes acceso a una tabla de la base de datos, ves todas las filas. RLS es una funcionalidad de PostgreSQL (la base de datos que usa Supabase) que actúa como un filtro invisible e infranqueable directamente en cada fila de la base de datos.</li>
                  <li style={{ marginBottom: '8px' }}><b>El mecanismo de bloqueo:</b> Cada vez que el código hace una consulta (ej. "busca este documento"), el sistema inyecta automáticamente el código identificador de la empresa (orgId). La base de datos mira fila por fila y dice: <i>"¿Esta fila coincide con el orgId del usuario? Si sí, se la muestro; si no, la oculto como si jamás hubiera existido"</i>.</li>
                </ul>
                <b style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af' }}>¿Por qué es genial esta solución? (El valor técnico)</b>
                <ul style={{ listStyleType: 'disc', paddingLeft: '20px', margin: '0' }}>
                  <li style={{ marginBottom: '4px' }}><b>Seguridad Blindada (A nivel criptográfico):</b> El filtrado no se hace mediante código tradicional en el backend (donde un programador podría olvidar añadir un WHERE tenant_id = X por error). Lo gestiona el propio motor profundo de la base de datos. Si un atacante intentara trucar la URL o la interfaz para ver datos de otra empresa, la base de datos rechazaría la petición de raíz.</li>
                  <li style={{ marginBottom: '4px' }}><b>Neutraliza el Cross-Tenant Data Leakage:</b> Elimina al 100% el riesgo de filtración de datos entre empresas clientes. Un Banco jamás podrá ver, ni por error, un solo registro del Estudio Contable.</li>
                </ul>
              </>
            )
          },
          {
            title: 'Prevención del Cross-Tenant Data Leakage en la Capa Visual',
            body: (
              <>
                <p style={{ marginBottom: '12px' }}>
                  La arquitectura de roles condiciona completamente el DOM de Next.js. A los perfiles con rol <code style={{ backgroundColor: '#1f2937', padding: '2px 4px', borderRadius: '4px', fontFamily: 'monospace' }}>viewer</code>, el servidor les re-renderiza la interfaz bloqueando dinámicamente el acceso a funcionalidades de manipulación de archivos y diccionarios corporativos, creando una degradación elegante del sistema.
                </p>
                <ul style={{ listStyleType: 'disc', paddingLeft: '20px', margin: '0 0 16px 0' }}>
                  <li style={{ marginBottom: '8px' }}><b>¿Qué es el DOM de Next.js?</b> El DOM (Document Object Model) es, básicamente, la estructura de la página web que ve y toca el usuario (los botones, los menus, los formularios).</li>
                  <li style={{ marginBottom: '8px' }}><b>El mecanismo de bloqueo visual:</b> Cuando un usuario entra a la plataforma, el servidor de Next.js comprueba su rol antes de enviarle la página. Si su rol es viewer (un observador básico), el servidor reconfigura la interfaz en tiempo real.</li>
                  <li style={{ marginBottom: '8px' }}><b>¿Qué es la Degradación Elegante?</b> En lugar de lanzar un error rudo de "Acceso Denegado" o romper la página, la aplicación se adapta "elegantemente". Al usuario con rol viewer se le ocultan o deshabilitan por completo los botones peligrosos (como "Subir archivo", "Borrar documento" o "Modificar diccionario corporativo"). La app sigue funcionando perfectamente, pero limitada a sus permisos.</li>
                </ul>
                <b style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af' }}>¿Por qué es genial esta solución? (El valor técnico)</b>
                <ul style={{ listStyleType: 'disc', paddingLeft: '20px', margin: '0' }}>
                  <li style={{ marginBottom: '4px' }}><b>Doble Capa de Seguridad:</b> No basta con bloquear los datos en la base de datos profunda (con el RLS). Al bloquear también los elementos en la Capa Visual, evitáis que un usuario intente siquiera pulsar un botón para el que no está autorizado.</li>
                  <li style={{ marginBottom: '4px' }}><b>Excelente Experiencia de Usuario (UX):</b> Evita la frustración. El empleado solo ve las herramientas que realmente puede usar, manteniendo una interfaz limpia, intuitiva y segura.</li>
                </ul>
              </>
            )
          }
        ],      },
      {
        icon: Lock,
        tag: 'DESPLIEGUE',
        title: 'Despliegue Híbrido: Privacidad Absoluta y Ahorro de Costes',
        body: (
                <>
                  <b>Nuestra solución está enfocada en un modelo híbrido:</b>
                  <ul style={{ listStyleType: 'disc', paddingLeft: '20px', margin: '10px 0 0 0' }}>
                    <li style={{ marginBottom: '6px' }}>La interfaz gráfica y la aplicación web que usan los clientes están alojadas en la <i>nube</i>.</li>
                    <li style={{ marginBottom: '6px' }}>El núcleo de razonamiento de la Inteligencia Artificial se ejecuta directamente en los <b>servidores locales físicos</b> de la empresa.</li>
                  </ul>
                </>
              ),
        image: '/imagenes_tfm/arquitectura_hibrida.png',
        h3: [
          {
            title: 'Túnel Reverso para Bypassing NAT',
            body: (
              <>
                <p style={{ margin: 0 }}>
                  Al ejecutar el frontend en Vercel (Cloud) y el backend en FastAPI local (On-Premise), la red Serverless de Vercel arrojaba errores 503/404 por culpa de los cortafuegos y el NAT local. Implementamos un túnel reverso persistente y seguro mediante <b>Pinggy / Ngrok</b>, inyectando un dominio estático (<code style={{ backgroundColor: '#1f2937', padding: '2px 4px', borderRadius: '4px', fontFamily: 'monospace' }}>PYTHON_BACKEND_URL</code>) en las variables de entorno de Vercel.
                </p>
              </>
            ),
          },
          {
            title: 'Resolución del Hydration Mismatch en Next.js',
            body: (
              <>
                <p style={{ marginBottom: '12px' }}>
                  A nivel de interfaz, el nuevo <i>App Router</i> de Next.js generó conflictos de hidratación porque el servidor (Vercel) pre-renderizaba la barra lateral sin la sesión autenticada, mientras el cliente (navegador) tenía la cookie de Clerk activa. Unificamos el manejo de estado asíncrono en el <code style={{ backgroundColor: '#1f2937', padding: '2px 4px', borderRadius: '4px', fontFamily: 'monospace' }}>RootLayout</code> para lograr una hidratación síncrona sin colapsos visuales.
                </p>
                <ul style={{ listStyleType: 'disc', paddingLeft: '20px', margin: '0 0 16px 0' }}>
                  <li style={{ marginBottom: '8px' }}><b>¿Qué es la Hidratación?</b> En Next.js, para que la web cargue súper rápido, el servidor (Vercel) dibuja primero una versión estática de la página (HTML plano) y se la envía al navegador. Justo después, el navegador descarga el código JavaScript de React y lo "acopla" sobre ese dibujo estático para que los botones tengan vida. A ese proceso de darle vida al código se le llama hidratación.</li>
                  <li style={{ marginBottom: '8px' }}><b>La regla de oro:</b> Para que React no se rompa, el dibujo que hace el servidor y el dibujo que arranca en el navegador tienen que ser exactamente idénticos.</li>
                  <li style={{ marginBottom: '8px' }}>
                    <b>El conflicto (El Mismatch):</b> Al usar el nuevo App Router de Next.js, ocurrió una descoordinación:
                    <ul style={{ listStyleType: 'circle', paddingLeft: '20px', marginTop: '6px' }}>
                      <li style={{ marginBottom: '4px' }}>El servidor dibujaba la barra lateral asumiendo que el usuario no estaba logueado porque no tenía acceso inmediato a los datos en tiempo real.</li>
                      <li style={{ marginBottom: '4px' }}>El navegador del usuario, al recibir la página, detectaba que la cookie de inicio de sesión de Clerk sí estaba activa y dibujaba la barra lateral con las opciones del usuario logueado.</li>
                    </ul>
                  </li>
                  <li style={{ marginBottom: '8px' }}><b>El resultado:</b> Al no coincidir las dos versiones, React lanzaba un error crítico en la consola (Hydration Mismatch), provocando parpadeos molestos o "colapsos visuales" en la pantalla.</li>
                </ul>
                <b style={{ display: 'block', marginBottom: '6px' }}>¿Cómo lo solucionasteis? (Unificación en el RootLayout)</b>
                <p style={{ marginBottom: '12px' }}>
                  En lugar de dejar que cada componente de la barra lateral intentara adivinar de forma asíncrona si el usuario estaba dentro o fuera, movisteis y centralizasteis toda la lógica del estado de autenticación en la raíz de la aplicación: el RootLayout. Al envolver toda la estructura en un único punto de control síncrono, garantizasteis que tanto el servidor como el cliente se pusieran de acuerdo sobre el estado de la sesión antes de pintar cualquier píxel, logrando una carga limpia, fluida y sin errores de consola.
                </p>
                <b style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af' }}>¿Por qué es genial esta solución? (El valor técnico)</b>
                <p style={{ margin: 0 }}>
                  Demuestra ante el tribunal que domináis el ciclo de vida del renderizado de Next.js y que sabéis resolver problemas avanzados de sincronización entre el servidor (Server-Side Rendering) y la interfaz del cliente.
                </p>
              </>
            ),
          },
          {
            title: 'Configuración de Red y Timeouts Serverless',
            body: (
              <>
                <p style={{ marginBottom: '12px' }}>
                  Debido a que el LLM genera respuestas en streaming (SSE) y a veces tiene alta latencia de inferencia en hardware local, el ruteo asíncrono requirió un rediseño manual en el archivo <code style={{ backgroundColor: '#1f2937', padding: '2px 4px', borderRadius: '4px', fontFamily: 'monospace' }}>vercel.json</code> para extender la tolerancia de red de larga duración en la capa de Vercel y evitar cortes de conexión abruptos.
                </p>
                <ul style={{ listStyleType: 'disc', paddingLeft: '20px', margin: '0 0 16px 0' }}>
                  <li style={{ marginBottom: '8px' }}><b>¿Qué es el Streaming (SSE)?</b> Los modelos de lenguaje (LLM) no devuelven la respuesta de golpe como una base de datos tradicional. En su lugar, usan Server-Sent Events (SSE), que es la tecnología que permite que la IA vaya respondiendo y "escribiendo" la respuesta palabra por palabra en vuestra pantalla en tiempo real.</li>
                  <li style={{ marginBottom: '8px' }}><b>El problema de la latencia local:</b> Como vuestro backend de IA corre en un servidor local (On-Premise) y no en un superordenador en la nube, el "cerebro" tarda un poco más en pensar (alta latencia de inferencia) antes de empezar a escupir las palabras.</li>
                  <li style={{ marginBottom: '8px' }}><b>El corte abrupto de Vercel (Timeout):</b> Las plataformas en la nube como Vercel tienen una regla estricta por defecto: si un servidor tarda más de unos pocos segundos (normalmente 10-15 segundos) en responder, Vercel asume que el sistema se ha colgado y corta la conexión de golpe (lanzando un error de red). Esto hacía que las respuestas largas de vuestra IA se quedaran a medias.</li>
                </ul>
                <b style={{ display: 'block', marginBottom: '6px' }}>¿Cómo lo solucionasteis? (Rediseño en vercel.json)</b>
                <p style={{ marginBottom: '12px' }}>
                  Para evitar que la nube colgara el teléfono a vuestro servidor local mientras este seguía procesando el texto, modificasteis manualmente el archivo de configuración vercel.json de vuestro proyecto. En este archivo añadisteis una directiva para extender los límites de tiempo de espera (timeouts) de las funciones Serverless. Le dijisteis a Vercel algo como: <i>"Oye, mantén la conexión abierta durante más tiempo del habitual porque estamos transmitiendo datos de IA de larga duración desde un entorno local"</i>.
                </p>
                <b style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af' }}>¿Por qué es genial esta solución? (El valor técnico)</b>
                <ul style={{ listStyleType: 'disc', paddingLeft: '20px', margin: '0' }}>
                  <li style={{ marginBottom: '4px' }}><b>Estabilidad del Sistema:</b> Asegura que los usuarios puedan recibir respuestas completas, complejas y detalladas de la IA sin sufrir cortes inesperados o pantallas de error a mitad del chat.</li>
                  <li style={{ marginBottom: '4px' }}><b>Optimización Cloud-to-Local:</b> Demuestra que sabéis configurar infraestructura en la nube real para adaptarla a las limitaciones físicas del hardware local, logrando que dos mundos distintos se entiendan a la perfección.</li>
                </ul>
              </>
            ),
          }
        ],
      }
    ],
  },
  {
    number: '06',
    tag: 'CONCLUSIONES',
    title: 'Conclusiones y Logros',
    description: '',
    h2sections: [
      {
        icon: Users,
        tag: 'LOGROS',
        title: 'Logros Alcanzados',
        body: '',
        image: '/imagenes_tfm/logros.png',
        h3: [],
      },
      {
        icon: Users,
        tag: 'LOGROS',
        title: 'Trabajo futuro',
        body: (
          <>
            <p style={{ marginBottom: '8px' }}>
              Sistema preparado para evolucionar de forma directa hacia las dos grandes macro-tendencias que están transformando la industria tecnológica actual:
            </p>
            <ul style={{ listStyleType: 'disc', paddingLeft: '20px', margin: '0' }}>
              <li style={{ marginBottom: '6px' }}>
                <b>Modelos de agentes autónomos o Agentic AI:</b> con el propósito de que Intent Router no se limite únicamente a realizar lecturas o consultas de tipo <code style={{ backgroundColor: '#1f2937', padding: '2px 4px', borderRadius: '4px', fontFamily: 'monospace' }}>SELECT</code> sobre las bases de datos.
              </li>
              <li style={{ marginBottom: '6px' }}>
                <b>Fine-Tuning especializado</b> de modelos abiertos.
              </li>
            </ul>
          </>
        ),
        h3: [
          {
            title: 'Mecanismos de Extensión Agéntica (LangGraph / Tool Calling)',
            body: (
              <>
                <p style={{ marginBottom: '12px' }}>
                  La evolución hacia Agentic AI se plantea sustituyendo la lógica secuencial actual por grafos de conocimiento utilizando librerías como <code style={{ backgroundColor: '#1f2937', padding: '2px 4px', borderRadius: '4px', fontFamily: 'monospace' }}>LangGraph</code> o la API de Tool Calling nativa de LangChain.
                </p>
                <p style={{ margin: 0 }}>
                  Al mapear funciones de Python como herramientas específicas (por ejemplo, llamadas a la API de Microsoft Graph o pasarelas SQL con permisos de escritura), el LLM puede secuenciar llamadas, evaluar si la ejecución fue exitosa y auto-corregirse en caso de excepciones.
                </p>
              </>
            ),
          },
          {
            title: 'Técnicas de Fine-Tuning Local (QLoRA / Unsloth)',
            body: (
              <>
                <p style={{ marginBottom: '12px' }}>
                  Para la optimización de modelos locales en Ollama, se plantea un flujo de entrenamiento utilizando <b>QLoRA (Quantized Low-Rank Adaptation)</b> para reducir las exigencias de memoria de video (VRAM) en las GPUs corporativas.
                </p>
                <p style={{ margin: 0 }}>
                  El pipeline se procesará mediante frameworks de aceleración como Unsloth o Hugging Face TRL, entrenando los pesos adaptativos con datasets sintéticos generados a partir de las trazas recolectadas en nuestro propio archivo <code style={{ backgroundColor: '#1f2937', padding: '2px 4px', borderRadius: '4px', fontFamily: 'monospace' }}>evaluaciones_pendientes.json</code>.
                </p>
              </>
            ),
          },
          {
            title: 'Soberanía y seguridad en operaciones CRUD',
            body: (
              <>
                <p style={{ marginBottom: '8px' }}>
                  El otorgar permisos de escritura al agente corporativo introduce riesgos de inyección de código. El respaldo de seguridad técnica se basará en:
                </p>
                <ul style={{ listStyleType: 'disc', paddingLeft: '20px', margin: '0' }}>
                  <li style={{ marginBottom: '6px' }}>
                    Ejecución de comandos de base de datos dentro de transacciones aisladas con confirmación (commit) sujeta a la aprobación de un usuario mediante flujos de validación (<b>Human-in-the-loop</b>).
                  </li>
                  <li style={{ marginBottom: '6px' }}>
                    Sanitización estricta de variables de entrada utilizando validadores de esquemas de datos con <code style={{ backgroundColor: '#1f2937', padding: '2px 4px', borderRadius: '4px', fontFamily: 'monospace' }}>Pydantic</code> antes de invocar cualquier handler de automatización.
                  </li>
                </ul>
              </>
            ),
          },
          {
            title: 'Persistencia multinivel en producción',
            body: (
              <>
                <p style={{ marginBottom: '12px' }}>
                  La persistencia de sesiones calientes en memoria en la API de FastAPI resulta ser un inconveniente a mejorar.
                </p>
                <p style={{ margin: 0 }}>
                  Se migrará a un clúster de <b>Redis</b> en caché para evitar la sobrecarga de la RAM del servidor ante picos masivos de concurrencia de múltiples inquilinos simultáneos.
                </p>
              </>
            ),
          }
        ],
      }
    ],
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
            {typeof item.body === 'string' ? (
              <p style={{ padding: '0 16px 14px', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8, textAlign: 'justify', margin: 0 }}>{item.body}</p>
            ) : (
              <div style={{ padding: '0 16px 14px', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8, textAlign: 'justify' }}>{item.body}</div>
            )}
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
        {typeof data.description === 'string' ? (
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
            style={{ fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.85, textAlign: 'justify', whiteSpace: 'pre-line' }}>
            {data.description}
          </motion.p>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
            style={{ fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.85, textAlign: 'justify', whiteSpace: 'pre-line' }}>
            {data.description}
          </motion.div>
        )}
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
  const paragraphs = typeof data.body === 'string' ? data.body.split('\n\n') : [];

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
          {typeof data.body === 'string' ? (
            paragraphs.map((p, i) => (
              <p key={i} style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.85, textAlign: 'justify', marginBottom: i < paragraphs.length - 1 ? 16 : 0 }}>
                {p}
              </p>
            ))
          ) : (
            <div style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.85, textAlign: 'justify', whiteSpace: 'pre-line' }}>
              {data.body}
            </div>
          )}
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
