(function(){
"use strict";

// ===================== CONSTANTS =====================
const DAYS = ['mon','tue','wed','thu','fri','sat','sun'];
const DAY_LABELS = ['Δευτέρα','Τρίτη','Τετάρτη','Πέμπτη','Παρασκευή','Σάββατο','Κυριακή'];
const MEALS = ['breakfast','lunch','dinner','snack'];
const MEAL_LABELS = {breakfast:'Πρωινό',lunch:'Μεσημεριανό',dinner:'Βραδινό',snack:'Σνακ'};
const MEAL_ICONS = {breakfast:'🌅',lunch:'☀️',dinner:'🌙',snack:'🍿'};
const UNITS = ['','φλιτζάνια','κ.σ.','κ.γ.','γρ.','κιλά','ml','L','τεμάχια','κονσέρβες','σκελίδες','φέτες','ματσάκι','πρέζα'];
const GROCERY_CATS = ['Φρούτα & Λαχανικά','Γαλακτοκομικά & Αυγά','Κρέατα & Θαλασσινά','Αρτοποιείο','Ξηρά Τρόφιμα','Κατεψυγμένα','Ποτά','Άλλα'];
const GROCERY_ICONS = {'Φρούτα & Λαχανικά':'🥬','Γαλακτοκομικά & Αυγά':'🥛','Κρέατα & Θαλασσινά':'🥩','Αρτοποιείο':'🍞','Ξηρά Τρόφιμα':'🫙','Κατεψυγμένα':'🧊','Ποτά':'🥤','Άλλα':'📦'};
const LS_RECIPES = 'meal-planner-recipes';
const LS_PLANS = 'meal-planner-plans';
const LS_CURRENT = 'meal-planner-current';
const LS_CHECKED = 'meal-planner-checked';

// ===================== STATE =====================
let recipes = [];
let plans = [];
let currentSlots = {}; // 'mon-breakfast': recipeId
let checkedItems = new Set();
let servings = 2;
let editingRecipeId = null;

// ===================== DOM =====================
const $ = s => document.querySelector(s);
const el = {
  sidebar: $('#sidebar'), sidebarToggle: $('#sidebar-toggle'),
  recipeList: $('#recipe-list'), recipeSearch: $('#recipe-search'),
  addRecipeBtn: $('#add-recipe-btn'),
  main: $('#main'), plannerGrid: $('#planner-grid'),
  surpriseBtn: $('#surprise-btn'), clearWeekBtn: $('#clear-week-btn'),
  planInfo: $('#plan-info'),
  servingsSelect: $('#servings-select'),
  planSelect: $('#plan-select'), savePlanBtn: $('#save-plan-btn'),
  dupPlanBtn: $('#dup-plan-btn'), delPlanBtn: $('#del-plan-btn'),
  groceryPanel: $('#grocery-panel'), groceryToggle: $('#grocery-toggle'),
  groceryClose: $('#grocery-close'), groceryList: $('#grocery-list'),
  uncheckAllBtn: $('#uncheck-all-btn'), copyListBtn: $('#copy-list-btn'),
  printListBtn: $('#print-list-btn'),
  overlay: $('#overlay'),
  modal: $('#recipe-modal'), modalTitle: $('#modal-title'),
  modalClose: $('#modal-close'), modalCancel: $('#modal-cancel'),
  recipeForm: $('#recipe-form'), recipeName: $('#recipe-name'),
  recipeCategory: $('#recipe-category'), recipeServings: $('#recipe-servings'),
  addIngBtn: $('#add-ingredient-btn'), ingredientsList: $('#ingredients-list'),
  recipeMethod: $('#recipe-method'),
  slotPopup: $('#slot-popup'), slotPopupContent: $('#slot-popup-content'),
};

// ===================== PERSISTENCE =====================
function save() {
  localStorage.setItem(LS_RECIPES, JSON.stringify(recipes));
  localStorage.setItem(LS_CURRENT, JSON.stringify(currentSlots));
  localStorage.setItem(LS_PLANS, JSON.stringify(plans));
  localStorage.setItem(LS_CHECKED, JSON.stringify([...checkedItems]));
}
function load() {
  try { recipes = JSON.parse(localStorage.getItem(LS_RECIPES)) || []; } catch(e) { recipes = []; }
  try { plans = JSON.parse(localStorage.getItem(LS_PLANS)) || []; } catch(e) { plans = []; }
  try { currentSlots = JSON.parse(localStorage.getItem(LS_CURRENT)) || {}; } catch(e) { currentSlots = {}; }
  try { checkedItems = new Set(JSON.parse(localStorage.getItem(LS_CHECKED)) || []); } catch(e) { checkedItems = new Set(); }
  if (recipes.length === 0) seedRecipes();
}

// ===================== SEED DATA =====================
function seedRecipes() {
  recipes = [
    {id:genId(),name:'Στραπατσάδα',category:'breakfast',servings:2,ingredients:[
      {name:'Αυγά',quantity:4,unit:'τεμάχια',groceryCategory:'Γαλακτοκομικά & Αυγά'},
      {name:'Ντομάτες',quantity:2,unit:'τεμάχια',groceryCategory:'Φρούτα & Λαχανικά'},
      {name:'Ελαιόλαδο',quantity:2,unit:'κ.σ.',groceryCategory:'Ξηρά Τρόφιμα'},
      {name:'Φέτα',quantity:50,unit:'γρ.',groceryCategory:'Γαλακτοκομικά & Αυγά'},
      {name:'Αλάτι',quantity:1,unit:'πρέζα',groceryCategory:'Ξηρά Τρόφιμα'},
    ]},
    {id:genId(),name:'Γιαούρτι με Μέλι & Καρύδια',category:'breakfast',servings:1,ingredients:[
      {name:'Γιαούρτι στραγγιστό',quantity:1,unit:'φλιτζάνια',groceryCategory:'Γαλακτοκομικά & Αυγά'},
      {name:'Μέλι',quantity:2,unit:'κ.σ.',groceryCategory:'Ξηρά Τρόφιμα'},
      {name:'Καρύδια',quantity:30,unit:'γρ.',groceryCategory:'Ξηρά Τρόφιμα'},
    ]},
    {id:genId(),name:'Τυρόπιτα',category:'breakfast',servings:4,ingredients:[
      {name:'Φύλλο κρούστας',quantity:500,unit:'γρ.',groceryCategory:'Ξηρά Τρόφιμα'},
      {name:'Φέτα',quantity:400,unit:'γρ.',groceryCategory:'Γαλακτοκομικά & Αυγά'},
      {name:'Αυγά',quantity:3,unit:'τεμάχια',groceryCategory:'Γαλακτοκομικά & Αυγά'},
      {name:'Ελαιόλαδο',quantity:4,unit:'κ.σ.',groceryCategory:'Ξηρά Τρόφιμα'},
      {name:'Γάλα',quantity:100,unit:'ml',groceryCategory:'Γαλακτοκομικά & Αυγά'},
    ]},
    {id:genId(),name:'Κουλούρι Θεσσαλονίκης με Τυρί',category:'breakfast',servings:1,ingredients:[
      {name:'Κουλούρι Θεσσαλονίκης',quantity:1,unit:'τεμάχια',groceryCategory:'Αρτοποιείο'},
      {name:'Φέτα',quantity:50,unit:'γρ.',groceryCategory:'Γαλακτοκομικά & Αυγά'},
      {name:'Ντομάτα',quantity:1,unit:'τεμάχια',groceryCategory:'Φρούτα & Λαχανικά'},
    ]},
    {id:genId(),name:'Χωριάτικη Σαλάτα',category:'lunch',servings:2,ingredients:[
      {name:'Ντομάτες',quantity:3,unit:'τεμάχια',groceryCategory:'Φρούτα & Λαχανικά'},
      {name:'Αγγούρι',quantity:1,unit:'τεμάχια',groceryCategory:'Φρούτα & Λαχανικά'},
      {name:'Πιπεριά πράσινη',quantity:1,unit:'τεμάχια',groceryCategory:'Φρούτα & Λαχανικά'},
      {name:'Κρεμμύδι',quantity:1,unit:'τεμάχια',groceryCategory:'Φρούτα & Λαχανικά'},
      {name:'Ελιές Καλαμάτας',quantity:100,unit:'γρ.',groceryCategory:'Ξηρά Τρόφιμα'},
      {name:'Φέτα',quantity:150,unit:'γρ.',groceryCategory:'Γαλακτοκομικά & Αυγά'},
      {name:'Ελαιόλαδο',quantity:3,unit:'κ.σ.',groceryCategory:'Ξηρά Τρόφιμα'},
    ]},
    {id:genId(),name:'Σουβλάκι με Πίτα',category:'lunch',servings:2,ingredients:[
      {name:'Κοτόπουλο στήθος',quantity:400,unit:'γρ.',groceryCategory:'Κρέατα & Θαλασσινά'},
      {name:'Πίτα αραβική',quantity:4,unit:'τεμάχια',groceryCategory:'Αρτοποιείο'},
      {name:'Ντομάτα',quantity:2,unit:'τεμάχια',groceryCategory:'Φρούτα & Λαχανικά'},
      {name:'Κρεμμύδι',quantity:1,unit:'τεμάχια',groceryCategory:'Φρούτα & Λαχανικά'},
      {name:'Τζατζίκι',quantity:150,unit:'γρ.',groceryCategory:'Γαλακτοκομικά & Αυγά'},
      {name:'Ελαιόλαδο',quantity:2,unit:'κ.σ.',groceryCategory:'Ξηρά Τρόφιμα'},
      {name:'Λεμόνι',quantity:1,unit:'τεμάχια',groceryCategory:'Φρούτα & Λαχανικά'},
    ]},
    {id:genId(),name:'Φακές Σούπα',category:'lunch',servings:4,ingredients:[
      {name:'Φακές',quantity:500,unit:'γρ.',groceryCategory:'Ξηρά Τρόφιμα'},
      {name:'Κρεμμύδι',quantity:1,unit:'τεμάχια',groceryCategory:'Φρούτα & Λαχανικά'},
      {name:'Σκόρδο',quantity:2,unit:'σκελίδες',groceryCategory:'Φρούτα & Λαχανικά'},
      {name:'Καρότο',quantity:1,unit:'τεμάχια',groceryCategory:'Φρούτα & Λαχανικά'},
      {name:'Ντοματοπολτός',quantity:2,unit:'κ.σ.',groceryCategory:'Ξηρά Τρόφιμα'},
      {name:'Ελαιόλαδο',quantity:3,unit:'κ.σ.',groceryCategory:'Ξηρά Τρόφιμα'},
      {name:'Δάφνη',quantity:2,unit:'τεμάχια',groceryCategory:'Ξηρά Τρόφιμα'},
    ]},
    {id:genId(),name:'Γεμιστά',category:'lunch',servings:4,ingredients:[
      {name:'Ντομάτες μεγάλες',quantity:6,unit:'τεμάχια',groceryCategory:'Φρούτα & Λαχανικά'},
      {name:'Πιπεριές',quantity:4,unit:'τεμάχια',groceryCategory:'Φρούτα & Λαχανικά'},
      {name:'Ρύζι',quantity:200,unit:'γρ.',groceryCategory:'Ξηρά Τρόφιμα'},
      {name:'Κρεμμύδι',quantity:2,unit:'τεμάχια',groceryCategory:'Φρούτα & Λαχανικά'},
      {name:'Μαϊντανός',quantity:1,unit:'ματσάκι',groceryCategory:'Φρούτα & Λαχανικά'},
      {name:'Ελαιόλαδο',quantity:4,unit:'κ.σ.',groceryCategory:'Ξηρά Τρόφιμα'},
    ]},
    {id:genId(),name:'Μουσακάς',category:'dinner',servings:6,ingredients:[
      {name:'Μελιτζάνες',quantity:3,unit:'τεμάχια',groceryCategory:'Φρούτα & Λαχανικά'},
      {name:'Πατάτες',quantity:3,unit:'τεμάχια',groceryCategory:'Φρούτα & Λαχανικά'},
      {name:'Κιμάς μοσχαρίσιος',quantity:500,unit:'γρ.',groceryCategory:'Κρέατα & Θαλασσινά'},
      {name:'Κρεμμύδι',quantity:1,unit:'τεμάχια',groceryCategory:'Φρούτα & Λαχανικά'},
      {name:'Ντομάτες κονσέρβα',quantity:1,unit:'κονσέρβες',groceryCategory:'Ξηρά Τρόφιμα'},
      {name:'Γάλα',quantity:500,unit:'ml',groceryCategory:'Γαλακτοκομικά & Αυγά'},
      {name:'Αλεύρι',quantity:3,unit:'κ.σ.',groceryCategory:'Ξηρά Τρόφιμα'},
      {name:'Βούτυρο',quantity:50,unit:'γρ.',groceryCategory:'Γαλακτοκομικά & Αυγά'},
    ]},
    {id:genId(),name:'Παστίτσιο',category:'dinner',servings:6,ingredients:[
      {name:'Μακαρόνια παστίτσιο',quantity:500,unit:'γρ.',groceryCategory:'Ξηρά Τρόφιμα'},
      {name:'Κιμάς μοσχαρίσιος',quantity:500,unit:'γρ.',groceryCategory:'Κρέατα & Θαλασσινά'},
      {name:'Κρεμμύδι',quantity:1,unit:'τεμάχια',groceryCategory:'Φρούτα & Λαχανικά'},
      {name:'Ντομάτες κονσέρβα',quantity:1,unit:'κονσέρβες',groceryCategory:'Ξηρά Τρόφιμα'},
      {name:'Γάλα',quantity:500,unit:'ml',groceryCategory:'Γαλακτοκομικά & Αυγά'},
      {name:'Αυγά',quantity:2,unit:'τεμάχια',groceryCategory:'Γαλακτοκομικά & Αυγά'},
      {name:'Κεφαλοτύρι τριμμένο',quantity:100,unit:'γρ.',groceryCategory:'Γαλακτοκομικά & Αυγά'},
    ]},
    {id:genId(),name:'Κοτόπουλο Λεμονάτο',category:'dinner',servings:4,ingredients:[
      {name:'Κοτόπουλο μπούτια',quantity:1,unit:'κιλά',groceryCategory:'Κρέατα & Θαλασσινά'},
      {name:'Πατάτες',quantity:4,unit:'τεμάχια',groceryCategory:'Φρούτα & Λαχανικά'},
      {name:'Λεμόνια',quantity:2,unit:'τεμάχια',groceryCategory:'Φρούτα & Λαχανικά'},
      {name:'Σκόρδο',quantity:4,unit:'σκελίδες',groceryCategory:'Φρούτα & Λαχανικά'},
      {name:'Ελαιόλαδο',quantity:4,unit:'κ.σ.',groceryCategory:'Ξηρά Τρόφιμα'},
      {name:'Ρίγανη',quantity:1,unit:'κ.σ.',groceryCategory:'Ξηρά Τρόφιμα'},
    ]},
    {id:genId(),name:'Χταπόδι Σχάρας',category:'dinner',servings:4,ingredients:[
      {name:'Χταπόδι',quantity:1,unit:'κιλά',groceryCategory:'Κρέατα & Θαλασσινά'},
      {name:'Ελαιόλαδο',quantity:4,unit:'κ.σ.',groceryCategory:'Ξηρά Τρόφιμα'},
      {name:'Ξύδι',quantity:2,unit:'κ.σ.',groceryCategory:'Ξηρά Τρόφιμα'},
      {name:'Ρίγανη',quantity:1,unit:'κ.γ.',groceryCategory:'Ξηρά Τρόφιμα'},
      {name:'Λεμόνι',quantity:1,unit:'τεμάχια',groceryCategory:'Φρούτα & Λαχανικά'},
    ]},
    {id:genId(),name:'Σπανακόπιτα',category:'snack',servings:6,ingredients:[
      {name:'Σπανάκι',quantity:500,unit:'γρ.',groceryCategory:'Φρούτα & Λαχανικά'},
      {name:'Φέτα',quantity:300,unit:'γρ.',groceryCategory:'Γαλακτοκομικά & Αυγά'},
      {name:'Φύλλο κρούστας',quantity:500,unit:'γρ.',groceryCategory:'Ξηρά Τρόφιμα'},
      {name:'Κρεμμύδια ξερά',quantity:2,unit:'τεμάχια',groceryCategory:'Φρούτα & Λαχανικά'},
      {name:'Άνηθος',quantity:1,unit:'ματσάκι',groceryCategory:'Φρούτα & Λαχανικά'},
      {name:'Ελαιόλαδο',quantity:4,unit:'κ.σ.',groceryCategory:'Ξηρά Τρόφιμα'},
    ]},
    {id:genId(),name:'Ντολμαδάκια',category:'snack',servings:4,ingredients:[
      {name:'Αμπελόφυλλα',quantity:250,unit:'γρ.',groceryCategory:'Ξηρά Τρόφιμα'},
      {name:'Ρύζι',quantity:200,unit:'γρ.',groceryCategory:'Ξηρά Τρόφιμα'},
      {name:'Κρεμμύδια ξερά',quantity:3,unit:'τεμάχια',groceryCategory:'Φρούτα & Λαχανικά'},
      {name:'Άνηθος',quantity:1,unit:'ματσάκι',groceryCategory:'Φρούτα & Λαχανικά'},
      {name:'Λεμόνι',quantity:2,unit:'τεμάχια',groceryCategory:'Φρούτα & Λαχανικά'},
      {name:'Ελαιόλαδο',quantity:4,unit:'κ.σ.',groceryCategory:'Ξηρά Τρόφιμα'},
    ]},
    {id:genId(),name:'Τζατζίκι με Πίτα',category:'snack',servings:2,ingredients:[
      {name:'Γιαούρτι στραγγιστό',quantity:200,unit:'γρ.',groceryCategory:'Γαλακτοκομικά & Αυγά'},
      {name:'Αγγούρι',quantity:1,unit:'τεμάχια',groceryCategory:'Φρούτα & Λαχανικά'},
      {name:'Σκόρδο',quantity:2,unit:'σκελίδες',groceryCategory:'Φρούτα & Λαχανικά'},
      {name:'Ελαιόλαδο',quantity:1,unit:'κ.σ.',groceryCategory:'Ξηρά Τρόφιμα'},
      {name:'Πίτα αραβική',quantity:2,unit:'τεμάχια',groceryCategory:'Αρτοποιείο'},
    ]},
  ];
  save();
}

function genId(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,8); }

// ===================== RECIPE LIBRARY SIDEBAR =====================
function renderRecipeList() {
  const filter = (el.recipeSearch.value || '').toLowerCase();
  const grouped = {};
  for (const m of MEALS) grouped[m] = [];
  for (const r of recipes) {
    if (filter && !r.name.toLowerCase().includes(filter)) continue;
    const cat = MEALS.includes(r.category) ? r.category : 'snack';
    grouped[cat].push(r);
  }

  let html = '';
  for (const m of MEALS) {
    const list = grouped[m];
    if (list.length === 0 && filter) continue;
    html += `<div class="recipe-group-label">${MEAL_ICONS[m]} ${MEAL_LABELS[m]} (${list.length})</div>`;
    for (const r of list) {
      html += `<div class="recipe-card" draggable="true" data-id="${r.id}" data-category="${r.category}">
        <div class="rc-name">${esc(r.name)}</div>
        <div class="rc-meta">${r.servings} μερίδες · ${r.ingredients.length} υλικά</div>
        <div class="rc-actions">
          <button class="btn btn-sm rc-edit" data-id="${r.id}">✏️</button>
          <button class="btn btn-sm btn-danger rc-del" data-id="${r.id}">✕</button>
        </div>
      </div>`;
    }
  }
  el.recipeList.innerHTML = html;
  attachDragStart();
  attachRecipeCardActions();
}

function attachDragStart() {
  el.recipeList.querySelectorAll('.recipe-card').forEach(card => {
    card.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', card.dataset.id);
      e.dataTransfer.effectAllowed = 'copy';
      card.style.opacity = '0.5';
      setTimeout(() => card.style.opacity = '', 0);
    });
    // Touch fallback
    card.addEventListener('touchstart', handleTouchStart, {passive:false});
  });
}

