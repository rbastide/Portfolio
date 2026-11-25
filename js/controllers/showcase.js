// ============================================
// CONTRÔLEUR — Projets : vitrine plein écran, éclats et flaques d'huile
// ============================================
// La section #projects est un calque fixe, fermé par défaut. Elle s'ouvre :
//   - à l'impact du réseau lancé par les mains (« atlas:impact », émis par
//     controllers/story.js) : le réseau se brise en éclats au sol, les éclats
//     fondent en gouttes qui se rassemblent en une flaque d'huile, puis la
//     flaque se vide en filets vers chaque carte, qui apparaît sur sa propre
//     flaque, l'une après l'autre ;
//   - par un lien vers #projects ou #project-<id> (en-tête, accueil, URL) :
//     les cartes apparaissent directement.
// Tant qu'elle est ouverte, la page ne défile plus, le reste est inerte et le
// bouton Retour du navigateur est neutralisé : on n'en sort que par
// « Continuer », qui mène aux compétences (ou rend la page là où elle était).
// « atlas:launch » bloque le scroll dès le début du lancer.
//
// Le liquide est dessiné sur un calque basse résolution : chaque goutte y
// dépose un halo (sprite additif), puis un seuil sur l'opacité donne des
// bords nets qui fusionnent quand les gouttes se touchent (métaballes). La
// couleur suit l'épaisseur du film : cœur noir, reflets irisés sur les bords.
//
// En mouvement réduit : section ordinaire dans le flux de la page, cartes
// visibles, pas de blocage ni d'animation.
import { projects } from '../data/projects.js';
import { sortProjects, projectDetailHTML } from '../views/projects.js';
import { prefersReducedMotion } from '../utils/dom.js';

const VIOLET = [242, 242, 242];
const CYAN = [189, 189, 189];
const GREEN = [224, 224, 224];

// Séquence, en ms depuis l'impact.
const SHARD_END = 1100;               // les éclats durcis disparaissent tout à fait
const MELT = [420, 1050];             // les éclats fondent en gouttes
const GATHER = [950, 1850];           // les gouttes glissent vers la flaque centrale
const CARDS_AT = 1650;                // première carte
const STAGGER = 190;                  // écart entre deux cartes
const STREAM_GAP = 45;                // écart entre les gouttes d'un même filet
const TRAVEL = 560;                   // trajet d'une goutte jusqu'à sa carte
const SPREAD = 380;                   // la flaque s'étale sous la carte
const DRY = 900;                      // puis sèche
const UI_AT = 1300;                   // titre, filtres et boutons apparaissent

const RES = 3;                        // 1 px du calque liquide pour RES px écran
const THRESHOLD = 110;                // seuil d'opacité (0..255) du bord du liquide
const GRAVITY = 2600;                 // px/s²
const BOUNCE = 0.3;
const MAX_SHARDS = { desktop: 56, mobile: 34 };
const MOBILE_MAX = 820;
const FLOOR = 0.05;                   // même sol que le parcours (part de la hauteur)
const SPRITE_REACH = 1.85;            // rayon du halo / rayon visible d'une goutte

const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const range = (v, from, to) => clamp((v - from) / (to - from));
const ease = t => t * t * (3 - 2 * t);
const mix = (a, b, t) => a + (b - a) * t;
const mixColor = (a, b, t) => a.map((v, i) => Math.round(mix(v, b[i], t)));
const rand = (a, b) => mix(a, b, Math.random());

// Halo d'une goutte : opacité (1 - d²)² jusqu'au bord du sprite, la moitié
// (seuil visible) à 1 / SPRITE_REACH du rayon.
function makeSprite() {
    const size = 64, c = document.createElement('canvas');
    c.width = c.height = size;
    const g = c.getContext('2d');
    const img = g.createImageData(size, size);
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const dx = (x + 0.5) / size * 2 - 1, dy = (y + 0.5) / size * 2 - 1;
            const d2 = dx * dx + dy * dy;
            const a = d2 >= 1 ? 0 : (1 - d2) * (1 - d2);
            const i = (y * size + x) * 4;
            img.data[i] = img.data[i + 1] = img.data[i + 2] = 255;
            img.data[i + 3] = Math.round(a * 255);
        }
    }
    g.putImageData(img, 0, 0);
    return c;
}

