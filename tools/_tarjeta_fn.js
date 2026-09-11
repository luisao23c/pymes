function descargarTarjeta() {
      const W = 1080, H = 1080;
      const canvas = document.createElement('canvas');
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d');

      // Fondo degradado diagonal entre los dos colores del negocio
      const g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, CARD.accent);
      g.addColorStop(1, CARD.accent2);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      // Decoración: círculos suaves en la esquina opuesta
      ctx.fillStyle = 'rgba(255,255,255,0.10)';
      ctx.beginPath(); ctx.arc(W * 0.82, H * 0.12, 280, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(W * 0.12, H * 0.82, 210, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.beginPath(); ctx.arc(W * 0.9, H * 0.78, 220, 0, Math.PI * 2); ctx.fill();

      // Panel blanco central con bordes del giro
      ctx.fillStyle = '#FFFFFF';
      roundRect(ctx, 44, 44, W - 88, H - 88, 36);
      ctx.fill();

      // Borde fino del panel
      ctx.strokeStyle = 'rgba(0,0,0,0.05)';
      ctx.lineWidth = 2;
      roundRect(ctx, 44, 44, W - 88, H - 88, 36);
      ctx.stroke();

      // Cabecera del panel: barra del color del negocio
      ctx.fillStyle = CARD.accent;
      roundRect(ctx, 44, 44, W - 88, 30, 36);
      ctx.arc(44 + 30, 44 + 30, 30, Math.PI, Math.PI * 1.5);
      ctx.fill();

      // Texto de cabecera: "CATÁLOGO EN LÍNEA"
      ctx.fillStyle = textColorOver(CARD.accent);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.font = '700 18px "Segoe UI", Arial, sans-serif';
      wrapText(ctx, 'CATÁLOGO EN LÍNEA', 80, 59, W - 200, 22);

      // Logo del negocio: círculo perfurado con borde en color del negocio
      const centerY = 392;
      const logoR = 112;
      ctx.save();
      ctx.beginPath();
      ctx.arc(W / 2, centerY, logoR, 0, Math.PI * 2);
      ctx.closePath();

      // Oscurece ligeramente detrás del logo para que brille
      ctx.shadowColor = 'rgba(0,0,0,0.06)';
      ctx.shadowBlur = 18;
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.shadowBlur = 0;

      // Borde fino del círculo del logo
      ctx.strokeStyle = CARD.accent;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(W / 2, centerY, logoR, 0, Math.PI * 2);
      ctx.stroke();

      // Agujeros decorativos
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath(); ctx.arc(W / 2 - logoR * 0.5, centerY - logoR * 0.3, 8, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(W / 2 + logoR * 0.45, centerY - logoR * 0.25, 8, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      let logoDrawn = false;
      let qrDrawn = false;
      function bothOK() { if (logoDrawn && qrDrawn) mountPointer(); }

      if (CARD.logo) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function () {
          ctx.save();
          ctx.beginPath();
          ctx.arc(W / 2, centerY, logoR - 6, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(img, W / 2 - logoR, centerY - logoR, logoR * 2, logoR * 2);
          ctx.restore();
          logoDrawn = true; bothOK();
        };
        img.onerror = function () { logoFallback(ctx, W / 2 - logoR, centerY - logoR, logoR - 6, CARD.accent); logoDrawn = true; bothOK(); };
        img.src = CARD.logo;
      } else {
        logoFallback(ctx, W / 2 - logoR, centerY - logoR, logoR - 6, '#FFFFFF');
        logoDrawn = true; bothOK();
      }

      // Nombre del negocio bajo el logo
      ctx.fillStyle = '#111827';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '800 58px "Segoe UI", Arial, sans-serif';
      const name = CARD.name.length > 34 ? CARD.name.slice(0, 32) + '…' : CARD.name;
      ctx.fillText(name, W / 2, centerY + logoR + 78);

      // Línea divisoria decorativa
      ctx.strokeStyle = CARD.accent;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(W / 2 - 60, centerY + logoR + 122);
      ctx.lineTo(W / 2 + 60, centerY + logoR + 122);
      ctx.stroke();

      // Descripción
      ctx.fillStyle = '#4B5563';
      ctx.font = '400 24px "Segoe UI", Arial, sans-serif';
      wrapText(ctx, CARD.desc, W / 2, centerY + logoR + 170, W - 260, 30, 3);

      // Paleta de color del negocio: 3 chips alineados a la derecha de la descripción
      const chips = [
        CARD.accent,
        CARD.accent2,
        (function () {
          const ha = CARD.accent.replace('#',''), hb = CARD.accent2.replace('#','');
          const r = Math.min(255, ((parseInt(ha.slice(0,2),16)+parseInt(hb.slice(0,2),16))/2)|0);
          const gg = Math.min(255, ((parseInt(ha.slice(2,4),16)+parseInt(hb.slice(2,4),16))/2)|0);
          const bb = Math.min(255, ((parseInt(ha.slice(4,6),16)+parseInt(hb.slice(4,6),16))/2)|0);
          return '#' + [r, gg, bb].map(v => v.toString(16).padStart(2,'0')).join('');
        })()
      ];
      const chipY = centerY + logoR + 222;
      const chipW = 30;
      const chipGap = 14;
      const chipX0 = W - 112;
      chips.forEach(function (c, i) {
        ctx.fillStyle = c;
        roundRect(ctx, chipX0 + i * (chipW + chipGap), chipY - chipW / 2, chipW, chipW, 6);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.10)';
        ctx.lineWidth = 1;
        roundRect(ctx, chipX0 + i * (chipW + chipGap), chipY - chipW / 2, chipW, chipW, 6);
        ctx.stroke();
      });

      // Código QR + botón de micropagina
      const qrSize = 228;
      const qrCornerR = 22;
      const qrBgY = centerY + logoR + 308;
      const qrBgX = (W - qrSize - 140) / 2;

      // Etiqueta sobre el QR
      if (CARD.qr) {
        pill(ctx, W / 2 - 90, qrBgY - 66, 180, 42, 21, CARD.accent, 'Escanea el catálogo', textColorOver(CARD.accent));
      }

      // Marco blanco del QR: cuadrado con bordes redondeados (o círculo si no hay QR)
      ctx.fillStyle = '#FFFFFF';
      if (CARD.qr) {
        roundRect(ctx, qrBgX, qrBgY, qrSize, qrSize, qrCornerR);
      } else {
        ctx.beginPath();
        ctx.arc(W / 2, qrBgY + qrSize / 2, qrSize / 2, 0, Math.PI * 2);
      }
      ctx.fill();

      // QR dibujado
      if (CARD.qr) {
        const q = new Image();
        q.crossOrigin = 'anonymous';
        q.onload = function () {
          ctx.drawImage(q, qrBgX + 12, qrBgY + 12, qrSize - 24, qrSize - 24);
          qrDrawn = true; bothOK();
        };
        q.onerror = function () { qrDrawn = true; bothOK(); };
        q.src = CARD.qr;
      } else {
        // Espacio reservado circular: logo del negocio pequeño perfurado
        ctx.save();
        ctx.beginPath();
        ctx.arc(W / 2, qrBgY + qrSize / 2, qrSize / 2 - 6, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.fillStyle = CARD.accent;
        roundRect(ctx, W / 2 - 70, qrBgY + 40, 140, 140, 24);
        ctx.fill();
        ctx.fillStyle = textColorOver(CARD.accent);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 80px "Segoe UI", Arial, sans-serif';
        ctx.fillText(String(CARD.name.slice(0, 2)).toUpperCase(), W / 2, qrBgY + qrSize / 2);
        ctx.restore();
        qrDrawn = true; bothOK();
      }

      // Láminas "micropagina de catálogo" + pie
      function mountPointer() {
        const pointerY = qrBgY + qrSize + 40;
        ctx.fillStyle = '#111827';
        ctx.font = '700 26px "Segoe UI", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('micropagina de catálogo', W / 2, pointerY);

        ctx.fillStyle = '#6B7280';
        ctx.font = '400 18px "Segoe UI", Arial, sans-serif';
        ctx.fillText(CARD.url.replace(/^https?:\/\//, '').slice(0, 56), W / 2, pointerY + 42);

        // Línea punteada decorativa debajo del QR
        ctx.strokeStyle = 'rgba(0,0,0,0.08)';
        ctx.setLineDash([6, 8]);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(W / 2, pointerY + 84);
        ctx.lineTo(W / 2, pointerY + 120);
        ctx.stroke();
        ctx.setLineDash([]);

        // Pie izquierdo: "Creado para" + nombre
        const footerY = H - 92;
        ctx.fillStyle = '#9CA3AF';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.font = '400 18px "Segoe UI", Arial, sans-serif';
        ctx.fillText('Creado para', 92, footerY);
        ctx.fillStyle = '#111827';
        ctx.font = '700 22px "Segoe UI", Arial, sans-serif';
        ctx.fillText(CARD.name, 92, footerY + 28);

        // Pie derecho: "Visítanos" + dominio corto
        const urlShort = CARD.url.replace(/^https?:\/\//, '').slice(0, 32);
        ctx.fillStyle = '#6B7280';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.font = '400 18px "Segoe UI", Arial, sans-serif';
        ctx.fillText('Visítanos', W - 92, footerY);
        ctx.fillStyle = CARD.accent;
        ctx.font = '700 22px "Segoe UI", Arial, sans-serif';
        ctx.fillText(urlShort, W - 92, footerY + 28);

        // Descarga del PNG
        const a = document.createElement('a');
        a.download = 'tarjeta-' + CARD.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') + '.png';
        a.href = canvas.toDataURL('image/png');
        a.click();
        mostrarToast('Tarjeta descargada ✓', 'ok');
      }

      if (!CARD.qr) mountPointer();
    }

  