function attachRecipeCardActions() {
  el.recipeList.querySelectorAll('.rc-edit').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); openEditRecipe(btn.dataset.id); });
  });
  el.recipeList.querySelectorAll('.rc-del').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      if (confirm('Διαγραφή αυτής της συνταγής;')) {
        recipes = recipes.filter(r => r.id !== btn.dataset.id);
        // Remove from slots
        for (const k of Object.keys(currentSlots)) {
          if (currentSlots[k] === btn.dataset.id) delete currentSlots[k];
        }
        save(); renderRecipeList(); renderGrid(); generateGroceryList();
      }
    });
  });
}

el.recipeSearch.addEventListener('input', renderRecipeList);

// ===================== TOUCH DRAG FALLBACK =====================
let touchDragId = null;
let touchGhost = null;

function handleTouchStart(e) {
  const card = e.currentTarget;
  touchDragId = card.dataset.id;
  const touch = e.touches[0];
  touchGhost = card.cloneNode(true);
  touchGhost.style.cssText = 'position:fixed;pointer-events:none;opacity:.8;z-index:999;width:'+card.offsetWidth+'px;';
  touchGhost.style.left = touch.clientX - 30 + 'px';
  touchGhost.style.top = touch.clientY - 20 + 'px';
  document.body.appendChild(touchGhost);
  document.addEventListener('touchmove', handleTouchMove, {passive:false});
  document.addEventListener('touchend', handleTouchEnd);
}

