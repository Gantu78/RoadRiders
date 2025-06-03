🚴‍♂️ RoadRiders
RoadRiders es una moderna aplicación web para ciclistas y entusiastas del deporte al aire libre. Permite registrar rutas GPS en tiempo real, visualizar recorridos en un mapa interactivo, gestionar sesiones de usuario y consultar estadísticas personales. Todo esto con una interfaz atractiva y funcional, construida con React, Leaflet, Tailwind CSS y respaldada por Supabase.
🌍 Disponible en línea: https://roadriders.vercel.app/
📑 Índice

Proyecto Académico
Autores
Características Principales
Tecnologías Utilizadas
Estructura del Proyecto
Requisitos Previos
Instalación y Puesta en Marcha
Base de Datos en Supabase
Cómo Usar la App
Despliegue en Vercel
Contribuciones
Contacto


🎓 Proyecto Académico
Este proyecto fue desarrollado como parte del curso Fundamentos de Software en laPontificia Universidad Javeriana, bajo la dirección del profesor Jaime Chavarriaga.

👥 Autores

Samuel Gantiva
Carlos Daniel Güiza
Carlos Pinzón
Daniel Hoyos


✨ Características Principales

🔐 Autenticación de usuarios: Registro, inicio de sesión, recuperación y restablecimiento de contraseña.
📍 Seguimiento GPS en tiempo real usando la API de geolocalización del navegador.
🗺️ Mapa interactivo con visualización del recorrido mediante una línea roja (Leaflet).
🧮 Cálculo automático de distancia y duración al finalizar una ruta.
📑 Panel lateral con historial de rutas completadas y sus detalles.
📦 Almacenamiento seguro y eficiente con Supabase (PostgreSQL).
📱 Diseño responsive gracias a Tailwind CSS para una experiencia móvil y de escritorio sin fallos.


🧱 Tecnologías Utilizadas



Tecnología
Propósito



React
Interfaz de usuario dinámica


Tailwind CSS
Estilos modernos y responsivos


Leaflet
Visualización geográfica de rutas


Supabase
Backend y base de datos en la nube


Vercel
Despliegue y hosting de la aplicación



🗂️ Estructura del Proyecto
frontend/
├── api/                    # Funciones serverless (auth, tracking, rutas)
│   ├── auth/
│   │   ├── login.js
│   │   └── register.js
│   ├── save-route.js
│   └── track.js
├── src/
│   ├── components/         # Componentes React (Login, Tracking, etc.)
│   ├── context/            # Contexto de autenticación
│   ├── App.js             # Enrutador principal
│   ├── index.js           # Punto de entrada
│   └── index.css          # Estilos globales
├── public/                 # Archivos estáticos
├── .env                   # Variables de entorno
└── ...


⚙️ Requisitos Previos

Node.js (v16 o superior)
Cuenta en Supabase
Cuenta en Vercel (opcional para despliegue)
Navegador compatible con geolocalización


🚀 Instalación y Puesta en Marcha

Clona el repositorio:
git clone https://github.com/gantu78/roadriders.git
cd roadriders


Instala dependencias:
npm install


Configura las variables de entorno:Crea un archivo .env en la raíz con lo siguiente:
SUPABASE_URL=tu_url_de_supabase
SUPABASE_KEY=tu_api_key_de_supabase
RESEND_API_KEY=tu_api_key_de_resend
JWT_SECRET=tu_secreto_jwt


Ejecuta la app en desarrollo:
npm run dev

Accede a http://localhost:3000 desde tu navegador.



🛠️ Base de Datos en Supabase
Crea las siguientes tablas en tu proyecto Supabase:
users

id (UUID)
email (varchar)
password (varchar)
created_at (timestamp)

completed_routes

id (int)
user_id (foreign key)
route_data (jsonb)
distance (float)
duration (int)
created_at (timestamp)

tracks (opcional para seguimiento en vivo)

id (int)
user_id (foreign key)
location (geometry)
created_at (timestamp)


🧪 Cómo Usar la App

Regístrate o inicia sesión.
Ve a la sección de seguimiento.
Haz clic en "Start Tracking" y comienza tu recorrido.
Controla tu sesión con "Pause", "Resume" o "Finalize".
Consulta tus rutas finalizadas en el panel lateral con sus estadísticas.


☁️ Despliegue en Vercel

Sube tu proyecto a GitHub.
Conecta tu repositorio desde Vercel.
Añade las variables de entorno en Settings > Environment Variables.
¡Despliega y listo!


🤝 Contribuciones
¿Te gustaría colaborar? ¡Son bienvenidas! Haz un fork, crea una rama, haz tus cambios y envía un Pull Request.

📬 Contacto
¿Tienes dudas o sugerencias? Abre un issue en GitHub o contáctanos directamente.
Hecho con ❤️ para los amantes del ciclismo, el software libre y la innovación universitaria.
