import './style.css';

const presets = [
  { id: 'square', label: '정사각형', ratio: '1:1', width: 1080, height: 1080 },
  { id: 'portrait', label: '세로 포스트', ratio: '4:5', width: 1080, height: 1350 },
  { id: 'portrait-3-4', label: '세로 포스트', ratio: '3:4', width: 1080, height: 1440 },
  { id: 'story', label: '스토리 / 릴스', ratio: '9:16', width: 1080, height: 1920 },
  { id: 'landscape', label: '가로 포스트', ratio: '16:9', width: 1920, height: 1080 },
  { id: 'custom', label: '직접 설정', ratio: 'custom', width: 1200, height: 1200 },
];

const state = {
  canvas: { width: 1080, height: 1080, presetId: 'square' },
  background: { type: 'color', color: '#f7f4ee', image: null, transform: null, blur: 0, mosaic: 0, brightness: 100 },
  foreground: { image: null, transform: null },
  selectedLayer: 'foreground',
  activeTool: 'background',
  dragging: null,
  stageView: { zoom: 1, panX: 0, panY: 0 },
  status: '작업물이 브라우저에 임시 저장됩니다.',
};

const app = document.querySelector('#app');
app.innerHTML = `
  <main class="shell">
    <header class="topbar">
      <div class="brand"><span class="brand-mark">F/</span><div><strong>FRAME</strong><span>SNS IMAGE STUDIO</span></div></div>
      <div class="topbar-meta"><span class="live-dot"></span><span>LOCAL WORKSPACE</span><button class="ghost-button" id="resetButton">새 작업</button></div>
    </header>
    <section class="workspace">
      <aside class="settings-panel">
        <div class="panel-intro"><p class="eyebrow">CREATIVE CONTROL</p><!--<h1>한 장의 프레임,<br><em>정확한 비율.</em></h1>--><p class="intro-copy">SNS 채널에 맞는 캔버스를 고르고 이미지를 정교하게 배치하세요.</p></div>
        <section class="control-section">
          <div class="section-heading"><span>01</span><h2>캔버스</h2></div>
          <div class="preset-grid" id="presetGrid"></div>
          <div class="custom-size-row">
            <label>가로 <input id="widthInput" type="number" min="1" max="4000" value="1080"></label>
            <span class="multiply">×</span>
            <label>세로 <input id="heightInput" type="number" min="1" max="4000" value="1080"></label>
          </div>
          <label class="switch-row"><span><strong>비율 잠금</strong><small>크기 변경 시 비율 유지</small></span><input id="ratioLock" type="checkbox" checked><span class="switch"></span></label>
        </section>
        <section class="control-section tool-controls" id="backgroundControls">
          <div class="section-heading"><span>02</span><h2>하단 레이어 설정</h2></div>
          <div class="segmented" id="backgroundType"><button data-type="color" class="active">색상</button><button data-type="transparent">투명</button><button data-type="image">이미지</button></div>
          <div id="colorControl" class="sub-control"><label class="color-control"><input id="colorInput" type="color" value="#f7f4ee"><code id="colorValue">#F7F4EE</code></label></div>
          <div id="backgroundImageControl" class="sub-control hidden"><label class="upload-button"><span class="upload-plus">+</span><span><strong>배경 이미지 추가</strong><small>JPG, PNG · 최대 20MB</small></span><input id="backgroundFile" type="file" accept="image/png,image/jpeg,image/webp"></label><div id="backgroundEffects" class="effects hidden"><div class="effect-heading"><span>이미지 효과</span><small>배경 이미지에만 적용</small></div><label class="range-row"><span>블러</span><input id="blurInput" type="range" min="0" max="24" value="0"><output id="blurValue">0</output></label><label class="range-row"><span>모자이크</span><input id="mosaicInput" type="range" min="0" max="24" value="0"><output id="mosaicValue">0</output></label><label class="range-row"><span>밝기</span><input id="brightnessInput" type="range" min="40" max="160" value="100"><output id="brightnessValue">100%</output></label></div><button class="text-button hidden" id="removeBackground">배경 이미지 제거</button></div>
        </section>
        <section class="control-section hidden" id="foregroundControls">
          <div class="section-heading"><span>02</span><h2>상단 레이어 설정</h2></div>
          <label class="upload-button"><span class="upload-plus">+</span><span><strong>상단 이미지 추가</strong><small>크기와 위치만 조절할 수 있어요</small></span><input id="foregroundFile" type="file" accept="image/png,image/jpeg,image/webp"></label>
          <button class="text-button hidden" id="removeForeground">상단 이미지 제거</button>
        </section>
        <div class="panel-footer"><p class="status" id="statusText">${state.status}</p><button class="save-button" id="saveButton"><span>저장</span><span>↓</span></button></div>
      </aside>
      <section class="editor-panel">
        <div class="editor-header"><div><p class="eyebrow">LIVE PREVIEW / <span id="canvasLabel">1:1</span></p></div><div class="editor-actions"><span id="dimensionLabel">1080 × 1080 px</span><button class="icon-button" id="fitButton" title="캔버스 화면 맞춤">↗</button></div></div>
        <nav class="layer-rail" aria-label="레이어 선택">
          <button class="layer-rail-item foreground layer-item" data-layer="foreground" title="상단 레이어"><span class="layer-icon front-icon"></span></button>
          <button class="layer-rail-item background layer-item active" data-layer="background" title="하단 레이어"><span class="layer-icon back-icon"></span></button>
        </nav>
        <div class="canvas-stage" id="canvasStage"><div class="canvas-wrap" id="canvasWrap"><canvas id="editorCanvas" width="1080" height="1080"></canvas><div class="selection-box hidden" id="selectionBox"><i data-handle="nw"></i><i data-handle="ne"></i><i data-handle="sw"></i><i data-handle="se"></i></div></div><div class="stage-note"><span><i class="key-hint">⌘</i> Ctrl + 휠로 확대·축소 · 휠 버튼 드래그로 이동 · Ctrl + 모서리로 중심 확대</span></div></div>
      </section>
    </section>
  </main>
`;