function handleTouchMove(e) {
  e.preventDefault();
  if (!touchGhost) return;
  const touch = e.touches[0];
  touchGhost.style.left = touch.clientX - 30 + 'px';
  touchGhost.style.top = touch.clientY - 20 + 'px';
  // Highlight drop target
  document.querySelectorAll('.grid-cell').forEach(c => c.classList.remove('drag-over'));
  const elem = document.elementFromPoint(touch.clientX, touch.clientY);
  const cell = elem?.closest?.('.grid-cell');
  if (cell) cell.classList.add('drag-over');
}

function handleTouchEnd(e) {
  document.removeEventListener('touchmove', handleTouchMove);
  document.removeEventListener('touchend', handleTouchEnd);
  if (touchGhost) { touchGhost.remove(); touchGhost = null; }
  if (!touchDragId) return;
  const touch = e.changedTouches[0];
  const elem = document.elementFromPoint(touch.clientX, touch.clientY);
  const cell = elem?.closest?.('.grid-cell');
  if (cell) {
    const slotKey = cell.dataset.slot;
    if (slotKey) {
      currentSlots[slotKey] = touchDragId;
      save(); renderGrid(); generateGroceryList();
    }
  }
  document.querySelectorAll('.grid-cell').forEach(c => c.classList.remove('drag-over'));
  touchDragId = null;
}