// Reflets d'un film d'huile : violet, cyan, vert, ambre, rose, en boucle.
function makePalette() {
    const stops = [VIOLET, CYAN, GREEN, [150, 150, 150], [205, 205, 205], VIOLET];
    const pal = new Uint8ClampedArray(256 * 3);
    for (let i = 0; i < 256; i++) {
        const t = i / 256 * (stops.length - 1), k = Math.floor(t);
        const c = mixColor(stops[k], stops[k + 1], t - k);
        pal.set(c, i * 3);
    }
    return pal;
}

export function initShowcase() {
    const section = document.getElementById('projects');
    if (!section) return;
    const root = document.documentElement;
    const main = document.getElementById('app');
    const inner = section.querySelector('.sc-inner');
    const canvas = section.querySelector('.sc-canvas');
    const cells = [...section.querySelectorAll('.sc-cell')];
    const cards = cells.map(c => c.querySelector('.sc-card'));
    const continueBtn = section.querySelector('.sc-continue');
    const skipBtn = section.querySelector('.sc-skip');
    const heading = section.querySelector('.sc-heading');
    const zoom = section.querySelector('.sc-zoom');
    const zoomBody = zoom.querySelector('.sc-zoom-body');
    const zoomClose = zoom.querySelector('.sc-zoom-close');
    const sorted = sortProjects(projects);
    const reduced = prefersReducedMotion();

    const filters = initFilters(section, cells);

    // ---------- Zoom : un projet en plein écran ----------
    let zoomCard = null;

    function openZoom(card) {
        const i = cards.indexOf(card);
        if (i < 0) return;
        zoomCard = card;
        zoomBody.innerHTML = projectDetailHTML(sorted[i], i);
        zoom.hidden = false;
        inner.inert = true;
        section.classList.add('is-zooming');
        if (reduced) root.classList.add('is-locked', 'showcase-open');
        if (!reduced) {
            const from = card.getBoundingClientRect(), to = zoom.getBoundingClientRect();
            zoom.animate([
                { transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width}, ${from.height / to.height})` },
                { transform: 'none' }
            ], { duration: 440, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' });
            zoomBody.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }],
                { duration: 280, delay: 200, easing: 'ease-out', fill: 'backwards' });
        }
        zoomBody.scrollTop = 0;
        zoomBody.focus({ preventScroll: true });
    }

    function closeZoom() {
        if (!zoomCard) return;
        const card = zoomCard;
        zoomCard = null;
        const done = () => {
            zoom.hidden = true;
            zoomBody.innerHTML = '';
            inner.inert = false;
            section.classList.remove('is-zooming');
            if (reduced) root.classList.remove('is-locked', 'showcase-open');
            card.focus({ preventScroll: true });
        };
        if (reduced) return done();
        const from = card.getBoundingClientRect(), to = zoom.getBoundingClientRect();
        zoom.animate([
            { transform: 'none', opacity: 1 },
            { transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width}, ${from.height / to.height})`, opacity: 0.4 }
        ], { duration: 320, easing: 'cubic-bezier(0.4, 0, 0.6, 1)' }).finished.then(done, done);
    }

    section.querySelector('.sc-grid').addEventListener('click', e => {
        const card = e.target.closest('.sc-card');
        if (card) openZoom(card);
    });
    zoomClose.addEventListener('click', closeZoom);
    // Clic sur le fond du zoom (hors du contenu) : fermeture.
    zoom.addEventListener('click', e => { if (e.target === zoom) closeZoom(); });

    // Le focus reste dans le zoom tant qu'il est ouvert.
    zoom.addEventListener('keydown', e => {
        if (e.key !== 'Tab') return;
        const items = [...zoom.querySelectorAll('a[href], button')];
        const first = items[0], last = items[items.length - 1];
        if (e.shiftKey && (document.activeElement === first || document.activeElement === zoomBody)) {
            e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault(); first.focus();
        }
    });

    // ---------- Mouvement réduit : section ordinaire ----------
    if (reduced) {
        section.classList.add('is-static');
        cells.forEach(c => c.classList.add('is-in'));
        document.addEventListener('keydown', e => { if (e.key === 'Escape') closeZoom(); });
        document.addEventListener('click', e => {
            const chip = e.target.closest('[data-filter-tech]');
            if (chip) {
                filters.setTech(chip.dataset.filterTech);
                section.scrollIntoView({ behavior: 'smooth' });
                return;
            }
            const link = e.target.closest('a[href^="#project-"]');
            const card = link && document.getElementById(link.getAttribute('href').slice(1));
            if (!card) return;
            e.preventDefault();
            card.scrollIntoView({ block: 'center' });
            openZoom(card);
        });
        return;
    }

    // ---------- Blocage de la page ----------
    let locked = false, isOpen = false, returnToSkills = false, lockTimer = 0, lockY = 0;
    const others = () => [
        ...[...document.body.children].filter(el => el !== main && el.tagName !== 'SCRIPT'),
        ...[...main.children].filter(el => el !== section)
    ];

    function lock(y = window.scrollY) {
        if (locked) return;
        locked = true;
        lockY = y;
        root.classList.add('is-locked');
        window.scrollTo({ top: lockY, behavior: 'instant' });
        // Une entrée d'historique à consommer : le bouton Retour reste sur place.
        history.pushState({ showcase: true }, '', location.href);
    }

    function unlock() {
        locked = false;
        clearTimeout(lockTimer);
        root.classList.remove('is-locked');
    }

    // overflow: hidden ne retient pas l'inertie d'un pavé tactile ni le doigt sur
    // iOS : tout défilement pendant le blocage est ramené au point de blocage.
    window.addEventListener('scroll', () => {
        if (locked && Math.abs(window.scrollY - lockY) > 1) window.scrollTo({ top: lockY, behavior: 'instant' });
    }, { passive: true });

    window.addEventListener('popstate', () => {
        if (!locked) return;
        // Retour pendant un zoom : il ferme le projet ; sinon rien ne se passe.
        closeZoom();
        history.pushState({ showcase: true }, '', location.href);
    });

    // ---------- Ouverture / fermeture ----------
    function storyInView() {
        const story = document.getElementById('story');
        if (!story) return false;
        const r = story.getBoundingClientRect();
        return r.bottom > 1 && r.top < window.innerHeight;
    }

    function open(mode, detail) {
        if (isOpen) return;
        returnToSkills = storyInView();
        lock();
        isOpen = true;
        others().forEach(el => { el.inert = true; });
        root.classList.add('showcase-open');
        section.classList.toggle('is-impact', mode === 'impact');
        section.classList.add('is-open');
        section.classList.remove('is-done', 'is-ui');
        cells.forEach((c, i) => { c.classList.remove('is-in'); c.style.setProperty('--i', i); });
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });

        if (mode === 'impact' && detail) {
            // La page est bloquée : si l'animation échoue, on montre tout plutôt que rien.
            try { fluid.start(detail); } catch (err) { console.error(err); finish(); }
            setTimeout(() => { if (isOpen && !section.classList.contains('is-done')) finish(); }, 8000);
        } else {
            // Ouverture directe : les cartes arrivent en cascade, sans liquide.
            section.classList.add('is-ui', 'is-done');
            requestAnimationFrame(() => cells.forEach(c => c.classList.add('is-in')));
        }
    }

    function close() {
        if (!isOpen) return;
        closeZoom();
        fluid.stop();
        isOpen = false;
        others().forEach(el => { el.inert = false; });
        unlock();
        // La page reprend aux compétences si l'on arrivait du parcours.
        const skills = document.getElementById('skills');
        if (returnToSkills && skills) {
            skills.scrollIntoView({ behavior: 'instant', block: 'start' });
        }
        section.classList.add('is-closing');
        section.classList.remove('is-open');
        root.classList.remove('showcase-open');
        setTimeout(() => section.classList.remove('is-closing', 'is-impact'), 400);
        const target = returnToSkills && skills ? skills.querySelector('h2') : null;
        if (target) {
            target.setAttribute('tabindex', '-1');
            target.focus({ preventScroll: true });
        }
    }

    // Toutes les cartes tout de suite, liquide arrêté.
    function finish() {
        fluid.stop();
        cells.forEach(c => c.classList.add('is-in'));
        section.classList.add('is-ui', 'is-done');
    }

    continueBtn.addEventListener('click', close);
    skipBtn.addEventListener('click', () => { finish(); continueBtn.focus(); });

    // Échap : ferme le projet agrandi, sinon passe l'animation (le panneau des
    // filtres, lui, se ferme de son côté et marque l'événement).
    document.addEventListener('keydown', e => {
        if (!isOpen || e.key !== 'Escape' || e.defaultPrevented) return;
        if (zoomCard) closeZoom();
        else if (!section.classList.contains('is-done')) finish();
    });

    // Liens vers les projets (en-tête, accueil, parcours) : ouverture directe.
    // Une techno de la section Stack ouvre les projets filtrés sur elle.
    document.addEventListener('click', e => {
        const chip = e.target.closest('[data-filter-tech]');
        if (chip) {
            filters.setTech(chip.dataset.filterTech);
            open('direct');
            return;
        }
        const link = e.target.closest('a[href="#projects"], a[href^="#project-"]');
        if (!link) return;
        e.preventDefault();
        const id = link.getAttribute('href').slice(1);
        open('direct');
        const card = id !== 'projects' && document.getElementById(id);
        if (card) openZoom(card);
    });

    // Arrivée sur la page avec une ancre de projet.
    const hash = decodeURIComponent(location.hash.slice(1));
    if (hash === 'projects' || hash.startsWith('project-')) {
        requestAnimationFrame(() => {
            open('direct');
            const card = hash !== 'projects' && document.getElementById(hash);
            if (card) openZoom(card);
        });
    }

    // Le lancer part : plus de scroll. Filet de sécurité si l'impact n'arrive pas.
    window.addEventListener('atlas:launch', e => {
        lock(e.detail?.y);
        clearTimeout(lockTimer);
        lockTimer = setTimeout(() => { if (locked && !isOpen) open('direct'); }, 1500);
    });
    window.addEventListener('atlas:impact', e => {
        clearTimeout(lockTimer);
        open('impact', e.detail);
    });

    // Glisser au doigt sur la vitrine : pas de rebond de page (iOS), sauf
    // dans le contenu d'un projet agrandi, qui peut défiler.
    section.addEventListener('touchmove', e => {
        if (!e.target.closest('.sc-zoom-body, .sc-filter-panel')) e.preventDefault();
    }, { passive: false });

    // ---------- Liquide ----------
    const fluid = createFluid(canvas, section, cells, () => {
        section.classList.add('is-ui');
    }, i => {
        cells[i].classList.add('is-in');
        if (cells.every(c => c.classList.contains('is-in'))) {
            section.classList.add('is-done');
            if (document.activeElement === heading || document.activeElement === document.body) {
                continueBtn.focus({ preventScroll: true });
            }
        }
    });
}

