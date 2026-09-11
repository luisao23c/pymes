    // ===== Tarjeta para redes sociales (canvas → PNG) =====
    var CARD = {
      name: <%- safeJson(biz.name) %>,
      desc: <%- safeJson(biz.description || '') %>,
      url: <%- safeJson(storeUrl) %>,
      logo: <%- safeJson(biz.logo || '') %>,
      qr: <%- safeJson(typeof qrUrl !== 'undefined' ? qrUrl : '') %>,
      accent: <%- safeJson(biz.color_hex || '#2563eb') %>,
      accent2: <%- safeJson(biz.color_hex2 || biz.color_hex || '#4f46e5') %>
    };
    function roundRect(ctx, x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }
    function wrapText(ctx, text, x, y, maxW, lineH) {
      const words = String(text || '').split(/\s+/).filter(Boolean);
      let line = '';
      const lines = [];
      for (const w of words) {
        const test = line ? line + ' ' + w : w;
        if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; }
        else line = test;
      }
      if (line) lines.push(line);
      lines.slice(0, 3).forEach((l, i) => ctx.fillText(l, x, y + i * lineH));
    }
    function descargarTarjeta() {
      const W = 1080, H = 1080;
      const canvas = document.createElement('canvas');
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d');

      const g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, CARD.accent);
      g.addColorStop(1, CARD.accent2);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.beginPath(); ctx.arc(W * 0.85, H * 0.1, 220, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(W * 0.1, H * 0.9, 160, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = '#ffffff';
      roundRect(ctx, 60, 60, W - 120, H - 120, 40);
      ctx.fill();

      ctx.fillStyle = CARD.accent;
      roundRect(ctx, 60, 60, W - 120, 26, 13);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.font = 'bold 52px "Segoe UI", Arial, sans-serif';
      ctx.fillText(CARD.name.slice(0, 30), W / 2, 210);

      ctx.fillStyle = '#64748b';
      ctx.font = '24px "Segoe UI", Arial, sans-serif';
      wrapText(ctx, CARD.desc, W / 2, 260, W - 260, 34);

      const centerY = 500;
      const logoSize = 220;
      let drawn = false;
      const finish = function () {
        ctx.fillStyle = '#0f172a';
        ctx.textAlign = 'center';
        ctx.font = 'bold 30px "Segoe UI", Arial, sans-serif';
        ctx.fillText('Catálogo en línea', W / 2, H - 250);
        ctx.fillStyle = '#2563eb';
        ctx.font = 'bold 30px "Segoe UI", Arial, sans-serif';
        ctx.fillText(CARD.url.replace(/^https?:\/\//, '').slice(0, 46), W / 2, H - 205);
        const a = document.createElement('a');
        a.download = 'tarjeta-' + CARD.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') + '.png';
        a.href = canvas.toDataURL('image/png');
        a.click();
        mostrarToast('Tarjeta descargada ✓', 'ok');
      };
      const drawLogo = function () {
        if (!CARD.logo) { drawQr(); return; }
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function () {
          ctx.save();
          ctx.beginPath();
          ctx.arc(W / 2, centerY, logoSize / 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(img, W / 2 - logoSize / 2, centerY - logoSize / 2, logoSize, logoSize);
          ctx.restore();
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 4;
          ctx.beginPath(); ctx.arc(W / 2, centerY, logoSize / 2, 0, Math.PI * 2); ctx.stroke();
          drawQr();
        };
        img.onerror = function () { drawQr(); };
        img.src = CARD.logo;
      };
      const drawQr = function () {
        if (!CARD.qr) { finish(); return; }
        const q = new Image();
        q.onload = function () {
          const s = 240;
          ctx.fillStyle = '#ffffff';
          roundRect(ctx, W / 2 - s / 2 - 16, centerY + logoSize / 2 + 30, s + 32, s + 32, 20);
          ctx.fill();
          ctx.drawImage(q, W / 2 - s / 2, centerY + logoSize / 2 + 46, s, s);
          finish();
        };
        q.onerror = function () { finish(); };
        q.src = CARD.qr;
      };
      drawLogo();
    }
  </script>