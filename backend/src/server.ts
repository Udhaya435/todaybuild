import express from 'express';
import cors from 'cors';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { ENV } from './config/env.js';
import { WebSocketService } from './services/websocket.service.js';

import authRoutes from './routes/auth.routes.js';
import voicemailRoutes from './routes/voicemail.routes.js';
import transcriptionRoutes from './routes/transcription.routes.js';
import aiRoutes from './routes/ai.routes.js';
import greetingRoutes from './routes/greeting.routes.js';
import telephonyRoutes from './routes/telephony.webhooks.js';

const app = express();
const server = http.createServer(app);

// Initialize WebSocket Service for Live Voicemail streaming
const wsService = WebSocketService.getInstance();
wsService.initialize(server);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure public recordings directory exists
const recordingsDir = path.resolve(process.cwd(), 'public', 'recordings');
if (!fs.existsSync(recordingsDir)) {
  fs.mkdirSync(recordingsDir, { recursive: true });
}
app.use('/recordings', express.static(recordingsDir));

// Healthcheck
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'NOVA Live Voicemail Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/voicemails', voicemailRoutes);
app.use('/api/transcriptions', transcriptionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/greetings', greetingRoutes);
app.use('/api/webhooks/telephony', telephonyRoutes);

// Start Server
const PORT = ENV.PORT;
server.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 NOVA Live Voicemail Server`);
  console.log(`📡 Listening on http://localhost:${PORT}`);
  console.log(`🎙️ WebSocket ready on ws://localhost:${PORT}/ws`);
  console.log(`=========================================`);
});
