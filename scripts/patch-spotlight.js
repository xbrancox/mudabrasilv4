const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'index.html');
let content = fs.readFileSync(filePath, 'utf8');

// Use a more flexible approach - find the function and replace specific parts
const funcStart = content.indexOf('async function carregaSpotlight(){');
if (funcStart < 0) {
  console.log('❌ Function not found');
  process.exit(1);
}

// Find the section we want to modify
const tryStart = content.indexOf('  try{', funcStart);
if (tryStart < 0) {
  console.log('❌ try block not found');
  process.exit(1);
}

// Insert the foto loading code before the try block
const fotoLoading = `  let fotosPres = {};
  
  // Carregar fotos dos candidatos
  try {
    const rf = await fetch('data/fotos-candidatos-2026.json');
    if (rf.ok) {
      const fd = await rf.json();
      fotosPres = fd.presidente || {};
    }
  } catch(e) {
    console.warn('[spotlight] Fotos não carregadas:', e.message);
  }
  
`;

content = content.slice(0, tryStart) + fotoLoading + content.slice(tryStart);

// Now update the foto fields - use regex to find them
content = content.replace(
  /foto: lula\.foto\|\|''\}/g,
  "foto: fotosPres['LULA'] || lula.foto || ''}"
);
content = content.replace(
  /foto: bolsonaro\.foto\|\|''\}/g,
  "foto: fotosPres['FLAVIO BOLSONARO'] || bolsonaro.foto || ''}"
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ index.html updated successfully');
