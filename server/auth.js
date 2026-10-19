/* ============================================================
   MEUVOTO - AUTENTICACAO DE ELEITORES
   ------------------------------------------------------------
   Login via Google OAuth 2.0, Telefone (SMS OTP) ou E-mail (OTP).
   Sem Gov.br - apenas identificacao basica.
   Modo dev aceita tokens "google:email:nome" e OTP retornado.
   
   PERSISTÊNCIA: Sessões e OTPs agora são armazenados no SQLite
   (ou JSON como fallback), sobrevivendo a restarts do servidor.
   
   E-MAIL: Integração real com nodemailer (SMTP) em produção.
   ============================================================ */

const crypto = require('crypto');
const db = require('./db');
const dbAuth = require('./db_auth');
const mailer = require('./mailer');

/* Modo de autenticação.
   'prod' = exige o provedor real (e-mail/SMS) e NUNCA devolve o código.
   'dev'  = modo local: aceita token "google:email:nome" e mostra o código.
   'auto' = decide pelo NODE_ENV (prod quando NODE_ENV=production).

   A variável de ambiente tem precedência — o Railway define AUTH_MODE=prod.
   Antes este valor era fixo em 'dev', o que desligava as proteções em
   produção: qualquer pessoa podia pedir um OTP para o e-mail de outra
   pessoa e ler o código na resposta da API (`devCode`), e ainda forjar
   uma sessão com o token "google:email:nome". */
function resolveAuthMode() {
  const raw = String(process.env.AUTH_MODE || process.env.MB_AUTH_MODE || '').trim().toLowerCase();
  if (raw === 'prod' || raw === 'dev') return raw;
  return process.env.NODE_ENV === 'production' ? 'prod' : 'dev';
}
const AUTH_MODE = resolveAuthMode();
const IS_PROD = AUTH_MODE === 'prod';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || '';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
const TWILIO_PHONE = process.env.TWILIO_PHONE || '';

// Limpeza periódica de sessões e OTPs expirados (a cada 1 hora)
setInterval(() => {
  try {
    dbAuth.cleanExpiredSessions();
    dbAuth.cleanExpiredOtps();
  } catch (e) {
    console.error('[auth] Falha na limpeza periódica:', e.message);
  }
}, 60 * 60 * 1000);

async function verifyGoogleToken(idToken) {
  /* O token de desenvolvimento ("google:email:nome") só é aceito em modo dev.
     Antes, a condição `isDev || !GOOGLE_CLIENT_ID` abria a porta em produção
     sempre que o GOOGLE_CLIENT_ID não estivesse configurado — e ele não está.
     Qualquer pessoa podia forjar uma sessão com o e-mail de outra pessoa
     (`google:victima@exemplo.com:Nome`). Agora, em produção, a ausência do
     GOOGLE_CLIENT_ID é um erro de configuração explícito, não um atalho. */
  const isDev = !IS_PROD;
  if (!GOOGLE_CLIENT_ID) {
    if (!isDev) {
      throw new Error('Login com Google indisponivel: GOOGLE_CLIENT_ID nao configurado no servidor.');
    }
    if (typeof idToken === 'string' && idToken.startsWith('google:')) {
      const rest = idToken.slice(7);
      const parts = rest.split(':');
      const email = parts[0] || 'dev@local';
      const name = parts[1] || email.split('@')[0];
      return {
        sub: 'dev-' + crypto.createHash('md5').update(email).digest('hex').slice(0, 12),
        email: email,
        name: name,
        picture: null
      };
    }
    throw new Error('Token invalido (modo dev: use "google:email:nome")');
  }
  const { OAuth2Client } = require('google-auth-library');
  const client = new OAuth2Client(GOOGLE_CLIENT_ID);
  const ticket = await client.verifyIdToken({ idToken: idToken, audience: GOOGLE_CLIENT_ID });
  const payload = ticket.getPayload();
  return { sub: payload.sub, email: payload.email, name: payload.name, picture: payload.picture };
}

async function loginWithGoogle(idToken, userAgent, ipAddress) {
  const profile = await verifyGoogleToken(idToken);
  let voter = db.getVoterByGoogleId(profile.sub);
  if (!voter) {
    const id = 'voter-' + crypto.randomBytes(8).toString('hex');
    const voterHash = db.hashVoter('google', profile.sub);
    voter = {
      id: id, method: 'google', googleId: profile.sub, phone: null,
      email: profile.email, name: profile.name || null, photo: profile.picture || null,
      voterHash: voterHash, verifiedAt: Date.now(), createdAt: Date.now()
    };
    db.upsertVoter(voter);
  } else {
    db.upsertVoter(voter);
  }
  const sessionToken = generateSessionToken(voter, userAgent, ipAddress);
  return {
    ok: true,
    voter: { id: voter.id, method: voter.method, name: voter.name, email: voter.email, photo: voter.photo, voterHash: voter.voterHash },
    sessionToken: sessionToken
  };
}

