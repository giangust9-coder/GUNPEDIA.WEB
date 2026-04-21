let weapons = [];
let sortAscending = true;
let activeFilters = { cat: null, origin: null, wars: null };

// 1. CARGA INICIAL ULTRA-OPTIMIZADA
async function loadDatabase() {
    const container = document.getElementById('wiki-container');
    if (container) {
        container.innerHTML = `<div class="loading" style="font-family: var(--font-mono); text-align:center; padding:50px; color: var(--military-green);">
            [ INICIANDO ESCANEO DE INTEGRIDAD PARALELO... ]
        </div>`;
    }

    try {
        const response = await fetch('armas.json');
        if (!response.ok) throw new Error("Archivo JSON no encontrado");
        
        const datosSucios = await response.json();
        
        // PASO A: LIMPIEZA DE DUPLICADOS (INSTANTÁNEO)
        const sinRepetidos = eliminarDuplicados(datosSucios);
        
        // PASO B: ESCANEO EN PARALELO (NO BLOQUEANTE)
        // Lanzamos todas las verificaciones de Wikipedia al mismo tiempo
        const promesas = sinRepetidos.map(w => verificarWiki(w));
        const resultados = await Promise.all(promesas);
        
        // Filtramos solo las que respondieron OK
        weapons = resultados.filter(w => w !== null);

        console.log(`[LOG] Sistema Operativo. Modelos válidos: ${weapons.length}`);

        createFilterButtons();
        applyFilters(); 
    } catch (e) {
        console.error("Fallo en el sistema:", e);
        if (container) {
            container.innerHTML = `<p style="color:red; text-align:center; font-family: var(--font-mono);">ERROR CRÍTICO: FALLO EN LA BASE DE DATOS</p>`;
        }
    }
}

// Función de verificación rápida
async function verificarWiki(w) {
    try {
        const urlParts = w.wiki.split('/');
        const title = urlParts.pop();
        const lang = w.wiki.split('.')[0].split('//')[1] || 'es';
        const res = await fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${title}`);
        return res.ok ? w : null;
    } catch (e) {
        return null;
    }
}

function eliminarDuplicados(lista) {
    const mapa = new Map();
    lista.forEach(item => {
        const id = item.name.trim().toLowerCase();
        if (!mapa.has(id)) mapa.set(id, item);
    });
    return Array.from(mapa.values());
}

// 2. GENERADOR DE FILTROS
function createFilterButtons() {
    const catContainer = document.getElementById('cat-filters');
    const originContainer = document.getElementById('origin-filters');
    const warsContainer = document.getElementById('wars-filters');
    if(!catContainer || !originContainer || !warsContainer) return;

    const cats = [...new Set(weapons.map(w => w.cat))].sort();
    const origins = [...new Set(weapons.map(w => w.origin))].sort();
    const wars = [...new Set(weapons.flatMap(w => w.wars))].sort();

    catContainer.innerHTML = cats.map(c => 
        `<button class="filter-tag" onclick="setFilter('cat', '${c}', this)" style="font-family: var(--font-mono);">${c}</button>`
    ).join('');
    
    originContainer.innerHTML = origins.map(o => 
        `<button class="filter-tag" onclick="setFilter('origin', '${o}', this)" style="font-family: var(--font-mono);">${o}</button>`
    ).join('');
    
    warsContainer.innerHTML = wars.map(w => 
        `<button class="filter-tag" onclick="setFilter('wars', '${w}', this)" style="font-family: var(--font-mono);">${w}</button>`
    ).join('');
}

// 3. SISTEMA DE FILTRADO Y RENDER
function setFilter(type, value, el) {
    if (activeFilters[type] === value) {
        activeFilters[type] = null;
        el.classList.remove('active');
    } else {
        el.parentElement.querySelectorAll('.filter-tag').forEach(b => b.classList.remove('active'));
        activeFilters[type] = value;
        el.classList.add('active');
    }
    applyFilters();
}

function applyFilters() {
    const searchInput = document.getElementById('searchBar');
    const busqueda = searchInput ? searchInput.value.toLowerCase() : "";

    let filtrados = weapons.filter(w => {
        const mCat = activeFilters.cat ? w.cat === activeFilters.cat : true;
        const mOri = activeFilters.origin ? w.origin === activeFilters.origin : true;
        const mWar = activeFilters.wars ? w.wars.includes(activeFilters.wars) : true;
        const mTex = w.name.toLowerCase().includes(busqueda);
        return mCat && mOri && mWar && mTex;
    });

    renderWiki(filtrados);
}

// 1. RENDERIZADO DE TARJETAS (Actualizado con Lazy Loading)
function renderWiki(data) {
    const container = document.getElementById('wiki-container');
    if (!container) return;
    container.innerHTML = "";

    data.sort((a, b) => sortAscending ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));

    const fragment = document.createDocumentFragment();
    
    // Creamos el observador para cargar imágenes solo cuando sean visibles
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const weaponData = JSON.parse(img.dataset.weapon);
                fetchThumb(weaponData, img.id);
                observer.unobserve(img); // Dejar de observar una vez cargada
            }
        });
    }, { rootMargin: '50px' });

    data.forEach((w, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.onclick = () => openModal(w);
        
        // Reemplaza la línea del imgId por esta:
const imgId = `thumb-${index}-${btoa(unescape(encodeURIComponent(w.name))).substring(0, 5)}`;
        
        card.innerHTML = `
            <div class="card-image-container" style="background: rgba(0,0,0,0.3); height: 120px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" 
                     class="wiki-thumb lazy-img" 
                     id="${imgId}" 
                     data-weapon='${JSON.stringify(w)}'
                     style="width: 100%; height: 100%; object-fit: cover; transition: opacity 0.5s; opacity: 0;">
            </div>
            <div style="padding: 10px;">
                <small style="color:var(--military-green); font-family:var(--font-mono); font-size:0.6rem; display:block;">REF_IDX: ${index + 1000}</small>
                <h3 style="font-family: var(--font-stencil); margin: 5px 0; font-size: 1.1rem; line-height: 1;">${w.name}</h3>
                <p style="font-family: var(--font-mono); font-size:0.7rem; margin:0;"><span class="tag" style="background:var(--military-green); color:black; padding:0 3px;">${w.origin}</span></p>
            </div>
        `;
        
        fragment.appendChild(card);
        // Registramos la imagen en el observador
        setTimeout(() => {
            const imgElement = card.querySelector('.lazy-img');
            if(imgElement) imageObserver.observe(imgElement);
        }, 0);
    });
    
    container.appendChild(fragment);
}

// 2. FETCH DE IMAGENES (Extracción de ID mejorada)
async function fetchThumb(w, id) {
    const el = document.getElementById(id);
    if (!el) return;

    try {
        // Extraemos el título exacto de la URL de Wikipedia para evitar errores de búsqueda
        const urlParts = w.wiki.split('/wiki/');
        if (urlParts.length < 2) return;
        
        const title = urlParts[1];
        const lang = w.wiki.split('.')[0].split('//')[1] || 'es';

        const res = await fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${title}`);
        if (!res.ok) throw new Error("Status: " + res.status);

        const d = await res.json();
        
        if (d.thumbnail && d.thumbnail.source) {
            el.src = d.thumbnail.source;
            el.style.opacity = "1";
        } else {
            // Icono de reemplazo si el artículo no tiene foto
            el.src = "https://cdn-icons-png.flaticon.com/512/2591/2591559.png";
            el.style.opacity = "0.2";
            el.style.filter = "grayscale(1)";
        }
    } catch (e) {
        console.error(`Error cargando miniatura para ${w.name}:`, e);
        el.src = "https://cdn-icons-png.flaticon.com/512/2591/2591559.png";
        el.style.opacity = "0.1";
    }
}

