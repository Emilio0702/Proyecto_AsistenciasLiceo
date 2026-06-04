GUÍA DE DESPLIEGUE: Proyecto RegistroColacion

  Esta guía describe cómo desplegar la aplicación en un servidor VPS (DigitalOcean Droplet).

  ---

  1. Escenario: Droplet Nuevo (Preparación desde cero)

  Si el servidor está vacío, sigue estos pasos:

   1. Actualizar Servidor:
   1     sudo apt update && sudo apt upgrade -y
   2. Instalar Docker:

   1     curl -fsSL https://get.docker.com -o get-docker.sh
   2     sudo sh get-docker.sh
   3. Instalar Docker Compose:
   1     sudo apt install docker-compose-plugin -y
   4. Clonar proyecto:

   1     git clone https://github.com/Emilio0702/Proyecto-PIF-copilot.git
   2     cd Proyecto-PIF-copilot
   5. Configurar variables:
       * Crea el archivo .env en el backend: nano backend/.env
       * Pega las credenciales de producción (Base de datos, JWT, etc.).
   6. Desplegar:

   1     docker compose up -d --build

  ---

  2. Escenario: Droplet Existente (Del cliente)

  Si el cliente ya tiene aplicaciones funcionando, debes tener mucho cuidado para no romper nada:

   1. Auditoría (Paso CRÍTICO):
       * Verifica qué puertos están ocupados: sudo netstat -tulpn | grep LISTEN
       * Si otro servicio ya usa el puerto 3000 (tu backend) o 5432 (tu DB), debes cambiar los puertos en el archivo docker-compose.yml de tu proyecto antes de desplegar.
   2. Verificar Docker:
       * Comprueba si Docker está instalado: docker --version
       * Comprueba qué contenedores hay: docker ps
       * Si no hay Docker, instálalo siguiendo los pasos del Escenario 1.
   3. Despliegue Seguro:
       * Clona el proyecto en una carpeta nueva (ej: /opt/registro-colacion).
       * No ejecutes docker-compose directamente si el cliente tiene otros servicios.
       * Asegúrate de que tus nombres de contenedores en docker-compose.yml (serviterra_db, serviterra_backend) no colisionen con otros nombres existentes (docker ps -a para listar
         todos).
   4. Ejecución:

   1     cd /opt/registro-colacion
   2     docker compose up -d --build

  ---
  3. PROPUESTA DE INFRAESTRUCTURA Y ALOJAMIENTO
  Proyecto: Sistema de Gestión de Registro de Colaciones  
  Objetivo: Garantizar la máxima disponibilidad, seguridad y soporte para la operación de la empresa.

  ---

  1. ¿Qué es Railway?
  Para el funcionamiento continuo del sistema, hemos seleccionado Railway, una plataforma de infraestructura moderna líder en el mercado. A diferencia de un servidor tradicional (que
  requiere mantenimiento manual complejo), Railway nos permite:

   * Disponibilidad 99.99%: Asegurar que el sistema esté funcionando las 24 horas del día.
   * Gestión Automática: La plataforma se encarga de las actualizaciones de seguridad y parches del servidor automáticamente.
   * Escalabilidad: Si el negocio crece y el flujo de camioneros aumenta, el sistema se adapta automáticamente a la nueva demanda sin interrupciones.

  ---

  2. Elección del Nivel de Servicio (Plan Pro)
  Hemos determinado que la opción más adecuada para su empresa es el Plan Pro de Railway. Esta elección se basa en los siguientes beneficios estratégicos para su negocio:

   * Soporte Prioritario: En caso de cualquier incidencia técnica, contamos con canales de atención prioritarios por parte de los ingenieros de Railway.
   * Seguridad de Datos (Logs): El Plan Pro almacena un historial detallado de actividad durante 30 días (vs 7 días del plan básico). Esto es crucial para realizar auditorías,
     seguimiento de registros y depuración rápida de cualquier anomalía.
   * Estabilidad Superior: Ofrece un objetivo de disponibilidad más alto, garantizando que el sistema sea el pilar tecnológico más fiable para su operación diaria.

  ---

  3. Modelo de Costos
  Railway opera bajo un modelo transparente de pago por consumo, lo cual es ideal para su empresa:

   * Flexibilidad: Usted no tiene costos fijos altos. La plataforma ajusta los recursos según el uso real del sistema.
   * Transparencia: El Plan Pro tiene un consumo base que cubre los recursos de alta disponibilidad, soporte y seguridad mencionados anteriormente. Si el sistema requiere recursos
     adicionales debido a un crecimiento en el volumen de registros, el costo se ajusta proporcionalmente al uso.

  ---

  4. ¿Qué significa esto para su empresa?
  Al elegir esta infraestructura, usted está contratando:

   1. Tranquilidad: Usted se enfoca en gestionar su negocio, mientras nosotros nos encargamos de que la tecnología "simplemente funcione".
   2. Protección de su información: Su base de datos está protegida bajo estándares industriales.
   3. Capacidad de crecimiento: El sistema está preparado para escalar junto con el crecimiento de su empresa sin necesidad de migraciones ni nuevas configuraciones.

  ---

  Conclusión:
  Recomendamos avanzar con la implementación de Railway (Plan Pro) para asegurar que la inversión en tecnología tenga el respaldo de una plataforma de grado empresarial, diseñada
  para negocios que requieren una operación ininterrumpida y segura.

  Notas de Producción (Para ambos casos)

   * Persistencia: Asegúrate siempre de que el volumes: en docker-compose.yml apunte a una carpeta en el servidor (ej: ./postgres_data:/var/lib/postgresql/data) para que los datos
     sobrevivan a los reinicios.
   * Seguridad: Una vez desplegado, configura el firewall de DigitalOcean (UFW) para permitir solo los puertos necesarios (SSH, HTTP, HTTPS) y cerrar el resto.
   * Variables de entorno: Nunca subas el archivo .env con contraseñas reales al repositorio de GitHub. Debes crearlo manualmente en el servidor después de clonar el código.