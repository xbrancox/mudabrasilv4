# commit-push.ps1 - Commit e push das alterações

$gitPath = "C:\Program Files\Git\cmd\git.exe"

Set-Location "C:\Users\euler\votabrasil"

# Adicionar arquivos modificados
& $gitPath add index.html
& $gitPath add app/index.html
& $gitPath add data/segundo-turno-2026.json
& $gitPath add server/index.js

# Status
Write-Host "=== Status ==="
& $gitPath status

# Commit
Write-Host "`n=== Commit ==="
& $gitPath commit -m "fix(site): adicionar formulário de conferir voto com 5 inputs no site principal"

# Push
Write-Host "`n=== Push ==="
& $gitPath push origin main

Write-Host "`n✅ Commit e push concluídos!"