// 4. MODAL CON TRADUCCIÓN UNIVERSAL
async function openModal(weapon) {
    const modal = document.getElementById('weaponModal');
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `<div class="loading" style="font-family: var(--font-mono);">ACCEDIENDO A BASE DE DATOS...</div>`;
    modal.style.display = 'block';

    const title = weapon.wiki.split('/').pop();
    const lang = weapon.wiki.split('.')[0].split('//')[1];

    try {
        const response = await fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${title}`);
        const data = await response.json();
        let text = data.extract || "Sin datos.";

        if (lang !== 'es') {
            text = await translateText(text, lang, 'es');
        }

        modalBody.innerHTML = `
            <div class="modal-grid">
                ${data.originalimage ? `<img src="${data.originalimage.source}" class="modal-img">` : ''}
                <div class="modal-info">
                    <h2 style="font-family: var(--font-stencil); color: var(--military-green);">${weapon.name}</h2>
                    <p style="font-family: var(--font-mono); font-weight:bold;">ORIGEN: ${weapon.origin}</p>
                    <p style="font-family: var(--font-mono); font-weight:bold;">GUERRAS: ${weapon.wars.join(', ')}</p>
                    <hr style="border: 0.5px solid var(--military-green); opacity: 0.2;">
                    <p style="font-family: var(--font-mono); line-height: 1.5;">${text}</p>
                    <a href="${weapon.wiki}" target="_blank" class="wiki-link" style="font-family: var(--font-mono);">EXPEDIENTE WIKIPEDIA</a>
                </div>
            </div>
        `;
    } catch (e) {
        modalBody.innerHTML = `<p style="font-family: var(--font-mono);">ERROR DE ENLACE SATELITAL.</p>`;
    }
}

async function translateText(text, sl, tl) {
    try {
        const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURI(text)}`);
        const d = await res.json();
        return d[0].map(i => i[0]).join('');
    } catch (e) { return text; }
}

function closeModal() { document.getElementById('weaponModal').style.display = "none"; }

// 5. EVENTOS
document.addEventListener('DOMContentLoaded', () => {
    loadDatabase();
    const sb = document.getElementById('searchBar');
    if(sb) {
        sb.addEventListener('input', applyFilters);
        sb.style.fontFamily = "var(--font-mono)";
    }
    window.onclick = (e) => { if (e.target.id == 'weaponModal') closeModal(); };
});

function toggleSortOrder() {
    sortAscending = !sortAscending;
    const btn = document.getElementById('sortBtn');
    if(btn) btn.innerText = sortAscending ? "ORDEN: A-Z ↑" : "ORDEN: Z-A ↓";
    applyFilters();
}

function resetFilters() {
    activeFilters = { cat: null, origin: null, wars: null };
    document.getElementById('searchBar').value = "";
    document.querySelectorAll('.filter-tag').forEach(b => b.classList.remove('active'));
    applyFilters();
}