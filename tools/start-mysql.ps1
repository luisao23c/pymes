$ErrorActionPreference = 'Stop'
$base = 'C:\Users\CETIC-LuisGH2\mysql84\mysql-8.4.6-winx64'
$mysql = Join-Path $base 'bin\mysqld.exe'
$log = 'C:\Users\CETIC-LuisGH2\mysql84\mysql.log'
$err = 'C:\Users\CETIC-LuisGH2\mysql84\mysql.err'
$args = @(
  '--no-defaults',
  "--datadir=$base\data",
  '--port=3307',
  '--bind-address=127.0.0.1',
  '--console'
)
$p = Start-Process -FilePath $mysql -ArgumentList $args -RedirectStandardOutput $log -RedirectStandardError $err -WindowStyle Hidden -PassThru
Write-Output $p.Id