// ---------- Filtres, repliés derrière un bouton ----------
// Les cartes qui ne correspondent pas s'estompent au lieu de disparaître :
// la grille garde sa place, rien ne bouge à l'écran.
function initFilters(section, cells) {
    const toggle = section.querySelector('.sc-filter-toggle');
    const panel = section.querySelector('.sc-filter-panel');
    const label = section.querySelector('.sc-filter-state');
    const reset = section.querySelector('.sc-filter-reset');
    const options = [...panel.querySelectorAll('.sc-filter-opt')];
    // tech : posée depuis la section Stack, elle n'a pas d'option dans le panneau.
    const state = { category: null, context: null, tech: null };

    const setOpen = open => {
        panel.hidden = !open;
        toggle.setAttribute('aria-expanded', String(open));
        section.classList.toggle('is-filtering', open);
    };

    function update() {
        const set = Object.values(state).filter(Boolean);
        cells.forEach(c => {
            const match = (!state.category || c.dataset.category === state.category) &&
                (!state.context || c.dataset.context === state.context) &&
                (!state.tech || c.dataset.tech.split('|').includes(state.tech));
            c.classList.toggle('is-dim', !match);
        });
        options.forEach(o => {
            const on = state[o.dataset.group] === o.dataset.value;
            o.classList.toggle('active', on);
            o.setAttribute('aria-pressed', String(on));
        });
        label.textContent = set.length ? set.join(' · ') : 'Filtrer';
        toggle.classList.toggle('is-set', set.length > 0);
        reset.disabled = set.length === 0;
    }

    toggle.addEventListener('click', () => setOpen(panel.hidden));
    panel.addEventListener('click', e => {
        const opt = e.target.closest('.sc-filter-opt');
        if (!opt) return;
        const { group, value } = opt.dataset;
        state[group] = state[group] === value ? null : value;
        update();
    });
    reset.addEventListener('click', () => {
        state.category = state.context = state.tech = null;
        update();
        toggle.focus();
        setOpen(false);
    });
    document.addEventListener('click', e => {
        if (!panel.hidden && !e.target.closest('.sc-filters')) setOpen(false);
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && !panel.hidden) { e.preventDefault(); setOpen(false); toggle.focus(); }
    });

    return {
        // Filtre sur une technologie (les autres critères sont levés).
        setTech(tech) {
            Object.assign(state, { category: null, context: null, tech });
            update();
        }
    };
}

