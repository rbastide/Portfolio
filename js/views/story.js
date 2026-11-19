// ============================================
// VUE — Parcours en scrollytelling
// ============================================
// Une section haute de plusieurs écrans dont la scène (.story-stage) reste
// collée à l'écran : le scroll fait avancer l'animation du canvas et les
// textes, au lieu de faire défiler la page. Le pilotage est dans
// controllers/story.js.
import { story } from '../data/story.js';
import { heroSceneHTML } from './hero.js';

const MINOR_MARKS = 4; // graduations fines entre deux scènes sur la règle

const pad = n => String(n).padStart(2, '0');

function sceneHTML(scene, i, data) {
    const classes = `story-scene pos-${scene.position}${scene.intro ? ' is-intro' : ''}${i === 0 ? ' is-active' : ''}`;
    const kicker = `${pad(i + 1)} — ${scene.kicker}`;

    if (scene.hero) {
        return `
        <article class="${classes}" data-scene="${i}">
            ${heroSceneHTML(data, kicker)}
        </article>`;
    }

    const ctas = scene.ctas ? `
            <div class="story-ctas">
                ${scene.ctas.map(c => `<a href="${c.href}" class="btn ${c.cls}"><span class="icon">${c.icon}</span>${c.label}</a>`).join('')}
            </div>` : '';

    return `
        <article class="${classes}" data-scene="${i}">
            <div class="story-scene-inner">
                <span class="story-kicker">${kicker}</span>
                <h3 class="story-title">${scene.title}</h3>
                <p class="story-text">${scene.text}</p>${ctas}
            </div>
        </article>`;
}

function rulerHTML(count) {
    const segment = `
                <div class="story-ruler-seg">
                    <span class="mark-major"></span>
                    <span class="story-ruler-minors">${'<span class="mark-minor"></span>'.repeat(MINOR_MARKS)}</span>
                </div>`;
    return `
        <div class="story-ruler" aria-hidden="true">
            <span class="story-count"><span data-story-count>01</span> / ${pad(count)}</span>
            <div class="story-ruler-bar">${segment.repeat(count)}
                <span class="mark-major"></span>
            </div>
        </div>`;
}

export function storyHTML(data) {
    return `
    <section id="story" class="story" aria-labelledby="story-heading" style="--story-scenes: ${story.length}">
        <div class="story-stage">
            <canvas class="story-canvas" aria-hidden="true"></canvas>
            <div class="story-scrim" aria-hidden="true"></div>
            <h2 id="story-heading" class="sr-only">Mon parcours</h2>
            ${story.map((scene, i) => sceneHTML(scene, i, data)).join('')}
            ${rulerHTML(story.length)}
            <a href="#projects" class="story-skip">Passer l'intro<span class="icon">south</span></a>
            <div class="story-hint" aria-hidden="true">
                <span>Faites défiler</span>
                <span class="story-hint-line"></span>
            </div>
        </div>
    </section>`;
}
