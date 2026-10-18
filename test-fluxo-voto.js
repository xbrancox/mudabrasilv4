const { chromium } = require('playwright');
const SITE = 'https://meu-voto.app';
const API = 'https://mudabrasil-production-79eb.up.railway.app';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('PAGEERR: ' + e.message));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push('CONSOLE: ' + msg.text());
  });

  console.log('=== TESTE FLUXO COMPLETO DE VOTACAO ===\n');

  // 1. Testar endpoint de registro anonimo
  console.log('1. Testando registro anonimo...');
  const regResp = await fetch(API + '/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'teste+' + Date.now() + '@exemplo.com',
      nome: 'Teste'
    })
  }).then(r => r.json());
  console.log('   Registro:', JSON.stringify(regResp));

  // 2. Testar envio de OTP
  console.log('\n2. Testando envio de OTP...');
  const otpResp = await fetch(API + '/api/auth/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'teste@exemplo.com'
    })
  }).then(r => r.json()).catch(e => ({ erro: e.message }));
  console.log('   OTP:', JSON.stringify(otpResp));

  // 3. Acessar pagina e tentar votar
  console.log('\n3. Acessando pagina #conferir-voto...');
  await page.goto(SITE + '/#conferir-voto', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForTimeout(3000);

  const conferir = await page.evaluate(() => {
    const el = document.getElementById('sec-conferir');
    const mOnboard = document.getElementById('mOnboard');
    const btnConferir = el ? el.querySelector('button[onclick*="conferir()"]') : null;
    return {
      conferirOn: el ? el.classList.contains('on') : false,
      mOnboardDisplay: mOnboard ? getComputedStyle(mOnboard).display : 'nao existe',
      btnConferirExiste: !!btnConferir,
      inputs: el ? el.querySelectorAll('input.ci').length : 0,
    };
  });
  console.log('   Conferir Voto:', JSON.stringify(conferir));

  // 4. Testar usarDemo
  console.log('\n4. Testando usarDemo()...');
  const demo = await page.evaluate(() => {
    try {
      if (typeof usarDemo === 'function') {
        usarDemo();
        return { sucesso: true };
      }
      return { erro: 'usarDemo nao e funcao' };
    } catch (e) {
      return { erro: e.message };
    }
  });
  console.log('   usarDemo:', JSON.stringify(demo));
  await page.waitForTimeout(2000);

  // 5. Verificar resultado
  const chkRes = await page.evaluate(() => {
    const el = document.getElementById('chkRes');
    if (!el) return { naoExiste: true };
    return {
      textLen: el.textContent.length,
      texto: el.textContent.substring(0, 300),
    };
  });
  console.log('   chkRes:', JSON.stringify(chkRes));

  // 6. Testar voto anonimo via API
  console.log('\n6. Testando voto anonimo via API...');
  const voterHash = 'anon-test-' + Date.now();
  const votoResp = await fetch(API + '/api/voto', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      voterHash: voterHash,
      cargo: 'Presidente',
      voto: { candidato: 'LULA', partido: 'PT', numero: '13' }
    })
  }).then(r => r.json()).catch(e => ({ erro: e.message }));
  console.log('   Voto anonimo:', JSON.stringify(votoResp));

  console.log('\n=== ERROS ===');
  errors.slice(0, 15).forEach(e => console.log('  ' + e));

  await browser.close();
})();