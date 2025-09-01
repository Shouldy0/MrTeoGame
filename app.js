// App state
let currentCards = [];
let filteredCards = [];
let generatedCard = {
  name: "MrTeo — Sguardo al Sole",
  rarity: "RARE",
  element: "earth",
  basePower: 6,
  flavor: "Tendo a rimirare il vasto sole, non importa se mi acceco.",
  imageUrl: ""
};

// DOM Elements
const homeSection = document.getElementById('home');
const catalogSection = document.getElementById('catalog');
const generatorSection = document.getElementById('generator');
const navLinks = document.querySelectorAll('.navlink');

// Catalog elements
const searchInput = document.getElementById('q');
const rarityFilter = document.getElementById('fRarity');
const elementFilter = document.getElementById('fElement');
const catalogGrid = document.getElementById('catalogGrid');
const emptyState = document.getElementById('emptyState');
const homePreview = document.getElementById('homePreview');

// Generator elements
const gName = document.getElementById('gName');
const gRarity = document.getElementById('gRarity');
const gElement = document.getElementById('gElement');
const gPower = document.getElementById('gPower');
const gFlavor = document.getElementById('gFlavor');
const gImg = document.getElementById('gImg');
const tName = document.querySelector('.title');
const tRarity = document.querySelector('.badge');
const tEl = document.getElementById('tEl');
const tFlavor = document.getElementById('tFlavor');
const tPower = document.getElementById('tPower');
const tImg = document.getElementById('tImg');
const cardElement = document.getElementById('card');
const btnExport = document.getElementById('btnExport');

// Viewer elements
const viewer = document.getElementById('viewer');
const vImg = document.getElementById('vImg');
const vTitle = document.getElementById('vTitle');
const vBadges = document.getElementById('vBadges');
const vFlavor = document.getElementById('vFlavor');
const vDownload = document.getElementById('vDownload');

// Caricamento dati e routing basilare
const $ = (s)=>document.querySelector(s);
const $all = (s)=>document.querySelectorAll(s);
const app = { data: [], filtered: [] };

async function init(){
  // routing
  window.addEventListener('hashchange', route);
  route();

  // dati
  try{
    const res = await fetch('data/cards.json', {cache:'no-store'});
    app.data = await res.json();
  }catch(e){ console.error(e); app.data = []; }

  renderHomePreview();
  bindCatalog();
  bindGenerator();
}

/* ---------- Routing ---------- */
function route(){
  const hash = location.hash.replace('#','') || 'home';
  $all('.page').forEach(p=>p.classList.remove('active'));
  $('#'+hash)?.classList.add('active');
}

/* ---------- HOME PREVIEW ---------- */
function renderHomePreview(){
  const wrap = $('#homePreview');
  wrap.innerHTML = '';
  const pick = app.data.slice(0, 6);
  pick.forEach(c=>{
    const el = document.createElement('div');
    el.className = 'card-mini';
    el.style.backgroundImage = `url("${c.imageUrl}")`;
    el.style.backgroundSize = 'cover';
    el.style.backgroundPosition = 'center';
    el.title = c.name;
    el.onclick = ()=>openViewer(c);
    wrap.appendChild(el);
  });
}

/* ---------- CATALOGO ---------- */
function bindCatalog(){
  const q = $('#q'), r = $('#fRarity'), e = $('#fElement');
  const grid = $('#catalogGrid'), empty = $('#emptyState');

  function apply(){
    const text = (q.value||'').toLowerCase().trim();
    const rar = r.value; const el = e.value;
    app.filtered = app.data.filter(c => {
      const okT = !text || c.name.toLowerCase().includes(text) || c.id.toLowerCase().includes(text);
      const okR = !rar || c.rarity === rar;
      const okE = !el || c.element === el;
      return okT && okR && okE;
    });
    grid.innerHTML = '';
    if(!app.filtered.length){ empty.hidden = false; return; }
    empty.hidden = true;
    app.filtered.forEach(c=>{
      const card = document.createElement('div');
      card.className = 'card-mini';
      card.style.backgroundImage = `url("${c.imageUrl}")`;
      card.style.backgroundSize = 'cover';
      card.style.backgroundPosition = 'center';
      card.title = `${c.name} — ${c.rarity}`;
      card.onclick = ()=>openViewer(c);
      grid.appendChild(card);
    });
  }

  [q, r, e].forEach(x=>x.addEventListener('input', apply));
  apply();
}

/* ---------- VIEWER ---------- */
const viewer = $('#viewer');
function openViewer(c){
  $('#vImg').src = c.imageUrl;
  $('#vTitle').textContent = c.name;
  $('#vBadges').textContent = `${c.rarity} • ${c.element} • Potere ${c.basePower}`;
  $('#vFlavor').textContent = c.flavor || '';
  $('#vDownload').href = c.imageUrl;
  $('#vDownload').download = c.id + '.png';
  viewer.showModal();
}

