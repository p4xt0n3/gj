/* No external libraries used - plain JS. Handles dynamic UI and canvas export. */

(function () {
  // DOM refs
  const typeRadios = Array.from(document.querySelectorAll('input[name="sfw-nsfw"]'));
  const outfitControls = document.getElementById('outfit-controls');
  const outfitNoneLabel = document.getElementById('outfit-none-label');
  const outfitRadios = () => Array.from(document.querySelectorAll('input[name="outfit"]'));
  const swimsuitSub = document.getElementById('swimsuit-sub');
  const swimtypeRadios = Array.from(document.querySelectorAll('input[name="swimtype"]'));
  const draftRadios = () => Array.from(document.querySelectorAll('input[name="draft-type"]'));
  const frontInput = document.getElementById('front-upload');
  const backInput = document.getElementById('back-upload');
  const frontPreview = document.getElementById('front-preview');
  const backPreview = document.getElementById('back-preview');
  const notesInput = document.getElementById('notes');
  const doneBtn = document.getElementById('done-btn');
  const priceDisplay = document.getElementById('price-display');

  let frontImg = null;
  let backImg = null;

  // Helpers: toggle selected visual state for radio labels
  function refreshRadioVisuals() {
    document.querySelectorAll('.radio').forEach(lbl => lbl.classList.remove('selected'));
    // type
    typeRadios.forEach(r => {
      if (r.checked) r.closest('label.radio')?.classList.add('selected');
    });
    outfitRadios().forEach(r => {
      if (r.checked) r.closest('label.radio')?.classList.add('selected');
    });
    swimtypeRadios.forEach(r => {
      if (r.checked) r.closest('label.radio')?.classList.add('selected');
    });
    // draft radios visuals
    draftRadios().forEach(r => {
      if (r.checked) r.closest('label.radio')?.classList.add('selected');
    });
  }

  // Show/hide "裸体" (spoiler) depending on NSFW selection
  function updateOutfitNoneVisibility() {
    const selected = document.querySelector('input[name="sfw-nsfw"]:checked')?.value;
    if (selected === 'NSFW') {
      outfitNoneLabel.classList.remove('hidden');
    } else {
      // if currently selected outfit is "无衣物", switch to first non-spoiler option
      const noneInput = outfitNoneLabel.querySelector('input');
      if (noneInput.checked) {
        const first = outfitRadios().find(r => r.value !== '无衣物');
        if (first) first.checked = true;
      }
      outfitNoneLabel.classList.add('hidden');
    }
    refreshRadioVisuals();
  }

  // Show swimsuit suboptions only when swimsuit selected
  function updateSwimsuitSub() {
    const outfit = document.querySelector('input[name="outfit"]:checked')?.value;
    if (outfit === '泳装') {
      swimsuitSub.classList.remove('hidden');
      // ensure a swim type is selected by default
      if (!document.querySelector('input[name="swimtype"]:checked')) {
        swimtypeRadios[0].checked = true;
      }
    } else {
      swimsuitSub.classList.add('hidden');
      // clear swimtype selection
      swimtypeRadios.forEach(r => r.checked = false);
    }
    refreshRadioVisuals();
  }

  // handle click on custom labels to check inputs (labels wrap inputs so this mostly handled by browser)
  // File preview helpers
  function loadFilePreview(file, targetEl, setImgCallback) {
    if (!file) {
      targetEl.innerHTML = '';
      setImgCallback(null);
      return;
    }
    const img = new Image();
    img.onload = () => {
      targetEl.innerHTML = '';
      targetEl.appendChild(img);
      setImgCallback(img);
    };
    img.onerror = () => {
      targetEl.innerHTML = '无法显示图片';
      setImgCallback(null);
    };
    const url = URL.createObjectURL(file);
    img.src = url;
  }

  frontInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    loadFilePreview(file, frontPreview, (img) => {
      frontImg = img;
    });
  });
  backInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    loadFilePreview(file, backPreview, (img) => {
      backImg = img;
    });
  });

  // Price update helper
  function updatePriceDisplay() {
    if (!priceDisplay) return;
    const type = document.querySelector('input[name="sfw-nsfw"]:checked')?.value || '-';
    const outfit = document.querySelector('input[name="outfit"]:checked')?.value || '-';
    const swimtype = document.querySelector('input[name="swimtype"]:checked')?.value || '';
    const draft = document.querySelector('input[name="draft-type"]:checked')?.value || '-';
    // base price from price.js
    let priceValue = (typeof window.getPrice === 'function') ? window.getPrice(type, draft) : null;
    const outfitSurcharge = (outfit === '原图衣物') ? 2 : 0;
    if (priceValue !== null && priceValue !== undefined) {
      priceValue = priceValue + outfitSurcharge;
    }

    const selectedParts = [];
    if (type && type !== '-') selectedParts.push(type);
    if (outfit && outfit !== '-') selectedParts.push(outfit);
    if (swimtype) selectedParts.push(swimtype);
    if (draft && draft !== '-') selectedParts.push(draft);

    const left = priceDisplay.children[0];
    const right = priceDisplay.children[1];

    left.textContent = '已选择: ' + (selectedParts.length ? selectedParts.join(' • ') : '-');
    if (priceValue !== null && priceValue !== undefined) {
      right.textContent = `价格: ${priceValue} ￥`;
    } else {
      right.textContent = '价格: - ￥';
    }
    // ensure visuals updated
    refreshRadioVisuals();
  }



  // reset helper: clear all inputs, previews and restore defaults
  function resetAll() {
    // radios: set defaults
    const sfw = document.querySelector('input[name="sfw-nsfw"][value="SFW"]');
    if (sfw) sfw.checked = true;
    const draftDefault = document.querySelector('input[name="draft-type"][value="线稿"]');
    if (draftDefault) draftDefault.checked = true;
    // outfit: choose first non-spoiler (兔女郎)
    const firstOutfit = document.querySelector('input[name="outfit"][value="兔女郎"]') || document.querySelector('input[name="outfit"]');
    if (firstOutfit) firstOutfit.checked = true;
    // swimtype clear
    swimtypeRadios.forEach(r => r.checked = false);

    // clear text inputs
    const userName = document.getElementById('user-name');
    const userQQ = document.getElementById('user-qq');
    const userRoblox = document.getElementById('user-roblox');
    if (userName) userName.value = '';
    if (userQQ) userQQ.value = '';
    if (userRoblox) userRoblox.value = '';

    if (notesInput) notesInput.value = '';

    // clear file inputs and previews
    if (frontInput) { frontInput.value = ''; }
    if (backInput) { backInput.value = ''; }
    frontPreview.innerHTML = '';
    backPreview.innerHTML = '';
    frontImg = null;
    backImg = null;

    // update visibility and visuals
    updateOutfitNoneVisibility();
    updateSwimsuitSub();
    updatePriceDisplay();
    refreshRadioVisuals();
  }

  // initial visuals
  refreshRadioVisuals();
  updateOutfitNoneVisibility();
  updateSwimsuitSub();
  updatePriceDisplay();

  // wire type radio changes
  typeRadios.forEach(r => r.addEventListener('change', () => {
    updateOutfitNoneVisibility();
    updatePriceDisplay();
  }));

  // outfit changes
  outfitControls.addEventListener('change', () => {
    updateSwimsuitSub();
    updatePriceDisplay();
  });

  // clicking on label elements should toggle selected class - use delegated listener
  document.addEventListener('click', (e) => {
    const lbl = e.target.closest('label.radio');
    if (lbl) {
      const input = lbl.querySelector('input');
      if (input && !input.checked) {
        input.checked = true;
        // trigger change events
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
      refreshRadioVisuals();
      updatePriceDisplay();
    }
  });

  // Compose canvas and open image in new tab
  doneBtn.addEventListener('click', async () => {
    const type = document.querySelector('input[name="sfw-nsfw"]:checked')?.value || '';
    const outfit = document.querySelector('input[name="outfit"]:checked')?.value || '';
    const swimtype = document.querySelector('input[name="swimtype"]:checked')?.value || '';
    const draft = document.querySelector('input[name="draft-type"]:checked')?.value || '';
    // ensure price display is current before export
    updatePriceDisplay();

    // Canvas size - choose portrait mobile-friendly
    const canvasW = 900;
    const canvasH = 1200;
    const c = document.createElement('canvas');
    c.width = canvasW;
    c.height = canvasH;
    const ctx = c.getContext('2d');

    // background
    ctx.fillStyle = '#fbfdff';
    ctx.fillRect(0,0,canvasW,canvasH);

    // drop shadow panel for content
    const panelX = 36;
    const panelY = 36;
    const panelW = canvasW - panelX * 2;
    const panelH = canvasH - panelY * 2;
    // panel background
    ctx.fillStyle = '#ffffff';
    // rounded rect
    function roundRect(x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }
    // subtle shadow
    ctx.save();
    ctx.fillStyle = '#fff';
    ctx.shadowColor = 'rgba(10,20,30,0.08)';
    ctx.shadowBlur = 24;
    roundRect(panelX, panelY, panelW, panelH, 18);
    ctx.fill();
    ctx.restore();

    // Header
    ctx.fillStyle = '#07263b';
    ctx.font = '700 28px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('画稿类型', panelX + 28, panelY + 48);

    // small meta badges
    function drawBadge(text, x, y, color='#f0f7ff', textColor='#0b2b3a') {
      ctx.font = '600 14px sans-serif';
      const paddingX = 12;
      const paddingY = 8;
      const w = ctx.measureText(text).width + paddingX * 2;
      const h = 28;
      ctx.fillStyle = color;
      roundRect(x, y - h + 6, w, h, 8);
      ctx.fill();
      ctx.fillStyle = textColor;
      ctx.textAlign = 'left';
      ctx.fillText(text, x + paddingX, y + 6);
      return w + 8;
    }

    let bx = panelX + 28;
    const by = panelY + 78;
    bx += drawBadge(type ? `类型: ${type}` : '类型: -', bx, by);
    bx += drawBadge(outfit ? `衣物: ${outfit}` : '衣物: -', bx, by);
    // draft type badge
    bx += drawBadge(draft ? `稿类: ${draft}` : '稿类: -', bx, by);
    if (outfit === '泳装') {
      drawBadge(swimtype ? `泳装: ${swimtype}` : '泳装: -', bx, by);
    }

    // content divider
    ctx.strokeStyle = '#eef5fb';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(panelX + 20, panelY + 100);
    ctx.lineTo(panelX + panelW - 20, panelY + 100);
    ctx.stroke();

    // Notes box (styled)
    const notesX = panelX + 28;
    const notesY = panelY + 118;
    const notesW = panelW - 56;
    const notesH = 90;
    // box background
    ctx.fillStyle = '#fbfdff';
    roundRect(notesX, notesY, notesW, notesH, 12);
    ctx.fill();
    ctx.strokeStyle = '#e6f0f7';
    ctx.lineWidth = 1;
    ctx.stroke();
    // notes title
    ctx.fillStyle = '#0b2b3a';
    ctx.font = '600 16px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('备注', notesX + 12, notesY + 26);
    // notes content, wrap
    const notes = (notesInput && notesInput.value) ? notesInput.value.trim() : '';
    ctx.font = '15px sans-serif';
    ctx.fillStyle = '#23414f';
    const wrapText = (text, x, yStart, maxW, lineH) => {
      const words = text.split(/\s+/);
      let line = '';
      let y = yStart;
      for (let i = 0; i < words.length; i++) {
        const test = line ? (line + ' ' + words[i]) : words[i];
        const metrics = ctx.measureText(test);
        if (metrics.width > maxW && line) {
          ctx.fillText(line, x, y);
          line = words[i];
          y += lineH;
        } else {
          line = test;
        }
      }
      if (line) ctx.fillText(line, x, y);
      return y + lineH;
    };
    if (notes) {
      wrapText(notes, notesX + 12, notesY + 50, notesW - 24, 20);
    } else {
      ctx.fillStyle = '#94a7b2';
      ctx.fillText('无', notesX + 12, notesY + 50);
    }

    // Images area
    const imgAreaTop = notesY + notesH + 26;
    const padding = 20;
    const areaW = (panelW - 56 - padding) / 2;
    const areaH = panelY + panelH - imgAreaTop - 56;

    // section titles
    ctx.fillStyle = '#0b2b3a';
    ctx.font = '600 16px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('形象正面', notesX, imgAreaTop + 20);
    ctx.fillText('形象背面', notesX + areaW + padding, imgAreaTop + 20);

    // framed boxes for images
    const boxY = imgAreaTop + 36;
    function drawImageFrame(x, y, w, h, img, label) {
      // frame
      ctx.fillStyle = '#ffffff';
      roundRect(x, y, w, h, 12);
      ctx.fill();
      ctx.strokeStyle = '#e6eef4';
      ctx.lineWidth = 2;
      ctx.stroke();
      // inner area
      const innerPad = 12;
      const ix = x + innerPad;
      const iy = y + innerPad;
      const iw = w - innerPad * 2;
      const ih = h - innerPad * 2;
      if (!img) {
        // placeholder graphic
        ctx.fillStyle = '#f5fbff';
        roundRect(ix, iy, iw, ih, 8);
        ctx.fill();
        ctx.fillStyle = '#9fb6c8';
        ctx.font = '600 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('未上传', ix + iw / 2, iy + ih / 2);
      } else {
        // fit image preserving aspect
        const iwImg = img.naturalWidth || img.width;
        const ihImg = img.naturalHeight || img.height;
        const scale = Math.min(iw / iwImg, ih / ihImg);
        const dw = iwImg * scale;
        const dh = ihImg * scale;
        const dx = ix + (iw - dw) / 2;
        const dy = iy + (ih - dh) / 2;
        // clip to rounded rect
        ctx.save();
        roundRect(ix, iy, iw, ih, 8);
        ctx.clip();
        ctx.drawImage(img, dx, dy, dw, dh);
        ctx.restore();
      }
    }

    drawImageFrame(notesX, boxY, areaW, areaH, frontImg, 'front');
    drawImageFrame(notesX + areaW + padding, boxY, areaW, areaH, backImg, 'back');

    // Price (centered under image area) - uses global getPrice if available
    // compute displayed price including outfit surcharge
    let priceValue = (typeof window.getPrice === 'function') ? window.getPrice(type, draft) : null;
    const outfitSurcharge = (outfit === '原图衣物') ? 2 : 0;
    if (priceValue !== null && priceValue !== undefined) {
      priceValue = priceValue + outfitSurcharge;
      const priceText = `价格: ${priceValue}￥`;
      ctx.fillStyle = '#0b2b3a';
      ctx.font = '700 18px sans-serif';
      ctx.textAlign = 'center';
      // place price below image boxes, above footer
      const priceX = panelX + panelW / 2;
      const priceY = boxY + areaH + 18;
      ctx.fillText(priceText, priceX, priceY);
    }

    // small footer text (two lines)
    ctx.fillStyle = '#7a8b95';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    const footerX = panelX + panelW / 2;
    const footerY = panelY + panelH - 36;
    ctx.fillText('由画稿生成 • ' + new Date().toLocaleString(), footerX, footerY);
    ctx.fillText('@P4XT0N - QQ:1736731564', footerX, footerY + 18);

    // open in new tab as image
    c.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      // after opening the generated image, reset the form to defaults
      // small timeout to avoid interfering with the newly opened tab
      setTimeout(() => {
        resetAll();
      }, 300);
    }, 'image/png');
  });

  // Announcement modal (auto-shown on load)
  const announceModal = document.getElementById('announce-modal');
  const announceBackdrop = document.getElementById('announce-backdrop');
  const announceClose = document.getElementById('announce-close');

  function closeAnnounce() {
    if (!announceModal) return;
    announceModal.setAttribute('aria-hidden', 'true');
    setTimeout(() => announceModal.classList.add('hidden'), 220);
  }
  if (announceClose) announceClose.addEventListener('click', closeAnnounce);
  if (announceBackdrop) announceBackdrop.addEventListener('click', closeAnnounce);

  // QR modal interactions
  const qrBtn = document.getElementById('qr-btn');
  const qrModal = document.getElementById('qr-modal');
  const qrBackdrop = document.getElementById('qr-backdrop');
  const qrClose = document.getElementById('qr-close');

  function openQr() {
    if (!qrModal) return;
    qrModal.classList.remove('hidden');
    qrModal.setAttribute('aria-hidden', 'false');
  }
  function closeQr() {
    if (!qrModal) return;
    qrModal.setAttribute('aria-hidden', 'true');
    // keep element in DOM but visually hidden after transition
    setTimeout(() => qrModal.classList.add('hidden'), 220);
  }

  if (qrBtn) qrBtn.addEventListener('click', openQr);
  if (qrClose) qrClose.addEventListener('click', closeQr);
  if (qrBackdrop) qrBackdrop.addEventListener('click', closeQr);

  // reset button wiring (top-left)
  const resetBtn = document.getElementById('reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      // animate a subtle feedback
      resetBtn.style.transform = 'scale(0.98)';
      setTimeout(() => { resetBtn.style.transform = ''; }, 120);
      resetAll();
    });
  }

})();