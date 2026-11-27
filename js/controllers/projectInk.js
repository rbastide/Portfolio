// ============================================
// CONTRÔLEUR — Fonds « encre dans l'eau » de la vitrine des projets
// ============================================
// Deux effets inspirés de vandanar.design :
// - derrière la grille (.sc-bg) : un nuage d'encre qui dérive lentement dans un
//   champ de bruit déformé, avec quelques paillettes, très discret ;
// - derrière un projet agrandi (.sc-zoom-ink) : le bassin du haut de leur page.
//   L'encre vit dans une texture, suit un courant (bruit rotationnel), le curseur
//   la remue, un clic en dépose, et elle s'affiche en paillettes champagne.
import { prefersReducedMotion } from '../utils/dom.js';

const VS = 'attribute vec2 aPos; void main(){ gl_Position = vec4(aPos, 0., 1.); }';

const NOISE = `
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 x){
    vec2 i = floor(x), f = fract(x); f = f * f * (3. - 2. * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}
float h1(vec2 p){ vec3 q = fract(vec3(p.xyx) * .1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }`;

// Le courant qui porte l'encre (bassin), partagé par la simulation et l'affichage.
const CURL = `
float field(vec2 p){ return noise(p * 1.7 + vec2(0., uTime * .06)) + .5 * noise(p * 3.4 - vec2(uTime * .05, 0.)); }
vec2 curl(vec2 p){
    float e = .02;
    return vec2(field(p + vec2(0, e)) - field(p - vec2(0, e)), -(field(p + vec2(e, 0)) - field(p - vec2(e, 0)))) / (2. * e);
}`;

// ---------- Fond de la section : encre qui dérive ----------
const DRIFT = `
precision highp float;
uniform vec2 uRes;
uniform float uTime, uPx;
${NOISE}
// Chaque octave est tournée : la grille du bruit ne se voit plus (sinon, des blocs).
float fbm(vec2 p){ float v = 0., a = .5; mat2 m = mat2(.8, .6, -.6, .8); for (int i = 0; i < 5; i++) { v += a * noise(p); p = m * p * 2.03 + 17.1; a *= .5; } return v; }
void main(){
    vec2 uv = gl_FragCoord.xy / uRes;
    float t = uTime * .05;
    vec2 q = uv * vec2(uRes.x / uRes.y, 1.);
    vec2 w = vec2(fbm(q * 1.2 + t), fbm(q * 1.2 + 5.2 - t));
    vec2 qw = q + (w - .5) * 1.1 + vec2(t * .7, -t * .45);
    float ink = smoothstep(.38, .72, fbm(qw * 2.2 + vec2(0., uTime * .02)));
    // une paillette ronde par cellule de 3 px CSS au plus, seulement dans l'encre
    vec2 gp = gl_FragCoord.xy / (uPx * 3.), c = floor(gp), f = fract(gp) - .5;
    float r1 = h1(c), r2 = h1(c + 17.31), r3 = h1(c + 43.7), flake = 0.;
    if (r1 < ink * .3)
        flake = (1. - smoothstep(.12, .38, length(f - (vec2(r2, r3) - .5) * .3)))
              * (.25 + .35 * r2 + 1.2 * pow(.5 + .5 * sin(uTime * (1.1 + r3 * 4.) + r1 * 90.), 12.));
    float a = clamp(ink * .05 + flake * .35, 0., 1.);
    gl_FragColor = vec4(vec3(.96, .88, .72) * a, a);
}`;

// ---------- Bassin du projet agrandi : simulation ----------
const ADVECT = `
precision highp float;
uniform sampler2D uPrev;
uniform vec2 uRes;
uniform float uTime, uAspect, uDecay;
uniform vec4 uMouse, uDrops[4], uDropVel[4];
uniform vec2 uMouseVel;
${NOISE}
${CURL}
void main(){
    vec2 uv = gl_FragCoord.xy / uRes, p = vec2(uv.x * uAspect, uv.y);
    vec2 vel = curl(p * 1.6) * .0017 + curl(p * 4.2 + 7.) * .0005;
    vec2 d = (uv - uMouse.xy) * vec2(uAspect, 1.);
    float f = exp(-dot(d, d) / (uMouse.w * uMouse.w)), add = uMouse.z * f;
    vel += uMouseVel * f;
    for (int i = 0; i < 4; i++) {
        vec4 dr = uDrops[i];
        if (dr.z <= 0.) continue;
        vec2 dd = (uv - dr.xy) * vec2(uAspect, 1.);
        float ff = exp(-dot(dd, dd) / (dr.w * dr.w));
        vel += uDropVel[i].xy * ff; add += dr.z * ff;
    }
    vec2 src = uv - vel, px = 1. / uRes;
    float blur = (texture2D(uPrev, src + vec2(px.x, 0)).r + texture2D(uPrev, src - vec2(px.x, 0)).r
                + texture2D(uPrev, src + vec2(0, px.y)).r + texture2D(uPrev, src - vec2(0, px.y)).r) * .25;
    float ink = mix(texture2D(uPrev, src).r, blur, .012) * uDecay + add;
    gl_FragColor = vec4(clamp(ink, 0., 2.), 0., 0., 1.);
}`;

