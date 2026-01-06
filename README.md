# 🏙️ UrbanInk | Modern E-Commerce Platform

![UrbanInk Banner](https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&h=400&fit=crop)
<div align="center">

[![Angular](https://img.shields.io/badge/Angular-21.0-dd0031?style=for-the-badge&logo=angular)](https://angular.io/)
[![.NET](https://img.shields.io/badge/.NET-10.0-512bd4?style=for-the-badge&logo=dotnet)](https://dotnet.microsoft.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ed?style=for-the-badge&logo=docker)](https://www.docker.com/)
[![Nginx](https://img.shields.io/badge/Nginx-Proxy-009639?style=for-the-badge&logo=nginx)](https://nginx.org/)

</div>

> **UrbanInk** es una plataforma de comercio electrónico Fullstack diseñada con tecnologías de última generación. Implementa una arquitectura robusta contenerizada, autenticación segura y una experiencia de usuario fluida mediante Signals y Standalone Components.

🌐 **Live Demo:** [https://urbanink.es](https://urbanink.es)

---

## 🚀 Características Principales

### 🛒 Experiencia de Usuario (Frontend)
* **Arquitectura Moderna:** Construido con **Angular 21**, utilizando componentes Standalone y la nueva API de **Signals** para una reactividad granular.
* **Diseño Responsive:** Interfaz adaptativa y moderna estilizada con Tailwind CSS.
* **Catálogo Dinámico:** Filtrado, búsqueda y paginación de productos en tiempo real.
* **Gestión de Estado:** Manejo eficiente del carrito de compras y sesiones de usuario.

### ⚙️ Potencia y Seguridad (Backend)
* **High Performance:** API RESTful construida sobre **.NET 10** (Preview/Latest), aprovechando las últimas mejoras de rendimiento del CLR.
* **Persistencia de Datos:** Uso de **Entity Framework Core** con migraciones automáticas sobre **PostgreSQL**.
* **Seguridad:** Autenticación robusta mediante **JWT (JSON Web Tokens)** y hashing de contraseñas.
* **Gestión de Archivos:** Subida y servicio de imágenes estáticas optimizado.

### 🐳 DevOps & Infraestructura
* **Dockerizado:** Entorno de desarrollo y producción idénticos gracias a Docker y Docker Compose.
* **Reverse Proxy:** Implementación de **Nginx** como puerta de entrada para gestión de rutas y SSL.
* **VPS Deployment:** Desplegado en servidor Linux (Ubuntu) con gestión de secretos y volúmenes persistentes.

---

## 🛠️ Tech Stack

| Área | Tecnología | Detalles |
| :--- | :--- | :--- |
| **Frontend** | **Angular 21** | Standalone Components, Signals, RxJS, TypeScript |
| **Backend** | **.NET 10** | ASP.NET Core Web API, C# 13, EF Core |
| **Base de Datos** | **PostgreSQL** | Relational DB, Alpine Image |
| **Contenedores** | **Docker** | Multi-stage builds, Docker Compose v2 |
| **Web Server** | **Nginx** | Reverse Proxy, SSL Termination (Let's Encrypt) |
| **OS** | **Linux Ubuntu** | VPS Hosting Environment |

---

## 📸 Capturas de Pantalla

| Home Page | Carrito |
|:---:|:---:|
| ![Home Placeholder](/assets/home.png) | ![Detail Placeholder](/assets/carrito.png) |

---

## 📂 Estructura del Proyecto (Monorepo)

```bash
/UrbanInk-Project
├── /UrbanInk.Api         # Backend .NET 10
│   ├── Controllers/      # API Endpoints
│   ├── Data/             # EF Core Context & Migrations
│   ├── Models/           # Entidades de DB
│   └── Dockerfile        # Multi-stage build para .NET
├── /urbanink-front       # Frontend Angular 21
│   ├── src/              # Código fuente SPA
│   ├── nginx.conf        # Configuración interna del servidor web
│   └── Dockerfile        # Build Node.js -> Nginx Alpine
├── /assets               # Capturas de pantalla para documentación
└── docker-compose.yml    # Orquestación de servicios (App, DB, Proxy)

```

## ⚡ Instalación y Despliegue Local

¡Ejecutar este proyecto es muy sencillo gracias a Docker! No necesitas instalar .NET ni Node.js en tu máquina local si usas contenedores.

### Prerrequisitos
* [Docker Desktop](https://www.docker.com/products/docker-desktop) instalado.
* Git.

### Pasos

1.  **Clonar el repositorio:**
    ```bash
    git clone [https://github.com/VictorHPonce/UrbanInk-Project.git](https://github.com/VictorHPonce/UrbanInk-Project.git)
    cd UrbanInk-Project
    ```

2.  **Configurar Variables de Entorno:**
    Crea un archivo `.env` en la raíz del proyecto basándote en el ejemplo:
    ```bash
    # Archivo .env
    DB_USER=admin
    DB_PASSWORD=secret_password
    DB_NAME=urbanink_db
    ```

3.  **Desplegar con Docker Compose:**
    ```bash
    docker compose up -d --build
    ```

4.  **¡Listo!** Accede a la aplicación:
    * **Frontend:** `http://localhost:4200`
    * **API Swagger:** `http://localhost:8081/swagger` (Si está habilitado en prod) o prueba los endpoints directamente.

---

## 🔐 Variables de Entorno

Para desplegar en producción, asegúrate de configurar las siguientes variables en tu servidor:

| Variable | Descripción |
| :--- | :--- |
| `DB_USER` | Usuario de PostgreSQL |
| `DB_PASSWORD` | Contraseña segura de la base de datos |
| `DB_NAME` | Nombre de la base de datos (ej: urbanink_db) |
| `ConnectionStrings__Default` | (Auto-generado en Docker) Cadena de conexión para .NET |

---

## 🤝 Contribución

Este proyecto es parte de mi portafolio profesional. Sin embargo, las sugerencias y Pull Requests son bienvenidos para mejorar la arquitectura o añadir features.

1.  Haz un Fork del proyecto.
2.  Crea una rama (`git checkout -b feature/AmazingFeature`).
3.  Haz Commit (`git commit -m 'Add some AmazingFeature'`).
4.  Push a la rama (`git push origin feature/AmazingFeature`).
5.  Abre un Pull Request.

---

## 👤 Autor

**Víctor Ponce** - *Fullstack Developer*

* 💼 **Portafolio:** [Ver mis proyectos](https://urbanink.es/portfolio)
* 🐙 **GitHub:** [@VictorHPonce](https://github.com/VictorHPonce)

---

Give a ⭐️ if you like this project!