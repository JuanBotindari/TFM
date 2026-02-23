FROM ubuntu:22.04

# Evita preguntas interactivas durante la instalación
ENV DEBIAN_FRONTEND=noninteractive

# Instalamos Python, Curl (lo tenías antes y es útil) y herramientas básicas
RUN apt-get update && apt-get install -y \
    curl \
    python3 \
    python3-pip \
    git \
    && rm -rf /var/lib/apt/lists/*

# --- AQUÍ INSTALAMOS LAS LIBRERÍAS PARA TODOS ---
# Usamos pip3 install para asegurar que se instalan en la versión correcta
RUN pip3 install langchain langchain-community pypdf requests

WORKDIR /app

# Esto asegura que el contenedor se quede abierto esperando órdenes
CMD ["bash"]