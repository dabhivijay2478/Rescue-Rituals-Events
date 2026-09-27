import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const payloadPath = path.join(root, '.vercel-upload/deploy-backend-request.json');
const payload = JSON.parse(fs.readFileSync(payloadPath, 'utf8'));

payload.projectSettings = {
  framework: 'nestjs',
  buildCommand: 'prisma generate && prisma migrate deploy && nest build',
  installCommand: 'npm install',
  nodeVersion: '22.x',
};

const out = {
  teamId: 'team_W7VIeKlPs8cO6WydXFylHOdW',
  skipAutoDetectionConfirmation: '1',
  forceNew: '1',
  requestBody: payload,
};

process.stdout.write(JSON.stringify(out));