/* ---------- GENERATORE ---------- */
function bindGenerator(){
  const refs = {
    name: $('#gName'), rarity: $('#gRarity'), element: $('#gElement'),
    power: $('#gPower'), img: $('#gImg'), flavor: $('#gFlavor')
  };
  const out = {
    root: $('#card'), name: $('#tName'), rarity: $('#tRarity'), el: $('#tEl'),
    power: $('#tPower'), flavor: $('#tFlavor'), img: $('#tImg')
  };
  const EL_EMOJI = { earth:'🪨', fire:'🔥', water:'💧' };

  function apply(){
    out.name.textContent = refs.name.value;
    out.rarity.textContent = refs.rarity.value;
    out.power.textContent = String(refs.power.value || 1);
    out.flavor.textContent = refs.flavor.value;
    out.root.className = 'card rar-' + refs.rarity.value;
    out.el.textContent = EL_EMOJI[refs.element.value] || '🪨';
    const url = refs.img.value.trim();
    if(url){ out.img.src = url; out.img.style.display='block'; }
    else { out.img.removeAttribute('src'); out.img.style.display='none'; }
  }
  Object.values(refs).forEach(el=>el.addEventListener('input', apply));
  apply();

  // export PNG
  $('#btnExport').addEventListener('click', async ()=>{
    const node = $('#card');
    const canvas = await html2canvas(node, {backgroundColor:null, scale:2});
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    const safe = refs.name.value.replace(/[^\w\-]+/g,'_');
    a.download = `${safe}-${refs.rarity.value}.png`;
    a.click();
  });
}

init();

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
  // Set up navigation
  setupNavigation();
  
  // Load cards
  await loadCards();
  
  // Set up event listeners
  setupEventListeners();
  
  // Render initial card
  renderCardPreview();
});

// Set up navigation
function setupNavigation() {
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('href').substring(1);
      
      // Update active nav link
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      
      // Show target section
      showSection(target);
    });
  });
  
  // Set initial active link
  document.querySelector('.navlink[href="#home"]').classList.add('active');
}

// Set up event listeners
function setupEventListeners() {
  // Catalog filters
  searchInput.addEventListener('input', filterCards);
  rarityFilter.addEventListener('change', filterCards);
  elementFilter.addEventListener('change', filterCards);
  
  // Generator inputs
  gName.addEventListener('input', updateGeneratedCard);
  gRarity.addEventListener('change', updateGeneratedCard);
  gElement.addEventListener('change', updateGeneratedCard);
  gPower.addEventListener('input', updateGeneratedCard);
  gFlavor.addEventListener('input', updateGeneratedCard);
  gImg.addEventListener('input', updateGeneratedCard);
  
  // Export button
  btnExport.addEventListener('click', exportCard);
  
  // Home page buttons
  document.querySelector('.cta-row .primary').addEventListener('click', (e) => {
    e.preventDefault();
    showSection('catalog');
    document.querySelectorAll('.navlink').forEach(l => l.classList.remove('active'));
    document.querySelector('.navlink[href="#catalog"]').classList.add('active');
  });
  
  document.querySelector('.cta-row .btn:not(.primary):not(.ghost)').addEventListener('click', (e) => {
    e.preventDefault();
    showSection('generator');
    document.querySelectorAll('.navlink').forEach(l => l.classList.remove('active'));
    document.querySelector('.navlink[href="#generator"]').classList.add('active');
  });
}

// Show a specific section
function showSection(sectionId) {
  // Hide all sections
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  
  // Show the selected section
  document.getElementById(sectionId).classList.add('active');
  
  // Load cards if catalog is shown
  if (sectionId === 'catalog' && currentCards.length > 0 && filteredCards.length === 0) {
    filterCards();
  }
  
  // Show preview on home
  if (sectionId === 'home' && currentCards.length > 0) {
    showHomePreview();
  }
}

// Load cards from JSON file
async function loadCards() {
  try {
    const response = await fetch('data/cards.json');
    currentCards = await response.json();
    filteredCards = [...currentCards];
  } catch (error) {
    console.error('Error loading cards:', error);
  }
}

// Show preview on home page
function showHomePreview() {
  if (currentCards.length === 0) return;
  
  // Show first 4 cards as preview
  const previewCards = currentCards.slice(0, 4);
  homePreview.innerHTML = previewCards.map(card => `
    <div class="card ${getRarityClass(card.rarity)}" onclick="showCardDetail('${card.id}')">
      <div class="card-in">
        <div class="head">
          <div class="title">${card.name}</div>
          <div class="badge">${card.rarity}</div>
        </div>
        <div class="art">
          <div class="sun"></div>
          ${card.imageUrl ? `<img src="${card.imageUrl}" alt="${card.name}">` : ''}
        </div>
        <div class="el">${getElementEmoji(card.element)}</div>
        <div class="foot">
          <div class="flavor">${card.flavor || ''}</div>
          <div class="power">${card.basePower}</div>
        </div>
      </div>
    </div>
  `).join('');
}

