// ============================================
// VUE — Accueil
// ============================================
const BOOT_LINES = [
    "INIT.FIRMWARE // BASTIDE_RÉMI_",
    "[OK] MOD_DÉVELOPPEMENT......... [ACTIVE]",
    "[OK] MOD_ADMINISTRATION........ [ONLINE]",
    "[OK] MOD_GESTION_PROJET........ [LOADED]",
    "SILICON_READY. HANDING_CONTROL_TO_KERNEL..."
];

export function heroHTML({ profile, projects }) {
    const stats = [
        { value: projects.length, label: "Projets" },
        { value: profile.yearsOfExperience, label: "Années" },
        { value: profile.level, label: "Niveau" }
    ];

    return `
    <section id="home">
        <div class="hero-content">
            <div class="hero-pre reveal">
                ${BOOT_LINES.map(l => `<div class="hero-pre-line"><span class="cmd">&gt;</span> ${l}</div>`).join('')}
            </div>
            <h1 class="hero-name reveal delay-1">BASTIDE<br><span class="accent">RÉMI;</span></h1>
            <p class="hero-role reveal delay-2">${profile.role}</p>
            <p class="hero-bio reveal delay-2">${profile.bio}</p>
            <div class="hero-stats reveal delay-3">
                ${stats.map(s => `
                <div class="stat">
                    <span class="stat-value">${s.value}</span>
                    <span class="stat-label">${s.label}</span>
                </div>`).join('')}
            </div>
            <a href="#projects" class="hero-cta reveal delay-4">
                Découvrir mon travail <span class="arrow">↓</span>
            </a>
        </div>
    </section>`;
}