// ---------- Éclats et flaques d'huile ----------
// onUI : le décor peut apparaître ; onCard(i) : la carte i est formée.
function createFluid(canvas, section, cells, onUI, onCard) {
    const ctx = canvas.getContext('2d');
    const layer = document.createElement('canvas');
    const lctx = layer.getContext('2d', { willReadFrequently: true });
    const sprite = makeSprite();
    const palette = makePalette();
    let w = 0, h = 0, dpr = 1, img = null;
    let frame = 0, start = 0, last = 0, running = false;
    let shards = [], drops = [], puddles = [], rects = [], floor = 0, impact = null, uiShown = false;

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = section.clientWidth;
        h = section.clientHeight;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        layer.width = Math.ceil(w / RES);
        layer.height = Math.ceil(h / RES);
        img = lctx.createImageData(layer.width, layer.height);
        floor = h * (1 - FLOOR);
        measure();
    }

    // Cible de chaque flaque : la carte, à l'écran.
    function measure() {
        rects = cells.map(c => {
            const r = c.getBoundingClientRect();
            return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height };
        });
    }

    new ResizeObserver(() => { if (running) resize(); }).observe(section);

    function start_(detail) {
        resize();
        const mobile = w <= MOBILE_MAX;
        const nodes = detail.nodes.filter(n => Number.isFinite(n.x) && Number.isFinite(n.y));
        const cx = nodes.reduce((s, n) => s + n.x, 0) / Math.max(1, nodes.length) || w / 2;
        impact = { x: cx, t: 0 };

        // Un éclat par neurone, et quelques-uns pris sur les liaisons.
        const sources = nodes.map(n => ({ x: n.x, y: n.y, big: true, layer: n.layer }));
        for (const [a, b] of detail.edges || []) {
            const na = detail.nodes[a], nb = detail.nodes[b];
            if (!na || !nb) continue;
            const t = rand(0.3, 0.7);
            sources.push({ x: mix(na.x, nb.x, t), y: mix(na.y, nb.y, t), big: false, layer: na.layer });
        }
        const max = mobile ? MAX_SHARDS.mobile : MAX_SHARDS.desktop;
        const unit = Math.max(0.7, Math.min(w, h) / 900);
        shards = sources.slice(0, max).map(s => {
            const size = (s.big ? rand(7, 12) : rand(3.5, 7)) * unit;
            const sides = 3 + Math.floor(Math.random() * 3);
            const verts = Array.from({ length: sides }, (_, k) =>
                [k / sides * Math.PI * 2 + rand(-0.4, 0.4), size * rand(0.55, 1.15)]);
            const spread = (s.x - cx) / Math.max(1, w) * 2600;
            return {
                x: s.x, y: Math.min(s.y, floor - 2),
                vx: spread + rand(-380, 380) * unit,
                vy: -rand(380, 1050) * unit * (s.big ? 1 : 1.2),
                rot: rand(0, Math.PI * 2), vr: rand(-14, 14),
                size, verts,
                color: mixColor(VIOLET, CYAN, Math.min(1, s.layer / 3 + rand(-0.15, 0.15))),
                melt: rand(0, 220), slide: rand(0, 260),
                r: size * rand(1.05, 1.5),          // rayon de la goutte qu'il devient
                home: rand(-1, 1)                   // place dans la flaque centrale
            };
        });

        // Chaque carte reçoit un filet de gouttes ; la flaque centrale se vide ainsi.
        drops = shards.map((s, i) => ({ s, card: i % cells.length, k: Math.floor(i / cells.length) }));
        puddles = rects.map((_, i) => ({ at: CARDS_AT + i * (mobile ? STAGGER * 0.8 : STAGGER), shown: false }));

        section.style.setProperty('--impact-x', `${cx}px`);
        uiShown = false;
        running = true;
        start = last = performance.now();
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(tick);
    }

    function stop() {
        running = false;
        cancelAnimationFrame(frame);
        frame = 0;
        ctx.clearRect(0, 0, w, h);
        shards = drops = puddles = [];
    }

    // Halo additif d'une goutte sur le calque liquide.
    function blob(x, y, r) {
        if (r <= 0.5) return;
        const R = r * SPRITE_REACH / RES;
        lctx.drawImage(sprite, x / RES - R, y / RES - R, R * 2, R * 2);
    }

    // Flaque sous une carte : une grille de gouttes qui recouvre son rectangle.
    function puddle(rect, amount) {
        if (amount <= 0) return;
        const s = Math.min(rect.w, rect.h);
        const nx = Math.max(1, Math.round(rect.w / s * 1.4)), ny = Math.max(1, Math.round(rect.h / s * 1.4));
        const r = s * 0.5 * amount;
        for (let i = 0; i < nx; i++) {
            for (let j = 0; j < ny; j++) {
                const x = rect.x + (nx === 1 ? 0 : mix(-0.5, 0.5, i / (nx - 1)) * (rect.w - s * 0.7));
                const y = rect.y + (ny === 1 ? 0 : mix(-0.5, 0.5, j / (ny - 1)) * (rect.h - s * 0.7));
                blob(x, y, r);
            }
        }
    }

    // Seuil et couleur du film d'huile.
    function shade(time) {
        const data = img.data, W = layer.width, H = layer.height;
        const src = lctx.getImageData(0, 0, W, H).data;
        const phase = time * 0.06;
        for (let y = 0, i = 0; y < H; y++) {
            for (let x = 0; x < W; x++, i += 4) {
                const a = src[i + 3];
                if (a < THRESHOLD - 14) { data[i + 3] = 0; continue; }
                // Bord : reflets irisés ; cœur : huile presque noire.
                const edge = 1 - clamp((a - THRESHOLD) / 110);
                const k = ((x * 2.1 + y * 1.3 + a * 1.6 + phase) & 255) * 3;
                const glow = 0.18 + edge * 0.72;
                data[i] = 16 + (palette[k] - 16) * glow;
                data[i + 1] = 16 + (palette[k + 1] - 16) * glow;
                data[i + 2] = 19 + (palette[k + 2] - 19) * glow;
                data[i + 3] = clamp((a - THRESHOLD + 14) / 28) * 235;
            }
        }
        lctx.putImageData(img, 0, 0);
    }

    function tick(now) {
        if (!running) return;
        const dt = Math.min(1 / 30, (now - last) / 1000);
        last = now;
        const t = now - start;
        const mobile = w <= MOBILE_MAX;

        // Physique des éclats : gravité, rebonds amortis sur le sol et les bords.
        for (const s of shards) {
            s.vy += GRAVITY * dt;
            s.x += s.vx * dt;
            s.y += s.vy * dt;
            s.rot += s.vr * dt;
            const ground = floor - s.size * 0.5;
            if (s.y > ground) {
                s.y = ground;
                s.vy *= -BOUNCE;
                s.vx *= 0.72;
                s.vr *= 0.6;
            }
            if (s.x < 12 || s.x > w - 12) { s.x = clamp(s.x, 12, w - 12); s.vx *= -0.5; }
        }

        if (!uiShown && t >= UI_AT) { uiShown = true; onUI(); }

        // ---- Calque liquide ----
        lctx.globalCompositeOperation = 'source-over';
        lctx.clearRect(0, 0, layer.width, layer.height);
        lctx.globalCompositeOperation = 'lighter';
        let liquid = false;
        const poolY = floor - 6;
        for (const d of drops) {
            const s = d.s;
            const melt = ease(range(t, MELT[0] + s.melt, MELT[1] + s.melt));
            if (melt <= 0) continue;
            const p = puddles[d.card];
            const leave = p.at + d.k * STREAM_GAP, arrive = leave + TRAVEL;
            if (t >= arrive + 220) continue; // absorbée par la flaque de sa carte
            // Au sol, puis vers la flaque centrale.
            const g = ease(range(t, GATHER[0] + s.slide, GATHER[1] + s.slide));
            const poolW = Math.min(w * 0.32, 260 + shards.length * 3);
            let x = mix(s.x, w / 2 + s.home * poolW * 0.5, g);
            let y = mix(s.y, poolY, g);
            let r = s.r * melt;
            // Le filet monte jusqu'à la carte en courbe, puis la goutte se fond dans la flaque.
            if (t >= leave) {
                const q = ease(range(t, leave, arrive));
                const rc = rects[d.card];
                const x0 = x, y0 = y;
                const cxp = x0, cyp = mix(y0, rc.y, 0.55);
                x = (1 - q) * (1 - q) * x0 + 2 * (1 - q) * q * cxp + q * q * rc.x;
                y = (1 - q) * (1 - q) * y0 + 2 * (1 - q) * q * cyp + q * q * rc.y;
                r *= (1 - 0.25 * Math.sin(Math.PI * q)) * (1 - range(t, arrive, arrive + 220));
            }
            blob(x, y, r);
            liquid = true;
        }

        let allDry = true;
        puddles.forEach((p, i) => {
            const at = p.at + TRAVEL;
            const spread = ease(range(t, at, at + SPREAD));
            const dry = range(t, at + SPREAD + 260, at + SPREAD + 260 + DRY);
            if (dry < 1) allDry = false;
            if (!p.shown && t >= at + SPREAD * 0.45) { p.shown = true; onCard(i); }
            const amount = spread * (1 - ease(dry));
            if (amount > 0 && rects[i]) {
                const r = rects[i];
                // Un peu plus grande que la carte : un liseré d'huile irisé la borde.
                puddle({ x: r.x, y: r.y, w: r.w * 1.04, h: r.h * 1.08 }, amount);
                liquid = true;
            }
        });

        ctx.clearRect(0, 0, w, h);

        // Onde de choc au sol, à l'impact.
        if (impact && t < 520) {
            const q = t / 520;
            ctx.save();
            ctx.strokeStyle = `rgba(${CYAN.join(',')}, ${(1 - q) * 0.55})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.ellipse(impact.x, floor, 30 + q * w * 0.42, 6 + q * 22, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        if (liquid) {
            shade(t);
            ctx.imageSmoothingEnabled = true;
            ctx.drawImage(layer, 0, 0, layer.width * RES, layer.height * RES);
        }

        // Éclats durs, qui rétrécissent en fondant.
        for (const s of shards) {
            const melt = range(t, MELT[0] + s.melt, MELT[1] + s.melt);
            if (melt >= 1 || t > SHARD_END + s.melt) continue;
            const k = 1 - melt;
            ctx.save();
            ctx.translate(s.x, s.y);
            ctx.rotate(s.rot);
            ctx.scale(k, k);
            ctx.beginPath();
            s.verts.forEach(([ang, rad], j) => {
                const px = Math.cos(ang) * rad, py = Math.sin(ang) * rad;
                if (j) ctx.lineTo(px, py); else ctx.moveTo(px, py);
            });
            ctx.closePath();
            ctx.fillStyle = `rgba(${s.color.join(',')}, ${0.85 * k + 0.1})`;
            ctx.shadowColor = `rgba(${s.color.join(',')}, 0.6)`;
            ctx.shadowBlur = mobile ? 0 : 8;
            ctx.fill();
            ctx.restore();
        }

        if (allDry && t > CARDS_AT) {
            stop();
            return;
        }
        frame = requestAnimationFrame(tick);
    }

    return { start: start_, stop };
}