// ===================== PLANNER GRID =====================
function renderGrid() {
  let html = '';
  // Header row
  html += '<div class="grid-header"></div>';
  for (const d of DAY_LABELS) html += `<div class="grid-header">${d.slice(0,3)}</div>`;

  // Meal rows
  for (const m of MEALS) {
    html += `<div class="grid-row-label" data-meal="${m}">${MEAL_ICONS[m]}<br>${MEAL_LABELS[m]}</div>`;
    for (let di = 0; di < 7; di++) {
      const key = DAYS[di] + '-' + m;
      const recipeId = currentSlots[key];
      const recipe = recipeId ? recipes.find(r => r.id === recipeId) : null;
      const isEmpty = !recipe;
      html += `<div class="grid-cell${isEmpty?' empty':''}" data-slot="${key}" data-meal="${m}">`;
      if (recipe) {
        html += `<div class="meal-card" data-category="${recipe.category}" data-slot="${key}" data-id="${recipe.id}">
          ${esc(recipe.name)}
          <button class="mc-remove" data-slot="${key}" title="Remove">✕</button>
        </div>`;
      }
      html += '</div>';
    }
  }
  el.plannerGrid.innerHTML = html;
  attachDropTargets();
  attachMealCardClicks();

  // Plan info
  const filled = Object.keys(currentSlots).filter(k => currentSlots[k]).length;
  el.planInfo.textContent = `${filled} από 28 γεύματα · Μαγειρεύω για ${servings} ${servings===1?'άτομο':'άτομα'}`;
}

