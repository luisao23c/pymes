$env:PORT = '3000'
$root = 'C:\Users\CETIC-LuisGH2\Documents\Default Project'
$log = Join-Path $root '.freebuff\preview-0f9cbe6d-a0e9-466b-a597-91bb1b39da4c.log'
$err = Join-Path $root '.freebuff\preview-0f9cbe6d-a0e9-466b-a597-91bb1b39da4c.log.err'
$p = Start-Process -FilePath 'node.exe' -ArgumentList 'server.js' -WorkingDirectory $root -RedirectStandardOutput $log -RedirectStandardError $err -WindowStyle Hidden -PassThru
Write-Output $p.Id