const $ = (selector) => document.querySelector(selector);
const canvas = $('#editorCanvas');
const ctx = canvas.getContext('2d');
const stage = $('#canvasStage');
const selectionBox = $('#selectionBox');

function clamp(value, min, max) { return Math.min(Math.max(value, min), max); }
function makeTransform(image, width = state.canvas.width * 0.86) {
  const ratio = image.naturalWidth / image.naturalHeight;
  const w = width;
  const h = w / ratio;
  return { x: (state.canvas.width - w) / 2, y: (state.canvas.height - h) / 2, width: w, height: h };
}
function ratioLabel(width, height) {
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  const divisor = gcd(width, height);
  return `${width / divisor}:${height / divisor}`;
}
function drawCheckerboard(context, width, height) {
  const size = 28;
  context.fillStyle = '#f5f2ec'; context.fillRect(0, 0, width, height);
  context.fillStyle = '#ebe7df';
  for (let y = 0; y < height; y += size) for (let x = 0; x < width; x += size) if ((x / size + y / size) % 2 === 0) context.fillRect(x, y, size, size);
}
function drawImageWithEffects(context, layer, target) {
  const image = layer.image;
  if (!image || !layer.transform) return;
  const { x, y, width, height } = layer.transform;
  context.save();
  context.filter = `blur(${layer.blur || 0}px) brightness(${layer.brightness || 100}%)`;
  if (layer.mosaic > 0) {
    const mosaicSize = Math.max(2, Math.round(layer.mosaic));
    const offscreen = document.createElement('canvas');
    offscreen.width = Math.max(1, Math.round(width / mosaicSize)); offscreen.height = Math.max(1, Math.round(height / mosaicSize));
    const small = offscreen.getContext('2d'); small.drawImage(image, 0, 0, offscreen.width, offscreen.height);
    context.imageSmoothingEnabled = false; context.drawImage(offscreen, x, y, width, height); context.imageSmoothingEnabled = true;
  } else context.drawImage(image, x, y, width, height);
  context.restore();
}
function getOverflow(transform) {
  if (!transform) return { left: false, right: false, top: false, bottom: false };
  return { left: transform.x < 0, right: transform.x + transform.width > state.canvas.width, top: transform.y < 0, bottom: transform.y + transform.height > state.canvas.height };
}
function render() {
  canvas.width = state.canvas.width; canvas.height = state.canvas.height;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (state.background.type === 'transparent') drawCheckerboard(ctx, canvas.width, canvas.height); else { ctx.fillStyle = state.background.color; ctx.fillRect(0, 0, canvas.width, canvas.height); }
  if (state.background.type === 'image') drawImageWithEffects(ctx, state.background, canvas);
  drawImageWithEffects(ctx, state.foreground, canvas);
  applyStageView();
  updateSelection();
  updateSummaries();
}
function applyStageView() {
  const { zoom, panX, panY } = state.stageView;
  $('#canvasWrap').style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
  $('#canvasStage').classList.toggle('is-panned', zoom !== 1 || panX !== 0 || panY !== 0);
}
function updateSelection() {
  const layer = state.selectedLayer === 'background' ? state.background : state.foreground;
  if (!layer.image || !layer.transform) { selectionBox.classList.add('hidden'); return; }
  selectionBox.classList.remove('hidden');
  selectionBox.style.left = `${layer.transform.x / state.canvas.width * 100}%`;
  selectionBox.style.top = `${layer.transform.y / state.canvas.height * 100}%`;
  selectionBox.style.width = `${layer.transform.width / state.canvas.width * 100}%`;
  selectionBox.style.height = `${layer.transform.height / state.canvas.height * 100}%`;
}
function updateSummaries() {
  const backgroundSummary = $('#backgroundSummary');
  const foregroundSummary = $('#foregroundSummary');
  if (backgroundSummary) backgroundSummary.textContent = state.background.type === 'image' ? '이미지 배경' : state.background.type === 'transparent' ? '투명 배경' : '색상 배경';
  if (foregroundSummary) foregroundSummary.textContent = state.foreground.image ? '이미지 배치됨' : '이미지 없음';
  $('#removeBackground').classList.toggle('hidden', !state.background.image);
  $('#removeForeground').classList.toggle('hidden', !state.foreground.image);
}
function setCanvasSize(width, height, presetId = 'custom') {
  state.canvas.width = clamp(Math.round(width), 1, 4000); state.canvas.height = clamp(Math.round(height), 1, 4000); state.canvas.presetId = presetId;
  $('#widthInput').value = state.canvas.width; $('#heightInput').value = state.canvas.height;
  const preset = presets.find((item) => item.id === presetId);
  $('#canvasLabel').textContent = preset?.ratio === 'custom' || !preset ? ratioLabel(state.canvas.width, state.canvas.height) : preset.ratio;
  $('#dimensionLabel').textContent = `${state.canvas.width} × ${state.canvas.height} px`;
  if (state.background.image) state.background.transform = makeTransform(state.background.image, state.canvas.width);
  if (state.foreground.image) state.foreground.transform = makeTransform(state.foreground.image, state.canvas.width * 0.72);
  render();
}
function loadImage(file, layerName) {
  if (!file || !file.type.startsWith('image/')) { setStatus('PNG, JPG, WEBP 이미지만 사용할 수 있어요.'); return; }
  const image = new Image(); image.onload = () => {
    if (layerName === 'background') { state.background.image = image; state.background.transform = makeTransform(image, state.canvas.width); state.background.type = 'image'; setBackgroundType('image'); }
    else { state.foreground.image = image; state.foreground.transform = makeTransform(image, state.canvas.width * 0.72); state.selectedLayer = 'foreground'; selectLayer('foreground'); }
    setStatus(`${layerName === 'background' ? '배경' : '상단'} 이미지가 추가되었습니다.`); render();
  }; image.src = URL.createObjectURL(file);
}
function setStatus(message) { state.status = message; $('#statusText').textContent = message; }
function setBackgroundType(type) {
  state.background.type = type;
  document.querySelectorAll('#backgroundType button').forEach((button) => button.classList.toggle('active', button.dataset.type === type));
  $('#colorControl').classList.toggle('hidden', type !== 'color'); $('#backgroundImageControl').classList.toggle('hidden', type !== 'image');
  $('#backgroundEffects').classList.toggle('hidden', type !== 'image' || !state.background.image);
  render();
}
function selectLayer(layer) {
  state.selectedLayer = layer; state.activeTool = layer;
  document.querySelectorAll('.layer-rail-item').forEach((item) => item.classList.toggle('active', item.dataset.layer === layer));
  $('#backgroundControls').classList.toggle('hidden', layer !== 'background'); $('#foregroundControls').classList.toggle('hidden', layer !== 'foreground');
  render();
}
function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return { x: (event.clientX - rect.left) * state.canvas.width / rect.width, y: (event.clientY - rect.top) * state.canvas.height / rect.height };
}
function getLayerFromPoint(point) {
  const hit = (transform) => transform && point.x >= transform.x && point.x <= transform.x + transform.width && point.y >= transform.y && point.y <= transform.y + transform.height;
  if (hit(state.foreground.transform)) return 'foreground';
  if (state.background.type === 'image' && hit(state.background.transform)) return 'background';
  return null;
}
function snapTransform(transform) {
  const snap = Math.max(10, state.canvas.width * 0.015);
  const right = transform.x + transform.width, bottom = transform.y + transform.height;
  if (Math.abs(transform.x) < snap) transform.x = 0;
  if (Math.abs(transform.y) < snap) transform.y = 0;
  if (Math.abs(right - state.canvas.width) < snap) transform.x = state.canvas.width - transform.width;
  if (Math.abs(bottom - state.canvas.height) < snap) transform.y = state.canvas.height - transform.height;
}
function beginPointer(event) {
  if (event.button === 1) {
    state.dragging = { mode: 'pan', start: { x: event.clientX, y: event.clientY }, initial: { ...state.stageView } };
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    return;
  }
  if (event.button !== 0) return;
  const point = canvasPoint(event); const handle = event.target.dataset.handle;
  const activeLayer = state.selectedLayer === 'background' ? state.background : state.foreground;
  if (handle && activeLayer.image) {
    state.dragging = { mode: 'resize', handle, center: event.ctrlKey, start: point, initial: { ...activeLayer.transform } }; event.currentTarget.setPointerCapture(event.pointerId); return;
  }
  const hitLayer = getLayerFromPoint(point);
  if (hitLayer) { selectLayer(hitLayer); const layer = hitLayer === 'background' ? state.background : state.foreground; state.dragging = { mode: 'move', start: point, initial: { ...layer.transform } }; event.currentTarget.setPointerCapture(event.pointerId); }
}
function movePointer(event) {
  if (!state.dragging) return;
  const point = canvasPoint(event); const drag = state.dragging; const layer = state.selectedLayer === 'background' ? state.background : state.foreground; const initial = drag.initial;
  if (drag.mode === 'pan') { state.stageView.panX = drag.initial.panX + event.clientX - drag.start.x; state.stageView.panY = drag.initial.panY + event.clientY - drag.start.y; applyStageView(); return; }
  if (drag.mode === 'move') { layer.transform.x = initial.x + point.x - drag.start.x; layer.transform.y = initial.y + point.y - drag.start.y; }
  else {
    const dx = point.x - drag.start.x; const dy = point.y - drag.start.y; const aspect = initial.width / initial.height;
    let width = initial.width + (drag.handle.includes('e') ? dx : -dx); width = Math.max(1, width); let height = width / aspect;
    let x = drag.handle.includes('w') ? initial.x + initial.width - width : initial.x; let y = drag.handle.includes('n') ? initial.y + initial.height - height : initial.y;
    if (drag.center) {
      width = Math.max(1, initial.width + (drag.handle.includes('e') ? dx * 2 : -dx * 2));
      height = width / aspect;
      x = initial.x + (initial.width - width) / 2;
      y = initial.y + (initial.height - height) / 2;
    }
    layer.transform = { x, y, width, height };
  }
  snapTransform(layer.transform); render();
}
function endPointer() { state.dragging = null; }
function removeLayerImage(layerName) {
  if (layerName === 'background') {
    state.background.image = null;
    state.background.transform = null;
    state.background.type = 'color';
    setBackgroundType('color');
    setStatus('배경 이미지가 제거되었습니다.');
  } else {
    state.foreground.image = null;
    state.foreground.transform = null;
    setStatus('상단 이미지가 제거되었습니다.');
  }
  render();
}