function attachDropTargets() {
  el.plannerGrid.querySelectorAll('.grid-cell').forEach(cell => {
    cell.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; cell.classList.add('drag-over'); });
    cell.addEventListener('dragleave', () => cell.classList.remove('drag-over'));
    cell.addEventListener('drop', e => {
      e.preventDefault(); cell.classList.remove('drag-over');
      const recipeId = e.dataTransfer.getData('text/plain');
      const slot = cell.dataset.slot;
      if (recipeId && slot) {
        currentSlots[slot] = recipeId;
        save(); renderGrid(); generateGroceryList();
      }
    });
  });
}

function attachMealCardClicks() {
  // Remove buttons
  el.plannerGrid.querySelectorAll('.mc-remove').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      delete currentSlots[btn.dataset.slot];
      save(); renderGrid(); generateGroceryList();
    });
  });
  // Card click → popup
  el.plannerGrid.querySelectorAll('.meal-card').forEach(card => {
    card.addEventListener('click', e => {
      e.stopPropagation();
      showSlotPopup(card.dataset.id, card.dataset.slot, card);
    });
  });
}

// ===================== SLOT POPUP =====================
function showSlotPopup(recipeId, slotKey, anchor) {
  const recipe = recipes.find(r => r.id === recipeId);
  if (!recipe) return;
  const ingList = recipe.ingredients.map(i => `${i.quantity} ${i.unit} ${i.name}`).join(', ');
  const methodHtml = recipe.method ? `<div class="sp-method"><strong>📝 Μέθοδος:</strong><br>${esc(recipe.method).replace(/\n/g,'<br>')}</div>` : '';
  el.slotPopupContent.innerHTML = `
    <div class="sp-name">${esc(recipe.name)}</div>
    <div class="sp-meta">${MEAL_ICONS[recipe.category]} ${MEAL_LABELS[recipe.category]} · ${recipe.servings} μερίδες</div>
    <div class="sp-ingredients">${esc(ingList)}</div>
    ${methodHtml}
    <div class="sp-actions">
      <button class="btn btn-sm sp-edit" data-id="${recipe.id}">✏️ Edit</button>
      <button class="btn btn-sm btn-danger sp-remove" data-slot="${slotKey}">🗑️ Remove</button>
    </div>`;
  // Position
  const rect = anchor.getBoundingClientRect();
  el.slotPopup.style.left = rect.left + 'px';
  el.slotPopup.style.top = (rect.bottom + 4) + 'px';
  el.slotPopup.classList.remove('hidden');

  el.slotPopup.querySelector('.sp-edit').addEventListener('click', () => { hideSlotPopup(); openEditRecipe(recipeId); });
  el.slotPopup.querySelector('.sp-remove').addEventListener('click', () => { delete currentSlots[slotKey]; save(); renderGrid(); generateGroceryList(); hideSlotPopup(); });
}

