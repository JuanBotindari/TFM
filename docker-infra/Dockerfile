# Usamos Ubuntu 22.04 como base
FROM ubuntu:22.04

# Evitar interacciones manuales durante la instalación
ENV DEBIAN_FRONTEND=noninteractive

# Instalamos Python (para RAG) y herramientas básicas
RUN apt-get update && apt-get install -y \
    curl \
    python3 \
    python3-pip \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
CMD ["bash"]