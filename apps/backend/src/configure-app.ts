import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/** swagger-ui-dist@5.18.2 — matches @nestjs/swagger dependency */
const SWAGGER_UI_CDN =
  'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.18.2';

function registerCdnSwaggerUi(app: INestApplication, docsPath: string) {
  const openApiUrl = `/${docsPath}-json`;
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Events API — Swagger</title>
  <link rel="stylesheet" href="${SWAGGER_UI_CDN}/swagger-ui.css" />
  <link rel="icon" type="image/png" href="${SWAGGER_UI_CDN}/favicon-32x32.png" sizes="32x32" />
</head>
<body>
<div id="swagger-ui"></div>
<script src="${SWAGGER_UI_CDN}/swagger-ui-bundle.js" crossorigin></script>
<script src="${SWAGGER_UI_CDN}/swagger-ui-standalone-preset.js" crossorigin></script>
<script>
window.onload = function () {
  window.ui = SwaggerUIBundle({
    url: '${openApiUrl}',
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
    plugins: [SwaggerUIBundle.plugins.DownloadUrl],
    layout: 'StandaloneLayout',
  });
};
</script>
</body>
</html>`;

  const http = app.getHttpAdapter();
  const serve = (_req: unknown, res: { type: (t: string) => void; send: (b: string) => void }) => {
    res.type('text/html');
    res.send(html);
  };
  http.get(`/${docsPath}`, serve);
  http.get(`/${docsPath}/`, serve);
  http.get(`/${docsPath}/index.html`, serve);
}

export function configureApp(app: INestApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const defaultOrigins =
    'http://localhost:3001,https://rescue-rituals-azure.vercel.app';
  const webOrigin = process.env.WEB_ORIGIN ?? defaultOrigins;
  app.enableCors({
    origin: webOrigin.split(',').map((o) => o.trim()).filter(Boolean),
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Events API')
    .setDescription('Event management and RSVP API with waitlist support')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    ui: false,
    raw: ['json'],
  });
  registerCdnSwaggerUi(app, 'docs');
}