function hideSlotPopup() { el.slotPopup.classList.add('hidden'); }
document.addEventListener('click', e => { if (!el.slotPopup.contains(e.target) && !e.target.closest('.meal-card')) hideSlotPopup(); });

// ===================== RECIPE MODAL =====================
function openAddRecipe() {
  editingRecipeId = null;
  el.modalTitle.textContent = 'Προσθήκη Συνταγής';
  el.recipeName.value = '';
  el.recipeCategory.value = 'dinner';
  el.recipeServings.value = 2;
  el.recipeMethod.value = '';
  el.ingredientsList.innerHTML = '';
  addIngredientRow();
  el.modal.classList.remove('hidden');
  el.recipeName.focus();
}

function openEditRecipe(id) {
  const r = recipes.find(r => r.id === id);
  if (!r) return;
  editingRecipeId = id;
  el.modalTitle.textContent = 'Επεξεργασία Συνταγής';
  el.recipeName.value = r.name;
  el.recipeCategory.value = r.category;
  el.recipeServings.value = r.servings;
  el.recipeMethod.value = r.method || '';
  el.ingredientsList.innerHTML = '';
  for (const ing of r.ingredients) addIngredientRow(ing);
  el.modal.classList.remove('hidden');
}

function closeModal() { el.modal.classList.add('hidden'); editingRecipeId = null; }

function addIngredientRow(ing) {
  const row = document.createElement('div');
  row.className = 'ingredient-row';
  row.innerHTML = `
    <input type="text" placeholder="Υλικό" value="${esc(ing?.name||'')}" class="ing-name" required>
    <input type="number" placeholder="Ποσ." value="${ing?.quantity||''}" class="ing-qty" min="0" step="0.25">
    <select class="ing-unit">${UNITS.map(u => `<option value="${u}"${ing?.unit===u?' selected':''}>${u||'—'}</option>`).join('')}</select>
    <select class="ing-cat">${GROCERY_CATS.map(c => `<option value="${c}"${ing?.groceryCategory===c?' selected':''}>${c}</option>`).join('')}</select>
    <button type="button" class="remove-ing" title="Remove">✕</button>`;
  row.querySelector('.remove-ing').addEventListener('click', () => row.remove());
  el.ingredientsList.appendChild(row);
}

