# 🏗️ Módulo de Infraestructura (docker-infra)

Este módulo gestiona el "hardware virtual" del proyecto. Aquí es donde vive la inteligencia (Ollama) y nuestro entorno de trabajo seguro (Ubuntu), garantizando que todos en el equipo trabajemos exactamente con la misma configuración.

## 📂 Componentes del Módulo

1. **`docker-compose.yml` (El Orquestador)**: Es el archivo maestro. Define cómo se levantan, conectan y comunican los servicios de Ubuntu y Ollama.
2. **`Dockerfile` (La Imagen Base)**: Contiene la "receta" técnica de nuestro servidor Ubuntu (Python 3.10, Git, etc.). Asegura que el código que le funciona a uno, le funcione a todos.
3. **`ollama_data/` (Persistencia de Modelos)**: Carpeta automática donde se almacenan los modelos de IA (como Phi-3). **No se debe borrar**, ya que evita tener que descargar gigabytes de datos cada vez que iniciamos el proyecto. Ademas esta carpeta **NO SE SUBE AL REPOSITORIO**
4. **`volumes/` (Gestión de Datos)**: Espacio reservado por Docker para el manejo de información interna. **No modificar manualmente.**
5. **`ollama/` (Logs y Configuración)**: Almacena registros técnicos del servidor de inteligencia artificial para asegurar su estabilidad.

---

## 🛠️ Configuración Inicial (Solo la primera vez)

Para que el proyecto funcione, tu ordenador debe estar listo para "virtualizar". Sigue estos pasos:

### 1. Preparar el Sistema

* **Verificar Virtualización**: Abre el `Administrador de Tareas` (Ctrl + Shift + Esc) > pestaña `Rendimiento` > `CPU`. Busca donde dice **Virtualización**.
* *Si dice Habilitado:* Perfecto, continúa.
* *Si dice Deshabilitado:* Debes activarlo en la BIOS de tu PC (contacta con el administrador del proyecto si necesitas ayuda aquí).


* **Actualizar el Motor Linux**: Abre una terminal (CMD o PowerShell) y escribe:
```bash
wsl --update
```



### 2. Instalación de Software

* Descarga e instala **Docker Desktop** desde la [Microsoft Store](https://apps.microsoft.com/detail/XP8CBJ40XLBWKX?hl=es-ES&gl=ES&ocid=pdpshare).
* Tras instalar, **reinicia tu ordenador**.

---

## 🚀 Cómo empezar a trabajar

Una vez instalado Docker, sigue estos pasos para poner en marcha el proyecto:

### Paso 1: Levantar los servicios
1- Escribe `CMD` en la barra de búsqueda de Windows.

2- Navega hasta la carpeta de tu proyecto. Esto seria copiar el path completo y escribir en la terminal
```bash
cd INSERTAR_AQUI_PATH
```

3- Ahora te deberia haber cambiado de:
```bash
C:\Users\Pc>
```
a

```bash
C:\repositorios_github\TFM\docker-infra>
```


4- Luego en la carpeta `docker-infra` y ejecuta:

```bash
docker-compose up -d
```

*Esto encenderá "La Caja" (Ubuntu) y "El Motor" (Ollama) en segundo plano.
Verificación visual: Podrías añadir que, tras el docker-compose up -d, pueden abrir la interfaz de Docker Desktop para ver los "cuadraditos" en verde, lo cual da mucha tranquilidad visual*

### Paso 2: Entrar al entorno de trabajo (Ubuntu)

Para empezar a programar o ejecutar scripts de ingesta de datos, entra al contenedor con:

```bash
docker exec -it tfm_ubuntu bash

```

*Verás que tu terminal cambia; ahora estás "dentro" del servidor Linux del proyecto.*

### Paso 3: Activar la Inteligencia (Ollama)

Para descargar y empezar a chatear con el modelo de IA oficial del TFM, usa este comando en una terminal nueva:

```bash
docker exec -it tfm_ollama ollama run phi3

```

---

## 💡 Notas

* **¿Dónde pongo mi código?**: Todo lo que guardes en la carpeta raíz del proyecto en Windows aparecerá automáticamente dentro de la carpeta `/app` del contenedor Ubuntu.
* **Limpieza**: Para apagar todo y liberar memoria RAM cuando termines de trabajar, usa:
```bash
docker-compose stop

```