// ---------- Bassin : affichage en paillettes champagne sur l'eau sombre ----------
const DISPLAY = `
precision highp float;
uniform sampler2D uInk;
uniform vec2 uRes;
uniform float uTime, uPx;
${NOISE}
${CURL}
float den(vec2 t){ return texture2D(uInk, t).r; }
const vec3 LH = vec3(-.247, .329, .911);
// une couche de paillettes : chacune a son éclat, son scintillement, et flashe quand le courant l'incline vers la lumière
float glit(vec2 q, float seed, float dens, vec3 n){
    vec2 gp = q * uRes / max(uPx * 1.7, 2.2), c = floor(gp) + seed, f = fract(gp) - .5;
    float r1 = h1(c), r2 = h1(c + 17.31), r3 = h1(c + 43.7);
    if (r1 > dens) return 0.;
    float dm = 1. - smoothstep(.1, .42, length(f - (vec2(r2, r3) - .5) * .4));
    float tw = pow(.5 + .5 * sin(uTime * (1.1 + r3 * 4.) + r1 * 90.), 12.);
    vec3 fN = normalize(n + vec3((r2 - .5) * 2.2, (r3 - .5) * 2.2, 0.));
    return dm * (.3 + .55 * r2 + tw * 1.5 + pow(max(dot(fN, LH), 0.), 140.) * 2.6);
}
void main(){
    vec2 uv = gl_FragCoord.xy / uRes, e = 1.5 / uRes;
    float d = den(uv), asp = uRes.x / uRes.y;
    float gx = den(uv + vec2(e.x, 0)) - den(uv - vec2(e.x, 0));
    float gy = den(uv + vec2(0, e.y)) - den(uv - vec2(0, e.y));
    vec3 col = vec3(.059, .059, .067);
    col += .016 * (1. - smoothstep(.1, .85, length(uv - .5) * 1.3));
    col += (noise(uv * vec2(asp, 1.) * 300.) - .5) * .01;
    vec2 p = vec2(uv.x * asp, uv.y);
    vec2 vel = (curl(p * 1.6) * .0017 + curl(p * 4.2 + 7.) * .0005) * 36.;
    vec3 n = normalize(vec3(-gx * 3., -gy * 3., .4));
    // deux couches se relaient : chacune dérive avec le courant puis se renouvelle, sans traînées
    float T = .7, ph = uTime / T, pa = fract(ph), pb = fract(ph + .5);
    float wa = 1. - abs(2. * pa - 1.), wb = 1. - wa;
    float sa = mod(floor(ph), 61.) * 7.13, sb = mod(floor(ph + .5), 61.) * 7.13 + 311.7;
    float cover = 1. - exp(-d * 2.);
    vec3 tint = vec3(.96, .85, .64);
    float g = glit(uv - vel * pa * T, sa, cover * .78, n) * wa + glit(uv - vel * pb * T, sb, cover * .78, n) * wb;
    gl_FragColor = vec4(col + tint * cover * .075 + tint * g, 1.);
}`;

function program(gl, fs) {
    const compile = (type, src) => {
        const s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; }
        return s;
    };
    const v = compile(gl.VERTEX_SHADER, VS), f = compile(gl.FRAGMENT_SHADER, fs);
    if (!v || !f) return null;
    const p = gl.createProgram();
    gl.attachShader(p, v);
    gl.attachShader(p, f);
    gl.bindAttribLocation(p, 0, 'aPos');
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) return null;
    const u = {};
    for (let i = 0, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); i < n; i++) {
        const name = gl.getActiveUniform(p, i).name;
        u[name.replace(/\[0\]$/, '')] = gl.getUniformLocation(p, name);
    }
    return { p, u };
}

// Un triangle qui couvre tout l'écran.
function fullscreenTriangle(gl) {
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
}

function fitCanvas(canvas, dpr) {
    const w = Math.max(2, Math.round(canvas.clientWidth * dpr)), h = Math.max(2, Math.round(canvas.clientHeight * dpr));
    if (canvas.width === w && canvas.height === h) return false;
    canvas.width = w;
    canvas.height = h;
    return true;
}

