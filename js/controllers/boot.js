// ============================================
// CONTRÔLEUR — Séquence de démarrage
// ============================================
import { sleep, prefersReducedMotion } from '../utils/dom.js';

const LINES = [
    { text: '> INIT.FIRMWARE // BASTIDE_RÉMI_', cls: 'line-info', delay: 100 },
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

export async function runBootSequence() {
    const overlay = document.getElementById('boot-overlay');
    const log = document.getElementById('boot-log');
    const cursor = document.getElementById('boot-cursor');

    const skip = () => overlay.classList.add('hidden');

    if (prefersReducedMotion() || alreadySeen()) {
        skip();
        return;
    }

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
