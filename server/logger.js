/* ============================================================
   MEUVOTO — Logger Persistente
   ------------------------------------------------------------
   Escrita de logs em stdout (console) e, quando habilitado,
   em arquivo JSONL em server/data/logs/app.log para rastreamento
   de falhas de requisição sem precisar rodar testes manuais.

   Uso:
     const log = require('./logger');
     log.info('servidor subiu', { port: 8080 });
     log.error('falha ao buscar deputados', { err: e.message, route: '/api/deputados' });

   Variáveis de ambiente:
     LOG_FILE=1      → habilita log em arquivo (default: desligado em dev)
     LOG_LEVEL=warn  → filtra níveis: debug < info < warn < error
     LOG_DIR=caminho → diretorio dos logs (default: server/data/logs)
   ============================================================ */

const fs = require('fs');
const path = require('path');

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const LOG_LEVEL = LEVELS[process.env.LOG_LEVEL?.toLowerCase()] ?? LEVELS.info;
const LOG_FILE_ENABLED = process.env.LOG_FILE === '1' || process.env.LOG_FILE === 'true';
const LOG_DIR = process.env.LOG_DIR || path.join(__dirname, 'data', 'logs');
const LOG_PATH = path.join(LOG_DIR, 'app.log');
// Rotação: quando o arquivo atingir MAX_SIZE_BYTES, rotaciona para .1, .2, ...
// Mantém até MAX_FILES arquivos (incluindo o atual).
const MAX_SIZE_BYTES = parseInt(process.env.LOG_MAX_SIZE, 10) || 10 * 1024 * 1024; // 10 MB
const MAX_FILES = parseInt(process.env.LOG_MAX_FILES, 10) || 5;

let fileHandle = null;
let fileReady = false;
let initError = null;
let bytesWritten = 0;

function ensureFile() {
  if (fileReady || initError) return;
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true });
    // Descobre tamanho atual para inicializar bytesWritten
    try {
      const st = fs.statSync(LOG_PATH);
      bytesWritten = st.size;
    } catch (_) { bytesWritten = 0; }
    fileHandle = fs.openSync(LOG_PATH, 'a');
    fileReady = true;
  } catch (e) {
    initError = e.message;
    // Não quebra o app — fallback para stdout apenas
    console.error('[logger] falha ao abrir arquivo de log:', e.message);
  }
}

/** Rotaciona o arquivo de log se necessário (por tamanho). */
function rotateIfNeeded() {
  if (!fileReady || fileHandle === null) return;
  try {
    if (bytesWritten < MAX_SIZE_BYTES) return;
    // Fecha handle atual
    fs.closeSync(fileHandle);
    fileHandle = null;
    fileReady = false;

    // Rotaciona: apaga o mais antigo, renomeia os demais
    const oldest = `${LOG_PATH}.${MAX_FILES - 1}`;
    try { fs.unlinkSync(oldest); } catch (_) { /* pode não existir */ }
    for (let i = MAX_FILES - 2; i >= 1; i--) {
      const from = `${LOG_PATH}.${i}`;
      const to = `${LOG_PATH}.${i + 1}`;
      try { fs.renameSync(from, to); } catch (_) { /* pode não existir */ }
    }
    // Renomeia o atual para .1
    try { fs.renameSync(LOG_PATH, `${LOG_PATH}.1`); } catch (_) { /* pode não existir */ }

    // Reabre um novo arquivo vazio
    bytesWritten = 0;
    fileHandle = fs.openSync(LOG_PATH, 'a');
    fileReady = true;
  } catch (e) {
    // Fallback: tenta reabrir o arquivo normalmente
    try {
      fileHandle = fs.openSync(LOG_PATH, 'a');
      fileReady = true;
      bytesWritten = 0;
    } catch (_) {
      initError = e.message;
      fileReady = false;
    }
  }
}

function writeLine(level, message, meta) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    msg: String(message),
    ...(meta ? { meta } : {})
  };
  const line = JSON.stringify(entry) + '\n';

  // stdout (sempre, para containers/CI)
  const stamp = entry.ts.split('T')[1].split('.')[0];
  const prefix = `[${stamp}] ${level.toUpperCase().padEnd(5)}`;
  if (level === 'error' || level === 'warn') {
    console.error(prefix, message, meta || '');
  } else {
    console.log(prefix, message, meta || '');
  }

  // arquivo (quando habilitado)
  if (LOG_FILE_ENABLED) {
    ensureFile();
    if (fileReady && fileHandle !== null) {
      try {
        rotateIfNeeded();
        fs.writeSync(fileHandle, line);
        bytesWritten += Buffer.byteLength(line, 'utf8');
      } catch (e) {
        // fallback silencioso — não quebra o app
      }
    }
  }
}

const logger = {
  debug: (msg, meta) => { if (LEVELS.debug >= LOG_LEVEL) writeLine('debug', msg, meta); },
  info: (msg, meta) => { if (LEVELS.info >= LOG_LEVEL) writeLine('info', msg, meta); },
  warn: (msg, meta) => { if (LEVELS.warn >= LOG_LEVEL) writeLine('warn', msg, meta); },
  error: (msg, meta) => { if (LEVELS.error >= LOG_LEVEL) writeLine('error', msg, meta); },

  /** Registra uma requisição HTTP falha (status >= 400) */
  requestError: (req, res, statusCode, error, meta = {}) => {
    logger.error('requisição falha', {
      method: req.method,
      path: req.url,
      status: statusCode,
      error: error || null,
      ip: req.socket?.remoteAddress,
      ...meta
    });
  },

  /** Registra requisição bem-sucedida (opcional, pode ser verboso) */
  request: (req, res, statusCode, meta = {}) => {
    logger.debug('requisição', {
      method: req.method,
      path: req.url,
      status: statusCode,
      ...meta
    });
  },

  /** Chamado no shutdown para fechar o arquivo com segurança */
  close: () => {
    if (fileHandle !== null) {
      try { fs.closeSync(fileHandle); } catch (_) {}
      fileHandle = null;
      fileReady = false;
    }
  },

  /** Caminho do arquivo de log (para health check / monitoramento) */
  path: () => LOG_PATH,
  enabled: () => LOG_FILE_ENABLED,
  dir: () => LOG_DIR,
  /** Tamanho máximo configurado para rotação (bytes) */
  maxSize: () => MAX_SIZE_BYTES,
  /** Número máximo de arquivos retidos na rotação */
  maxFiles: () => MAX_FILES,
  /** Estatísticas do arquivo de log atual */
  stats: () => {
    try {
      const st = fs.statSync(LOG_PATH);
      return { size: st.size, mtime: st.mtimeMs };
    } catch (_) { return null; }
  }
};

module.exports = logger;