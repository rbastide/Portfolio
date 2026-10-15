// ============================================
// CONTRÔLEUR — Séquence de démarrage
// ============================================
import { sleep, prefersReducedMotion } from '../utils/dom.js';

const LINES = [
    { text: '> INIT.FIRMWARE // BASTIDE_RÉMI_', cls: 'line-info', delay: 100 },
    { text: '> [WARN] SEISMIC_EVENT_DETECTED // MAG 6.8 — STABILISATION...', cls: 'line-warn', delay: 450 },
    { text: '', cls: '', delay: 200 },
    { text: '> [OK] SPI_FLASH_UEFI_MOUNTED', cls: 'line-ok', delay: 80 },
    { text: '> [OK] CPU_MICROCODE_PATCHED', cls: 'line-ok', delay: 80 },
    { text: '> [OK] IMC_PCIe_LANES_CALIBRATED', cls: 'line-ok', delay: 80 },
    { text: '', cls: '', delay: 150 },
    { text: '> [OK] MOD_DÉVELOPPEMENT......... [ACTIVE]', cls: 'line-module', delay: 120 },
    { text: '> [OK] MOD_ADMINISTRATION........ [ONLINE]', cls: 'line-module', delay: 120 },
    { text: '> [OK] MOD_GESTION_PROJET........ [LOADED]', cls: 'line-module', delay: 120 },
    { text: '> [OK] MOD_COLLABORATION......... [LOADED]', cls: 'line-module', delay: 120 },
    { text: '', cls: '', delay: 200 },
    { text: '> SILICON_READY. HANDING_CONTROL_TO_KERNEL...', cls: 'line-info', delay: 300 },
    { text: '', cls: '', delay: 150 },
    { text: '> Press F10 to load profile...', cls: 'line-warn', delay: 400 },
    { text: '', cls: '', delay: 100 },
    { text: '> ./init-portfolio.sh', cls: 'line-info', delay: 600 },
];

// La séquence ne se joue qu'une fois par session : un rechargement ne la rejoue pas.
const SEEN_KEY = 'boot-seen';

function alreadySeen() {
    try { return sessionStorage.getItem(SEEN_KEY) === '1'; } catch { return false; }
}

function markSeen() {
    try { sessionStorage.setItem(SEEN_KEY, '1'); } catch { /* stockage indisponible */ }
}

// Tremblement de terre à l'arrivée sur l'écran : une secousse précurseur,
// le choc principal puis un amortissement. Les images clés sont tirées au
// hasard à chaque visite pour que la secousse ne soit jamais identique.
const QUAKE_DURATION = 1700;
const QUAKE_FRAMES = 52;

// Enveloppe d'amplitude (0 → 1) selon l'avancement t (0 → 1).
function quakeEnvelope(t) {
    if (t < 0.12) return 0.12 + t; // précurseur, faible
    if (t < 0.22) return 0.24 + ((t - 0.12) / 0.1) * 0.76; // montée brutale
    return Math.exp(-(t - 0.22) * 5.2); // amortissement
}

function quakeKeyframes() {
    const jitter = () => Math.random() * 0.6 + 0.4;
    return Array.from({ length: QUAKE_FRAMES + 1 }, (_, i) => {
        const t = i / QUAKE_FRAMES;
        const a = i === QUAKE_FRAMES ? 0 : quakeEnvelope(t);
        // Le signe alterne pour donner une oscillation plutôt qu'une dérive.
        const sx = i % 2 ? 1 : -1;
        const sy = i % 3 ? 1 : -1;
        const x = sx * a * 16 * jitter();
        const y = sy * a * 9 * jitter();
        const r = (Math.random() - 0.5) * a * 1.4;
        return {
            offset: t,
            transform: `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${r.toFixed(3)}deg)`,
            filter: `blur(${(a * 0.9).toFixed(2)}px)`
        };
    });
}

function runQuake(overlay) {
    const keyframes = quakeKeyframes();
    const timing = { duration: QUAKE_DURATION, easing: 'linear' };
    // Le journal et la consigne tremblent ensemble ; le fond reste fixe pour ne pas
    // découvrir la page derrière l'écran de chargement.
    overlay.querySelectorAll('#boot-log, .boot-skip').forEach(el => el.animate(keyframes, timing));
    // Le halo s'intensifie au moment du choc principal.
    overlay.animate([
        { transform: 'scale(1)' },
        { transform: 'scale(1)', offset: 0.18 },
        { transform: 'scale(1.35)', filter: 'blur(120px) brightness(1.8)', offset: 0.26 },
        { transform: 'scale(1)' }
    ], { ...timing, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', pseudoElement: '::before' });
}

export async function runBootSequence() {
    const overlay = document.getElementById('boot-overlay');
    const log = document.getElementById('boot-log');
    const cursor = document.getElementById('boot-cursor');

    const skip = () => overlay.classList.add('hidden');

    if (prefersReducedMotion() || alreadySeen()) {
        skip();
        return;
    }

    runQuake(overlay);

    // Un clic ou une touche permet de passer l'animation.
    let skipped = false;
    const onSkip = () => { skipped = true; };
    overlay.addEventListener('click', onSkip, { once: true });
    window.addEventListener('keydown', onSkip, { once: true });

    for (const line of LINES) {
        if (skipped) break;
        await sleep(line.delay);
        const div = document.createElement('div');
        div.className = line.cls;
        div.textContent = line.text ? line.text + ' ' : ' ';
        // Le curseur suit la dernière ligne au lieu de passer en dessous du log.
        div.appendChild(cursor);
        log.appendChild(div);
    }

    if (!skipped) await sleep(400);
    window.removeEventListener('keydown', onSkip);
    markSeen();
    skip();
}
