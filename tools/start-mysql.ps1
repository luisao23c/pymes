$ErrorActionPreference = 'Stop'
$port = 3307

# Idempotente: si ya hay algo escuchando en el puerto (una corrida anterior
# de este mismo script), no lanza un segundo mysqld -- solo confirma y sale.
$already = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
if ($already) {
  Write-Output "MySQL ya estaba corriendo en 127.0.0.1:$port (PID $($already[0].OwningProcess))"
  exit 0
}

$base = 'C:\Users\CETIC-LuisGH2\mysql84\mysql-8.4.6-winx64'
$mysql = Join-Path $base 'bin\mysqld.exe'
$log = 'C:\Users\CETIC-LuisGH2\mysql84\mysql.log'
$err = 'C:\Users\CETIC-LuisGH2\mysql84\mysql.err'
$mysqlArgs = @(
  '--no-defaults',
  "--datadir=$base\data",
  "--port=$port",
  '--bind-address=127.0.0.1',
  '--console'
)
$p = Start-Process -FilePath $mysql -ArgumentList $mysqlArgs -RedirectStandardOutput $log -RedirectStandardError $err -WindowStyle Hidden -PassThru

# Espera hasta que el puerto responda (máx. 30s) para que quien encadene este
# script con el arranque del server no se adelante a una BD que aún no abrió.
$deadline = (Get-Date).AddSeconds(30)
do {
  Start-Sleep -Milliseconds 500
  $up = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
} while (-not $up -and (Get-Date) -lt $deadline)

if ($up) {
  Write-Output "MySQL listo en 127.0.0.1:$port (PID $($p.Id))"
} else {
  Write-Error "MySQL no respondió en el puerto $port tras 30s; revisa $err"
  exit 1
}