el.addRecipeBtn.addEventListener('click', openAddRecipe);
el.modalClose.addEventListener('click', closeModal);
el.modalCancel.addEventListener('click', closeModal);
el.addIngBtn.addEventListener('click', () => addIngredientRow());

el.recipeForm.addEventListener('submit', e => {
  e.preventDefault();
  const name = el.recipeName.value.trim();
  if (!name) return;
  const ingredients = [];
  el.ingredientsList.querySelectorAll('.ingredient-row').forEach(row => {
    const n = row.querySelector('.ing-name').value.trim();
    if (!n) return;
    ingredients.push({
      name: n,
      quantity: parseFloat(row.querySelector('.ing-qty').value) || 0,
      unit: row.querySelector('.ing-unit').value,
      groceryCategory: row.querySelector('.ing-cat').value,
    });
  });
  if (ingredients.length === 0) { alert('Προσθέστε τουλάχιστον ένα υλικό.'); return; }

  const method = el.recipeMethod.value.trim();

  if (editingRecipeId) {
    const r = recipes.find(r => r.id === editingRecipeId);
    if (r) { r.name = name; r.category = el.recipeCategory.value; r.servings = +el.recipeServings.value || 2; r.ingredients = ingredients; r.method = method; }
  } else {
    recipes.push({ id: genId(), name, category: el.recipeCategory.value, servings: +el.recipeServings.value || 2, ingredients, method });
  }
  save(); renderRecipeList(); renderGrid(); generateGroceryList(); closeModal();
});

// ===================== SERVINGS MULTIPLIER =====================
el.servingsSelect.addEventListener('change', () => {
  servings = +el.servingsSelect.value || 2;
  renderGrid(); generateGroceryList();
});

// ===================== GROCERY LIST =====================
function generateGroceryList() {
  const merged = {}; // key: lowercase name + unit → {name, quantity, unit, groceryCategory}
  for (const [slot, recipeId] of Object.entries(currentSlots)) {
    if (!recipeId) continue;
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) continue;
    const scale = recipe.servings > 0 ? servings / recipe.servings : 1;
    for (const ing of recipe.ingredients) {
      const key = ing.name.toLowerCase() + '|' + (ing.unit||'').toLowerCase();
      if (!merged[key]) {
        merged[key] = { name: ing.name, quantity: 0, unit: ing.unit, groceryCategory: ing.groceryCategory || 'Other' };
      }
      merged[key].quantity += (ing.quantity || 0) * scale;
    }
  }

  // Group by category
  const byCategory = {};
  for (const cat of GROCERY_CATS) byCategory[cat] = [];
  for (const item of Object.values(merged)) {
    const cat = GROCERY_CATS.includes(item.groceryCategory) ? item.groceryCategory : 'Other';
    byCategory[cat].push(item);
  }

  let html = '';
  let anyItems = false;
  for (const cat of GROCERY_CATS) {
    const items = byCategory[cat];
    if (items.length === 0) continue;
    anyItems = true;
    items.sort((a,b) => a.name.localeCompare(b.name));
    html += `<div class="grocery-category">
      <div class="grocery-category-header">${GROCERY_ICONS[cat]||'📦'} ${cat}</div>`;
    for (const item of items) {
      const itemKey = item.name.toLowerCase() + '|' + item.unit;
      const checked = checkedItems.has(itemKey);
      const qtyStr = formatQty(item.quantity) + (item.unit ? ' ' + item.unit : '');
      html += `<div class="grocery-item${checked?' checked':''}" data-key="${esc(itemKey)}">
        <input type="checkbox" ${checked?'checked':''}>
        <span class="gi-text">${esc(item.name)}</span>
        <span class="gi-qty">${qtyStr}</span>
      </div>`;
    }
    html += '</div>';
  }

  if (!anyItems) html = '<div style="padding:20px;text-align:center;color:var(--text3)">Προγραμματίστε γεύματα για να δημιουργηθεί η λίστα αγορών!</div>';
  el.groceryList.innerHTML = html;

  // Checkbox handlers
  el.groceryList.querySelectorAll('.grocery-item input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => {
      const item = cb.closest('.grocery-item');
      const key = item.dataset.key;
      if (cb.checked) { checkedItems.add(key); item.classList.add('checked'); }
      else { checkedItems.delete(key); item.classList.remove('checked'); }
      save();
    });
  });
}

function formatQty(q) {
  if (q === 0) return '';
  if (q === Math.floor(q)) return String(q);
  return q.toFixed(2).replace(/\.?0+$/,'');
}

// Uncheck all
el.uncheckAllBtn.addEventListener('click', () => { checkedItems.clear(); save(); generateGroceryList(); });