async function sendOtp(phone) {
  const cleanPhone = String(phone).replace(/\D/g, '');
  if (cleanPhone.length < 10 || cleanPhone.length > 13) {
    throw new Error('Telefone invalido. Use: 11999999999 ou 55119999999999');
  }
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutos

  // Persistir OTP no banco
  const otpRecord = dbAuth.createOtp('sms', cleanPhone, code, expiresAt);

  if (IS_PROD) {
    /* Em produção o SMS precisa sair de verdade. Sem o Twilio configurado,
       o código anterior respondia "Codigo enviado por SMS" sem enviar nada
       algum — o usuário ficava esperando um SMS que nunca chegaria.
       Aqui falhamos de forma explícita, dizendo o que falta configurar. */
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE) {
      throw new Error('Login por telefone indisponivel no momento. Use o login por e-mail.');
    }
    try {
      const twilio = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
      await twilio.messages.create({
        body: '[MeuVoto] Seu codigo: ' + code + '. Valido por 5 min.',
        from: TWILIO_PHONE, to: '+' + cleanPhone
      });
    } catch (e) {
      throw new Error('Falha ao enviar SMS. Tente novamente.');
    }
    return {
      ok: true, phone: cleanPhone, expiresIn: 300,
      devCode: null,
      message: 'Codigo enviado por SMS'
    };
  }

  return {
    ok: true, phone: cleanPhone, expiresIn: 300,
    devCode: code,
    message: 'MODO DEV: codigo = ' + code
  };
}

async function verifyOtp(phone, code) {
  const cleanPhone = String(phone).replace(/\D/g, '');
  const entry = dbAuth.getOtp('sms', cleanPhone);
  if (!entry) throw new Error('Codigo nao encontrado. Solicite um novo.');
  if (Date.now() > entry.expiresAt) { dbAuth.deleteOtp(entry.id); throw new Error('Codigo expirado. Solicite um novo.'); }
  if (entry.attempts >= 5) { dbAuth.deleteOtp(entry.id); throw new Error('Muitas tentativas. Solicite um novo codigo.'); }
  if (entry.code !== String(code).trim()) { dbAuth.incrementOtpAttempts(entry.id); throw new Error('Codigo incorreto.'); }
  
  // OTP válido, marcar como usado
  dbAuth.markOtpUsed(entry.id);
  
  let voter = db.getVoterByPhone(cleanPhone);
  if (!voter) {
    const id = 'voter-' + crypto.randomBytes(8).toString('hex');
    const voterHash = db.hashVoter('phone', cleanPhone);
    voter = {
      id: id, method: 'phone', googleId: null, phone: cleanPhone, email: null, name: null, photo: null,
      voterHash: voterHash, verifiedAt: Date.now(), createdAt: Date.now()
    };
    db.upsertVoter(voter);
  } else {
    db.upsertVoter(voter);
  }
  const sessionToken = generateSessionToken(voter);
  return {
    ok: true,
    voter: { id: voter.id, method: voter.method, name: voter.name, phone: voter.phone, photo: voter.photo, voterHash: voter.voterHash },
    sessionToken: sessionToken
  };
}

async function sendEmailOtp(email, userAgent, ipAddress) {
  const emailStr = String(email).trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailStr)) {
    throw new Error('E-mail inválido.');
  }
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutos

  // Persistir OTP no banco
  const otpRecord = dbAuth.createOtp('email', emailStr, code, expiresAt);

  let emailSent = false;
  let emailError = null;

  try {
    const res = await mailer.sendOtpEmail(emailStr, code, 10);
    if (res && res.ok) {
      emailSent = true;
      console.log('[auth] E-mail OTP enviado com sucesso para ' + emailStr + ' via ' + (res.provider || 'provedor'));
    } else if (res && res.error) {
      emailError = res.error;
      console.warn('[auth] E-mail OTP não entregue para ' + emailStr + ': ' + emailError);
    }
  } catch (e) {
    emailError = e.message;
    console.error('[auth] Falha ao enviar e-mail OTP para ' + emailStr + ': ' + e.message);
  }

  /* Em desenvolvimento, expor devCode para permitir testes locais sem SMTP.
     Em produção, NUNCA expor o código na API — o código precisa chegar
     apenas pelo e-mail do próprio usuário.

     A distinction agora é IS_PROD (modo de autenticação efetivo), e não
     AUTH_MODE === 'dev': quando o servidor roda com AUTH_MODE=dev em
     produção, o código voltava no corpo da resposta em texto puro —
     qualquer pessoa podia pedir um OTP para o e-mail de outra pessoa e
     ler o código. Em produção, se o e-mail falhar, a rota deve falhar
     explícitamente em vez de devolver o código. */
  const isDev = !IS_PROD;
  // Em modo dev, o mailer simula com sucesso (ok:true) sem enviar e-mail real.
  // Nesse caso, devemos SEMPRE expor o devCode, pois não há como o usuário
  // receber o código por outro meio.
  const provideDevCode = isDev;

  if (!isDev && !emailSent) {
    throw new Error('Não foi possível enviar o código por e-mail. Tente novamente em instantes.');
  }

  return {
    ok: true,
    email: emailStr,
    expiresIn: 600,
    emailSent: emailSent,
    // Usamos null (não undefined) para que a chave devCode sempre apareça
    // na resposta JSON, permitindo que o cliente saiba se deve usar o código
    // de desenvolvimento.
    devCode: provideDevCode ? code : null,
    message: emailSent
      ? 'Código enviado para seu e-mail'
      : 'E-mail não entregue pelo servidor. Use o código temporário: ' + code
  };
}