presets.forEach((preset) => { const button = document.createElement('button'); button.className = `preset ${preset.id === 'square' ? 'active' : ''}`; button.dataset.id = preset.id; button.innerHTML = `<span class="preset-shape ${preset.id}"></span><span>${preset.label}</span><small>${preset.ratio === 'custom' ? 'W × H' : preset.ratio}</small>`; button.onclick = () => { document.querySelectorAll('.preset').forEach((item) => item.classList.remove('active')); button.classList.add('active'); setCanvasSize(preset.width, preset.height, preset.id); }; $('#presetGrid').appendChild(button); });

document.querySelectorAll('.layer-rail-item').forEach((item) => item.addEventListener('click', () => selectLayer(item.dataset.layer)));
document.querySelectorAll('#backgroundType button').forEach((button) => button.addEventListener('click', () => setBackgroundType(button.dataset.type)));
$('#colorInput').addEventListener('input', (event) => { state.background.color = event.target.value; $('#colorValue').textContent = event.target.value.toUpperCase(); render(); });
$('#backgroundFile').addEventListener('change', (event) => loadImage(event.target.files[0], 'background'));
$('#foregroundFile').addEventListener('change', (event) => loadImage(event.target.files[0], 'foreground'));
$('#removeBackground').addEventListener('click', () => removeLayerImage('background'));
$('#removeForeground').addEventListener('click', () => removeLayerImage('foreground'));
window.addEventListener('keydown', (event) => {
  if (event.key !== 'Delete' || ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)) return;
  const activeLayer = state.selectedLayer === 'background' ? state.background : state.foreground;
  if (!activeLayer.image) return;
  event.preventDefault();
  removeLayerImage(state.selectedLayer);
});
$('#widthInput').addEventListener('input', (event) => { const width = Number(event.target.value) || 1; const height = $('#ratioLock').checked ? width * state.canvas.height / state.canvas.width : Number($('#heightInput').value); setCanvasSize(width, height); });
$('#heightInput').addEventListener('input', (event) => { const height = Number(event.target.value) || 1; const width = $('#ratioLock').checked ? height * state.canvas.width / state.canvas.height : Number($('#widthInput').value); setCanvasSize(width, height); });
[['blurInput', 'blur', 'blurValue', ''], ['mosaicInput', 'mosaic', 'mosaicValue', ''], ['brightnessInput', 'brightness', 'brightnessValue', '%']].forEach(([input, key, output, suffix]) => { $(`#${input}`).addEventListener('input', (event) => { state.background[key] = Number(event.target.value); $(`#${output}`).textContent = `${event.target.value}${suffix}`; render(); }); });
canvas.addEventListener('pointerdown', beginPointer); canvas.addEventListener('pointermove', movePointer); canvas.addEventListener('pointerup', endPointer); canvas.addEventListener('pointercancel', endPointer); selectionBox.addEventListener('pointerdown', beginPointer); selectionBox.addEventListener('pointermove', movePointer); selectionBox.addEventListener('pointerup', endPointer); stage.addEventListener('pointerdown', beginPointer); stage.addEventListener('pointermove', movePointer); stage.addEventListener('pointerup', endPointer); stage.addEventListener('pointercancel', endPointer);
stage.addEventListener('wheel', (event) => {
  if (!event.ctrlKey) return;
  event.preventDefault();
  const previousZoom = state.stageView.zoom;
  const nextZoom = clamp(previousZoom * (event.deltaY < 0 ? 1.1 : 0.9), 0.5, 4);
  const rect = stage.getBoundingClientRect();
  const pointerX = event.clientX - rect.left - rect.width / 2;
  const pointerY = event.clientY - rect.top - rect.height / 2;
  state.stageView.panX = pointerX - (pointerX - state.stageView.panX) * nextZoom / previousZoom;
  state.stageView.panY = pointerY - (pointerY - state.stageView.panY) * nextZoom / previousZoom;
  state.stageView.zoom = nextZoom;
  applyStageView();
}, { passive: false });
$('#saveButton').addEventListener('click', () => { canvas.toBlob((blob) => { if (!blob) { setStatus('이미지를 저장하지 못했습니다.'); return; } const link = document.createElement('a'); link.download = `sns-image-${new Date().toISOString().slice(0, 10)}.png`; link.href = URL.createObjectURL(blob); link.click(); URL.revokeObjectURL(link.href); setStatus('PNG 파일을 기기에 저장했습니다.'); }, 'image/png'); });
$('#resetButton').addEventListener('click', () => { state.background = { type: 'color', color: '#f7f4ee', image: null, transform: null, blur: 0, mosaic: 0, brightness: 100 }; state.foreground = { image: null, transform: null }; state.stageView = { zoom: 1, panX: 0, panY: 0 }; $('#colorInput').value = '#f7f4ee'; $('#colorValue').textContent = '#F7F4EE'; ['blurInput', 'mosaicInput'].forEach((id) => { $(`#${id}`).value = 0; }); $('#brightnessInput').value = 100; $('#blurValue').textContent = '0'; $('#mosaicValue').textContent = '0'; $('#brightnessValue').textContent = '100%'; setBackgroundType('color'); selectLayer('background'); setCanvasSize(1080, 1080, 'square'); setStatus('새 작업을 시작했습니다.'); });
$('#fitButton').addEventListener('click', () => { state.stageView = { zoom: 1, panX: 0, panY: 0 }; applyStageView(); setStatus('캔버스를 화면에 맞춰 표시 중입니다.'); });

setCanvasSize(1080, 1080, 'square');