// ---------- Fond de la section ----------
function initDrift(section, canvas, reduced) {
    const gl = canvas.getContext('webgl', { antialias: false, depth: false });
    const prog = gl && program(gl, DRIFT);
    if (!prog) return;
    gl.useProgram(prog.p);
    fullscreenTriangle(gl);
    const root = document.documentElement;
    // Pleine résolution : agrandies par le navigateur, les paillettes devenaient des carrés flous.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function draw(time) {
        fitCanvas(canvas, dpr);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform2f(prog.u.uRes, canvas.width, canvas.height);
        gl.uniform1f(prog.u.uTime, time);
        gl.uniform1f(prog.u.uPx, dpr);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    // Mouvement réduit : une image fixe, redessinée quand la section change de taille.
    if (reduced) {
        new ResizeObserver(() => draw(12)).observe(canvas);
        return;
    }
    (function frame(now) {
        requestAnimationFrame(frame);
        // Rien à dessiner vitrine fermée, ni quand un projet agrandi la recouvre.
        // Ni pendant les éclats : le fond n'apparaît qu'avec le décor (.is-ui).
        if (!root.classList.contains('showcase-open') || !section.classList.contains('is-ui') || section.classList.contains('is-zooming')) return;
        draw(now / 1000);
    })(0);
}