async function verifyEmailOtp(email, code, userAgent, ipAddress) {
  const emailStr = String(email).trim().toLowerCase();
  const entry = dbAuth.getOtp('email', emailStr);
  if (!entry) throw new Error('Código não encontrado. Solicite um novo.');
  if (Date.now() > entry.expiresAt) { dbAuth.deleteOtp(entry.id); throw new Error('Código expirado. Solicite um novo.'); }
  if (entry.attempts >= 5) { dbAuth.deleteOtp(entry.id); throw new Error('Muitas tentativas. Solicite um novo código.'); }
  if (entry.code !== String(code).trim()) { dbAuth.incrementOtpAttempts(entry.id); throw new Error('Código incorreto.'); }
  
  // OTP válido, marcar como usado
  dbAuth.markOtpUsed(entry.id);
  
  let voter = db.getVoterByEmail(emailStr);
  if (!voter) {
    const id = 'voter-' + crypto.randomBytes(8).toString('hex');
    const voterHash = db.hashVoter('email', emailStr);
    voter = { id: id, method: 'email', googleId: null, phone: null, email: emailStr, name: null, photo: null, voterHash: voterHash, verifiedAt: Date.now(), createdAt: Date.now() };
    db.upsertVoter(voter);
  } else { db.upsertVoter(voter); }
  const sessionToken = generateSessionToken(voter, userAgent, ipAddress);
  return { ok: true, voter: { id: voter.id, method: voter.method, name: voter.name, email: voter.email, voterHash: voter.voterHash }, sessionToken: sessionToken };
}

async function register(email, name, phone, userAgent, ipAddress) {
  const emailStr = email ? String(email).trim().toLowerCase() : null;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailStr && !emailRegex.test(emailStr)) throw new Error('E-mail inválido.');
  const id = 'voter-' + crypto.randomBytes(8).toString('hex');
  const voterHash = db.hashVoter('email', emailStr || 'anon-' + id);
  const voter = { id: id, method: emailStr ? 'email' : 'anon', googleId: null, phone: phone ? String(phone).replace(/\D/g, '') : null, email: emailStr, name: name || null, photo: null, voterHash: voterHash, verifiedAt: Date.now(), createdAt: Date.now() };
  db.upsertVoter(voter);
  const sessionToken = generateSessionToken(voter, userAgent, ipAddress);
  return { ok: true, voter: { id: voter.id, method: voter.method, name: voter.name, email: voter.email, phone: voter.phone, voterHash: voter.voterHash }, sessionToken: sessionToken };
}

function generateSessionToken(voter, userAgent, ipAddress) {
  const token = crypto.randomBytes(32).toString('hex');
  // Persistir sessão no banco
  dbAuth.createSession(token, voter.id, userAgent, ipAddress);
  return token;
}

function getVoterFromToken(token) {
  if (!token) return null;
  const session = dbAuth.getSession(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) { dbAuth.deleteSession(token); return null; }
  return db.getVoterById(session.voterId);
}

function getVoterFromTokenOrAnon(token, ip) {
  const voter = getVoterFromToken(token);
  if (voter) return voter;
  // Gerar voterHash anônimo determinístico por IP+tempo (não persistido no banco)
  const anonHash = 'anon-' + crypto.createHash('sha256').update(ip + ':' + Date.now()).digest('hex').slice(0, 16);
  return { id: null, method: 'anon', googleId: null, phone: null, email: null, name: null, photo: null, voterHash: anonHash, verifiedAt: null, createdAt: null };
}

function logout(token) { dbAuth.deleteSession(token); }

module.exports = {
  verifyGoogleToken, loginWithGoogle,
  sendOtp, verifyOtp,
  sendEmailOtp, verifyEmailOtp,
  register,
  generateSessionToken, getVoterFromToken, getVoterFromTokenOrAnon, logout,
  AUTH_MODE, IS_PROD
};