// Filter cards in catalog
function filterCards() {
  const query = searchInput.value.toLowerCase().trim();
  const rarity = rarityFilter.value;
  const element = elementFilter.value;
  
  filteredCards = currentCards.filter(card => {
    // Search query
    if (query && !card.name.toLowerCase().includes(query) && !card.id.toLowerCase().includes(query)) {
      return false;
    }
    
    // Rarity filter
    if (rarity && card.rarity !== rarity) {
      return false;
    }
    
    // Element filter
    if (element && card.element !== element) {
      return false;
    }
    
    return true;
  });
  
  renderCatalog();
}

// Render catalog
function renderCatalog() {
  if (filteredCards.length === 0) {
    catalogGrid.innerHTML = '';
    emptyState.hidden = false;
    return;
  }
  
  emptyState.hidden = true;
  catalogGrid.innerHTML = filteredCards.map(card => `
    <div class="card ${getRarityClass(card.rarity)}" onclick="showCardDetail('${card.id}')">
      <div class="card-in">
        <div class="head">
          <div class="title">${card.name}</div>
          <div class="badge">${card.rarity}</div>
        </div>
        <div class="art">
          <div class="sun"></div>
          ${card.imageUrl ? `<img src="${card.imageUrl}" alt="${card.name}">` : ''}
        </div>
        <div class="el">${getElementEmoji(card.element)}</div>
        <div class="foot">
          <div class="flavor">${card.flavor || ''}</div>
          <div class="power">${card.basePower}</div>
        </div>
      </div>
    </div>
  `).join('');
}

// Show card detail in viewer
function showCardDetail(cardId) {
  const card = currentCards.find(c => c.id === cardId);
  if (!card) return;
  
  vImg.src = card.imageUrl || '';
  vImg.alt = card.name;
  vTitle.textContent = card.name;
  vBadges.innerHTML = `
    <span class="badge">${card.rarity}</span>
    <span class="badge">${getElementName(card.element)} ${getElementEmoji(card.element)}</span>
  `;
  vFlavor.textContent = card.flavor || '';
  vDownload.href = card.imageUrl || '#';
  vDownload.download = `${card.name.replace(/\s+/g, '_')}_${card.rarity}.png`;
  
  viewer.showModal();
}

// Update generated card from inputs
function updateGeneratedCard() {
  generatedCard = {
    name: gName.value,
    rarity: gRarity.value,
    element: gElement.value,
    basePower: parseInt(gPower.value) || 1,
    flavor: gFlavor.value,
    imageUrl: gImg.value
  };
  
  renderCardPreview();
}

// Render card preview
function renderCardPreview() {
  // Update card class for rarity
  cardElement.className = `card ${getRarityClass(generatedCard.rarity)}`;
  
  // Update card content
  tName.textContent = generatedCard.name;
  tRarity.textContent = generatedCard.rarity;
  tEl.textContent = getElementEmoji(generatedCard.element);
  tFlavor.textContent = generatedCard.flavor;
  tPower.textContent = generatedCard.basePower;
  
  // Update image
  if (generatedCard.imageUrl) {
    tImg.src = generatedCard.imageUrl;
    tImg.style.display = 'block';
  } else {
    tImg.removeAttribute('src');
    tImg.style.display = 'none';
  }
}

// Export card as PNG
async function exportCard() {
  try {
    const canvas = await html2canvas(cardElement, {
      backgroundColor: null,
      scale: 2
    });
    
    const png = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    const safeName = generatedCard.name.replace(/[^\w\-]+/g, '_');
    a.href = png;
    a.download = `${safeName}_${generatedCard.rarity}.png`;
    a.click();
  } catch (error) {
    console.error('Error exporting card:', error);
    alert('Errore durante l\'esportazione della carta. Riprova.');
  }
}

// Helper functions
function getRarityClass(rarity) {
  return `rar-${rarity}`;
}

function getElementEmoji(element) {
  switch (element) {
    case 'earth': return '🪨';
    case 'fire': return '🔥';
    case 'water': return '💧';
    default: return '🃏';
  }
}

function getElementName(element) {
  switch (element) {
    case 'earth': return 'Terra';
    case 'fire': return 'Fuoco';
    case 'water': return 'Acqua';
    default: return 'Sconosciuto';
  }
}

// Handle hash changes for navigation
window.addEventListener('hashchange', () => {
  const hash = window.location.hash.substring(1) || 'home';
  showSection(hash);
  
  // Update active nav link
  navLinks.forEach(l => l.classList.remove('active'));
  const activeLink = document.querySelector(`.navlink[href="#${hash}"]`);
  if (activeLink) {
    activeLink.classList.add('active');
  }
});

// Close viewer when clicking outside
viewer.addEventListener('click', (e) => {
  if (e.target === viewer) {
    viewer.close();
  }
});