// Copy to clipboard
el.copyListBtn.addEventListener('click', () => {
  const lines = [];
  el.groceryList.querySelectorAll('.grocery-category').forEach(cat => {
    const header = cat.querySelector('.grocery-category-header').textContent;
    lines.push('\n' + header);
    cat.querySelectorAll('.grocery-item').forEach(item => {
      const name = item.querySelector('.gi-text').textContent;
      const qty = item.querySelector('.gi-qty').textContent;
      lines.push('  ' + (qty ? qty + ' ' : '') + name);
    });
  });
  navigator.clipboard.writeText(lines.join('\n').trim()).then(() => {
    el.copyListBtn.textContent = '✓ Αντιγράφηκε!';
    setTimeout(() => el.copyListBtn.textContent = '📋 Αντιγραφή', 1500);
  });
});

// Print
el.printListBtn.addEventListener('click', () => {
  el.groceryPanel.classList.add('open');
  setTimeout(() => window.print(), 100);
});

// ===================== GROCERY PANEL TOGGLE =====================
el.groceryToggle.addEventListener('click', () => {
  el.groceryPanel.classList.toggle('open');
  el.overlay.classList.toggle('hidden', !el.groceryPanel.classList.contains('open'));
});
el.groceryClose.addEventListener('click', () => {
  el.groceryPanel.classList.remove('open');
  el.overlay.classList.add('hidden');
});

// ===================== SIDEBAR TOGGLE =====================
el.sidebarToggle.addEventListener('click', () => {
  el.sidebar.classList.toggle('open');
  if (window.innerWidth <= 900) {
    el.overlay.classList.toggle('hidden', !el.sidebar.classList.contains('open'));
  }
});
el.overlay.addEventListener('click', () => {
  el.sidebar.classList.remove('open');
  el.groceryPanel.classList.remove('open');
  el.overlay.classList.add('hidden');
});

// ===================== SURPRISE ME =====================
el.surpriseBtn.addEventListener('click', () => {
  for (const m of MEALS) {
    const candidates = recipes.filter(r => r.category === m);
    if (candidates.length === 0) continue;
    for (let di = 0; di < 7; di++) {
      const key = DAYS[di] + '-' + m;
      if (currentSlots[key]) continue;
      currentSlots[key] = candidates[Math.floor(Math.random() * candidates.length)].id;
    }
  }
  save(); renderGrid(); generateGroceryList();
});

// ===================== CLEAR WEEK =====================
el.clearWeekBtn.addEventListener('click', () => {
  if (!confirm('Καθαρισμός όλων των γευμάτων αυτής της εβδομάδας;')) return;
  currentSlots = {};
  save(); renderGrid(); generateGroceryList();
});

// ===================== SAVE / LOAD / DUPLICATE / DELETE PLANS =====================
function renderPlanSelect() {
  el.planSelect.innerHTML = '<option value="">— Τρέχον Πλάνο —</option>';
  for (const p of plans) {
    el.planSelect.innerHTML += `<option value="${p.id}">${esc(p.name)}</option>`;
  }
}

el.savePlanBtn.addEventListener('click', () => {
  const name = prompt('Όνομα πλάνου:', 'Εβδομάδα ' + new Date().toLocaleDateString('el-GR'));
  if (!name) return;
  plans.push({ id: genId(), name, slots: {...currentSlots} });
  save(); renderPlanSelect();
});

el.planSelect.addEventListener('change', () => {
  const id = el.planSelect.value;
  if (!id) return;
  const plan = plans.find(p => p.id === id);
  if (plan) { currentSlots = {...plan.slots}; save(); renderGrid(); generateGroceryList(); }
});

el.dupPlanBtn.addEventListener('click', () => {
  const name = prompt('Όνομα αντιγράφου:', 'Αντίγραφο πλάνου');
  if (!name) return;
  plans.push({ id: genId(), name, slots: {...currentSlots} });
  save(); renderPlanSelect();
});

el.delPlanBtn.addEventListener('click', () => {
  const id = el.planSelect.value;
  if (!id) { alert('Επιλέξτε ένα αποθηκευμένο πλάνο για διαγραφή.'); return; }
  if (!confirm('Διαγραφή αυτού του πλάνου;')) return;
  plans = plans.filter(p => p.id !== id);
  el.planSelect.value = '';
  save(); renderPlanSelect();
});

// ===================== KEYBOARD SHORTCUTS =====================
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
    if (e.key === 'Escape') { e.target.blur(); closeModal(); hideSlotPopup(); }
    return;
  }
  if (e.key === 'Escape') { closeModal(); hideSlotPopup(); el.groceryPanel.classList.remove('open'); el.overlay.classList.add('hidden'); }
});

// ===================== UTILITIES =====================
function esc(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ===================== INIT =====================
function init() {
  load();
  renderRecipeList();
  renderGrid();
  generateGroceryList();
  renderPlanSelect();
}
init();

})();
