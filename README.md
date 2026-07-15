# Diego Chatbot Front

Frontend en Vue 3 para el chat de Diego Chatbot. La app permite enviar mensajes a la API, mostrar respuestas del bot y mantener una conversación con sesión persistente.

## Requisitos

- Node.js 16 o superior
- npm

## Instalación

```bash
npm install
```

## Scripts disponibles

```bash
npm run serve
```
Inicia el entorno de desarrollo con hot reload.

```bash
npm run build
```
Genera la versión de producción.

```bash
npm run lint
```
Ejecuta ESLint sobre el código.

```bash
npm run test:unit
```
Ejecuta las pruebas unitarias.

## Variables de entorno

El frontend usa `VUE_APP_*` para configurar las URLs del backend y de assets.

```bash
VUE_APP_BACK_URL=https://example.com
VUE_APP_CHATTERWILLY_BACK_URL=https://chatbot.example.com
VUE_APP_ASSET_URL=https://example.com/assets
```

### Regla para `VUE_APP_BACK_URL`

`VUE_APP_BACK_URL` debe contener solo el origen de la API, sin `/api` al final.

Correcto:

```bash
VUE_APP_BACK_URL=https://chatterwily.diegoarturosilvarojas.ovh
```

También se acepta con barra final:

```bash
VUE_APP_BACK_URL=https://chatterwily.diegoarturosilvarojas.ovh/
```

La aplicación normaliza el valor automáticamente para evitar URLs duplicadas como `//api/conversation`.

### Regla para `VUE_APP_CHATTERWILLY_BACK_URL`

`VUE_APP_CHATTERWILLY_BACK_URL` es opcional y se usa tanto en desarrollo como en producción. Si no se define, la app usa la URL remota por defecto del chatbot.

El frontend siempre llama al origen remoto configurado. Para que funcione desde `localhost` y desde producción, la API debe permitir CORS para ambos orígenes.

## Selección de asistente

La interfaz permite alternar entre dos asistentes:

- `Diego`, que usa la URL base configurada en `VUE_APP_BACK_URL` o el valor por defecto del proyecto.
- `Chatterwilly`, que usa la URL configurada por `VUE_APP_CHATTERWILLY_BACK_URL` en todos los entornos, con el valor remoto por defecto `https://chatbot.diegoarturosilvarojas.ovh`.

Cuando cambias de asistente, la sesión se reinicia para evitar mezclar conversaciones entre backends.

## Configuración

El proyecto usa Vue CLI. La configuración principal está en [`vue.config.js`](./vue.config.js).

## Estructura básica

- `src/components/`: componentes del chat
- `src/services/`: cliente HTTP y utilidades compartidas
- `public/`: plantilla HTML y estáticos públicos
