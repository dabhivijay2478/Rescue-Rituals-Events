import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/configure-app';

const expressApp = express();
let ready = false;

async function bootstrapServer() {
  if (ready) return expressApp;
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
  configureApp(app);
  await app.init();
  ready = true;
  return expressApp;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const server = await bootstrapServer();
  return server(req, res);
}