// ---------- Bassin du projet agrandi ----------
function initPool(zoom, canvas, reduced) {
    const opts = { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: false };
    let gl = canvas.getContext('webgl2', opts);
    const gl2 = !!gl;
    if (!gl) gl = canvas.getContext('webgl', opts);
    if (!gl) return;
    const advect = program(gl, ADVECT), display = program(gl, DISPLAY);
    if (!advect || !display) return;
    fullscreenTriangle(gl);

    function makeTarget(w, h, f) {
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, f.internal, w, h, 0, f.format, f.type, null);
        const fb = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
        const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        return { tex, fb, ok };
    }

    // Le meilleur format de texture rendu possible : en 8 bits l'encre s'efface plus vite pour éviter les traces.
    const formats = [];
    if (gl2) {
        if (gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float'))
            formats.push({ internal: gl.RGBA16F, format: gl.RGBA, type: gl.HALF_FLOAT, decay: 0.9978 });
        formats.push({ internal: gl.RGBA8, format: gl.RGBA, type: gl.UNSIGNED_BYTE, decay: 0.975 });
    } else {
        const hf = gl.getExtension('OES_texture_half_float');
        gl.getExtension('OES_texture_half_float_linear');
        if (hf) formats.push({ internal: gl.RGBA, format: gl.RGBA, type: hf.HALF_FLOAT_OES, decay: 0.9978 });
        formats.push({ internal: gl.RGBA, format: gl.RGBA, type: gl.UNSIGNED_BYTE, decay: 0.975 });
    }
    const fmt = formats.find(f => {
        const t = makeTarget(4, 4, f);
        gl.deleteTexture(t.tex);
        gl.deleteFramebuffer(t.fb);
        return t.ok;
    });
    if (!fmt) return;

    const SIM = 0.55, dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const rand = (a, b) => a + Math.random() * (b - a);
    let A = null, B = null, W = 0, H = 0, simW = 0, simH = 0;
    let drops = [], simTime = 0, nextDrop = 0, lastTouch = -10;
    const mouse = { x: -1, y: -1, px: -1, py: -1, inside: false, down: false };
    const DV = new Float32Array(16), DVEL = new Float32Array(16);

    function build() {
        W = Math.max(2, canvas.clientWidth);
        H = Math.max(2, canvas.clientHeight);
        if (!fitCanvas(canvas, dpr) && A) return false;
        simW = Math.max(2, Math.floor(W * SIM));
        simH = Math.max(2, Math.floor(H * SIM));
        [A, B].forEach(t => { if (t) { gl.deleteTexture(t.tex); gl.deleteFramebuffer(t.fb); } });
        A = makeTarget(simW, simH, fmt);
        B = makeTarget(simW, simH, fmt);
        return true;
    }

    function drop(x, y, amt, vx = rand(-0.004, 0.004), vy = rand(-0.006, -0.002)) {
        drops.push({ x, y, amt, vx, vy, life: 1 });
        if (drops.length > 4) drops.shift();
    }

    function step(auto) {
        simTime += 1 / 60;
        // une goutte tombe d'elle-même de temps en temps, sauf si on vient de remuer
        if (auto && simTime > nextDrop) {
            nextDrop = simTime + rand(2.2, 3.6);
            if (simTime - lastTouch > 2.5) drop(rand(0.15, 0.85), rand(0.2, 0.8), rand(0.5, 0.9));
        }
        let mvx = 0, mvy = 0, amount = 0;
        const radius = mouse.down ? 0.035 : 0.016;
        if (mouse.inside && mouse.px >= 0) {
            mvx = (mouse.x - mouse.px) / W;
            mvy = -(mouse.y - mouse.py) / H;
            amount = mouse.down ? 0.09 : 0.035 * Math.min(1, Math.hypot(mvx, mvy) * 40);
        }
        mouse.px = mouse.x;
        mouse.py = mouse.y;
        for (let i = 0; i < 4; i++) {
            const d = drops[i];
            if (d) {
                d.life -= 0.02; d.x += d.vx * 0.4; d.y += d.vy * 0.4;
                DV.set([d.x, d.y, Math.max(0, d.life) * d.amt * 0.16, 0.018 + (1 - d.life) * 0.022], i * 4);
                DVEL.set([d.vx, d.vy, 0, 0], i * 4);
            } else {
                DV.set([0, 0, 0, 0.01], i * 4);
                DVEL.set([0, 0, 0, 0], i * 4);
            }
        }
        drops = drops.filter(d => d.life > 0);

        const u = advect.u, clamp = v => Math.max(-0.03, Math.min(0.03, v)) * 0.8;
        gl.bindFramebuffer(gl.FRAMEBUFFER, B.fb);
        gl.viewport(0, 0, simW, simH);
        gl.useProgram(advect.p);
        gl.bindTexture(gl.TEXTURE_2D, A.tex);
        gl.uniform1i(u.uPrev, 0);
        gl.uniform2f(u.uRes, simW, simH);
        gl.uniform1f(u.uTime, simTime);
        gl.uniform1f(u.uAspect, W / H);
        gl.uniform1f(u.uDecay, fmt.decay);
        gl.uniform4f(u.uMouse, mouse.x / W, 1 - mouse.y / H, amount, radius);
        gl.uniform2f(u.uMouseVel, clamp(mvx), clamp(mvy));
        gl.uniform4fv(u.uDrops, DV);
        gl.uniform4fv(u.uDropVel, DVEL);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        [A, B] = [B, A];
    }

    function draw() {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.useProgram(display.p);
        gl.bindTexture(gl.TEXTURE_2D, A.tex);
        gl.uniform1i(display.u.uInk, 0);
        gl.uniform2f(display.u.uRes, canvas.width, canvas.height);
        gl.uniform1f(display.u.uTime, simTime);
        gl.uniform1f(display.u.uPx, dpr);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    // Mouvement réduit : on avance la simulation jusqu'à une image posée, puis on la garde.
    const settle = n => { for (let i = 0; i < n; i++) step(false); draw(); };

    let raf = 0, last = 0, acc = 0;
    function frame(now) {
        raf = requestAnimationFrame(frame);
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        acc += dt;
        let n = 0;
        while (acc >= 1 / 60 && n < 3) { step(true); acc -= 1 / 60; n++; }
        if (n) draw();
    }

    function open() {
        if (build()) {
            drop(0.36, 0.6, 0.9, 0.004, -0.002);
            drop(0.66, 0.4, 0.7, -0.003, 0.003);
            settle(reduced ? 160 : 20);
        }
        if (reduced || raf) return;
        last = performance.now();
        acc = 0;
        raf = requestAnimationFrame(frame);
    }
    function close() {
        cancelAnimationFrame(raf);
        raf = 0;
        mouse.inside = false;
    }

    // Le zoom s'ouvre et se ferme via son attribut hidden (controllers/showcase.js).
    new MutationObserver(() => (zoom.hidden ? close() : open())).observe(zoom, { attributes: true, attributeFilter: ['hidden'] });
    window.addEventListener('resize', () => { if (!zoom.hidden && build()) settle(reduced ? 120 : 10); });

    const pos = e => { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top, r }; };
    zoom.addEventListener('pointermove', e => {
        if (e.pointerType === 'touch') return;
        const p = pos(e);
        mouse.inside = p.x > 0 && p.y > 0 && p.x < p.r.width && p.y < p.r.height;
        if (mouse.px < 0 || !mouse.inside) { mouse.px = p.x; mouse.py = p.y; }
        mouse.x = p.x;
        mouse.y = p.y;
        if (mouse.inside) lastTouch = simTime;
    }, { passive: true });
    zoom.addEventListener('pointerleave', () => { mouse.inside = false; });
    // Un clic hors des liens et boutons dépose une goutte.
    zoom.addEventListener('pointerdown', e => {
        if (e.target.closest('a, button')) return;
        const p = pos(e);
        lastTouch = simTime;
        if (e.pointerType !== 'touch') mouse.down = true;
        drop(p.x / W, 1 - p.y / H, 1.2, 0, 0);
        if (reduced) settle(50);
    });
    window.addEventListener('pointerup', () => { mouse.down = false; });
}

export function initProjectInk() {
    const section = document.getElementById('projects');
    if (!section) return;
    const reduced = prefersReducedMotion();
    const bg = section.querySelector('.sc-bg');
    const zoom = section.querySelector('.sc-zoom');
    if (bg) initDrift(section, bg, reduced);
    if (zoom) initPool(zoom, zoom.querySelector('.sc-zoom-ink'), reduced);
}
