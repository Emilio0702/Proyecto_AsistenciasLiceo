Write-Host "--- Iniciando Proyecto ServiTerra ---" -ForegroundColor Cyan

# 1. Levantar la base de datos con Docker
Write-Host "Lanzando Base de Datos..." -ForegroundColor Yellow
docker-compose up -d db

# 2. Iniciar Backend y Frontend en paralelo
Write-Host "Iniciando Backend y Frontend..." -ForegroundColor Green
npm start
