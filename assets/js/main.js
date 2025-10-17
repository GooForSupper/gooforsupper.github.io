(() => {
    const grid = document.getElementById('eyes');
    const TOTAL_EYES = 20;
    const GRID_LIMITS = { minCols: 2, maxCols: 8, minRows: 2, maxRows: 8 };
    const gridShape = { rows: 0, cols: 0 };
    const specialLinks = [
        { type: 'discord', url: 'https://discord.gg/dontblink', aria: "Opent de Discord-community van DON'T BLINK." },
        { type: 'youtube', url: 'https://youtu.be/dontblinktrailer', aria: "Bekijk de YouTube-trailer van DON'T BLINK." }
    ];
    const BLINK_SETTINGS = { minDelay: 3500, maxDelay: 9500, duration: 160 };

    let uid = 0;
    function makeEye() {
        const boxW = 140;
        const boxH = 90;
        const cx = boxW / 2;
        const cy = boxH / 2;

        // Per-eye tuning for pupil travel and smoothing
        const baseTravelMin = 6;
        const baseTravelMax = 26;
        const pupilR = 18;
        const lerpAlpha = 0.18;

        const id = `clip-${uid++}`;
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', `0 0 ${boxW} ${boxH}`);

        const almond = `M 8 ${cy} Q ${cx} ${-2} ${boxW - 8} ${cy} Q ${cx} ${boxH + 2} 8 ${cy} Z`;

        const defs = document.createElementNS(svg.namespaceURI, 'defs');
        const clip = document.createElementNS(svg.namespaceURI, 'clipPath');
        clip.setAttribute('id', id);
        const clipPathShape = document.createElementNS(svg.namespaceURI, 'path');
        clipPathShape.setAttribute('d', almond);
        clip.appendChild(clipPathShape);
        defs.appendChild(clip);
        svg.appendChild(defs);

        const sclera = document.createElementNS(svg.namespaceURI, 'path');
        sclera.setAttribute('d', almond);
        sclera.setAttribute('fill', 'var(--white)');
        sclera.setAttribute('stroke', 'var(--line)');
        sclera.setAttribute('stroke-width', '1');
        svg.appendChild(sclera);

        const g = document.createElementNS(svg.namespaceURI, 'g');
        g.setAttribute('clip-path', `url(#${id})`);

        const pupil = document.createElementNS(svg.namespaceURI, 'circle');
        pupil.setAttribute('cx', cx);
        pupil.setAttribute('cy', cy);
        pupil.setAttribute('r', pupilR);
        pupil.setAttribute('fill', '#15171b');
        pupil.classList.add('pupil');
        g.appendChild(pupil);

        const lidTop = document.createElementNS(svg.namespaceURI, 'rect');
        lidTop.setAttribute('x', '0');
        lidTop.setAttribute('y', '0');
        lidTop.setAttribute('width', boxW);
        lidTop.setAttribute('height', (boxH / 2 + 6).toFixed(2));
        lidTop.setAttribute('style', 'fill: var(--bg);');
        lidTop.classList.add('lid-top');
        g.appendChild(lidTop);

        const lidBottom = document.createElementNS(svg.namespaceURI, 'rect');
        lidBottom.setAttribute('x', '0');
        lidBottom.setAttribute('y', (boxH / 2 - 6).toFixed(2));
        lidBottom.setAttribute('width', boxW);
        lidBottom.setAttribute('height', (boxH / 2 + 6).toFixed(2));
        lidBottom.setAttribute('style', 'fill: var(--bg);');
        lidBottom.classList.add('lid-bottom');
        g.appendChild(lidBottom);

        svg.appendChild(g);

        svg._state = {
            cx,
            cy,
            baseTravelMin,
            baseTravelMax,
            lerpAlpha,
            targetX: cx,
            targetY: cy,
            curX: cx,
            curY: cy,
            pupil
        };

        const cell = document.createElement('div');
        cell.className = 'eye';
        cell.appendChild(svg);
        return cell;
    }

    function computeGridShape() {
        const ratio = window.innerWidth && window.innerHeight ? window.innerWidth / window.innerHeight : 1;
        const idealCols = Math.round(Math.sqrt(TOTAL_EYES * ratio));
        const cols = Math.max(GRID_LIMITS.minCols, Math.min(GRID_LIMITS.maxCols, idealCols));
        const neededRows = Math.ceil(TOTAL_EYES / cols);
        const rows = Math.max(GRID_LIMITS.minRows, Math.min(GRID_LIMITS.maxRows, neededRows));
        return { rows, cols };
    }

    function chooseRandomIndices(count, max) {
        const pool = Array.from({ length: max }, (_, i) => i);
        const picks = [];
        for (let i = 0; i < count && pool.length; i++) {
            const idx = Math.floor(Math.random() * pool.length);
            picks.push(pool.splice(idx, 1)[0]);
        }
        return picks;
    }

    function stopBlink(cell) {
        if (cell._blinkStart) {
            clearTimeout(cell._blinkStart);
            delete cell._blinkStart;
        }
        if (cell._blinkEnd) {
            clearTimeout(cell._blinkEnd);
            delete cell._blinkEnd;
        }
        cell.classList.remove('blinking');
    }

    function scheduleBlink(cell) {
        stopBlink(cell);
        const delayRange = BLINK_SETTINGS.maxDelay - BLINK_SETTINGS.minDelay;
        const delay = BLINK_SETTINGS.minDelay + Math.random() * delayRange;
        cell._blinkStart = setTimeout(() => {
            cell.classList.add('blinking');
            cell._blinkEnd = setTimeout(() => {
                cell.classList.remove('blinking');
                scheduleBlink(cell);
            }, BLINK_SETTINGS.duration);
        }, delay);
    }

    function createLogoGroup(svg, type) {
        const st = svg._state;
        const ns = svg.namespaceURI;
        const group = document.createElementNS(ns, 'g');
        group.classList.add('logo', `logo-${type}`);
        group.setAttribute('pointer-events', 'none');

        const radius = parseFloat(st.pupil.getAttribute('r')) || 18;
        const size = radius * 2.1;
        const cx = st.cx;
        const cy = st.cy;

        const image = document.createElementNS(ns, 'image');
        const href = type === 'discord' ? 'assets/icons/DiscordLogo.png' : 'assets/icons/YoutubeLogo.png';
        image.setAttribute('x', (cx - size / 2).toFixed(2));
        image.setAttribute('y', (cy - size / 2).toFixed(2));
        image.setAttribute('width', size.toFixed(2));
        image.setAttribute('height', size.toFixed(2));
        image.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        image.setAttribute('href', href);
        image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', href);
        image.setAttribute('style', 'pointer-events:none;');
        group.appendChild(image);

        return group;
    }

    function clearSpecial(cell) {
        stopBlink(cell);
        if (!cell.classList.contains('linked')) return;
        if (cell._linkHandler) {
            cell.removeEventListener('click', cell._linkHandler);
            delete cell._linkHandler;
        }
        if (cell._keyHandler) {
            cell.removeEventListener('keydown', cell._keyHandler);
            delete cell._keyHandler;
        }
        cell.classList.remove('linked', 'linked-discord', 'linked-youtube');
        cell.removeAttribute('role');
        cell.removeAttribute('tabindex');
        cell.removeAttribute('aria-label');
        delete cell.dataset.linkType;

        const svg = cell.querySelector('svg');
        if (svg && svg._state && svg._state.pupil) {
            svg._state.pupil.setAttribute('fill', '#15171b');
        }
        if (svg) {
            const inner = svg.querySelector('g');
            if (inner) {
                inner.querySelectorAll('.logo').forEach(logo => logo.remove());
            }
        }
    }

    function markSpecial(cell, spec) {
        clearSpecial(cell);
        const svg = cell.querySelector('svg');
        if (!svg || !svg._state) return;
        const inner = svg.querySelector('g');
        if (!inner) return;

        svg._state.pupil.setAttribute('fill', '#7a0d0d');
        const logo = createLogoGroup(svg, spec.type);
        inner.appendChild(logo);

        const openLink = () => window.open(spec.url, '_blank', 'noopener');
        const clickHandler = (event) => {
            event.preventDefault();
            openLink();
        };
        const keyHandler = (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openLink();
            }
        };

        cell.classList.add('linked', `linked-${spec.type}`);
        cell.dataset.linkType = spec.type;
        cell.setAttribute('role', 'link');
        cell.setAttribute('tabindex', '0');
        cell.setAttribute('aria-label', spec.aria);
        cell.addEventListener('click', clickHandler);
        cell.addEventListener('keydown', keyHandler);
        cell._linkHandler = clickHandler;
        cell._keyHandler = keyHandler;

        scheduleBlink(cell);
    }

    function assignSpecialEyes() {
        const cells = Array.from(grid.children);
        cells.forEach(clearSpecial);
        if (cells.length < specialLinks.length) return;

        const indices = chooseRandomIndices(specialLinks.length, cells.length);
        if (indices.length < specialLinks.length) return;
        const specs = specialLinks.slice().sort(() => Math.random() - 0.5);
        specs.forEach((spec, i) => {
            const cell = cells[indices[i]];
            if (cell) markSpecial(cell, spec);
        });
    }

    function rebuildEyes(force = false) {
        const { rows, cols } = computeGridShape();
        if (!force && rows === gridShape.rows && cols === gridShape.cols) return;
        gridShape.rows = rows;
        gridShape.cols = cols;
        grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        grid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        const needed = rows * cols;
        const current = grid.children.length;
        if (current < needed) {
            for (let i = current; i < needed; i++) grid.appendChild(makeEye());
        } else if (current > needed) {
            for (let i = current - 1; i >= needed; i--) {
                const cell = grid.children[i];
                clearSpecial(cell);
                grid.removeChild(cell);
            }
        }
        assignSpecialEyes();
    }

    let mouseX = innerWidth / 2;
    let mouseY = innerHeight / 2;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const lerp = (a, b, t) => a + (b - a) * t;

    function computeTargets(svg) {
        const st = svg._state;
        const rect = svg.getBoundingClientRect();
        const cxScreen = rect.left + rect.width * (st.cx / svg.viewBox.baseVal.width);
        const cyScreen = rect.top + rect.height * (st.cy / svg.viewBox.baseVal.height);

        const dx = mouseX - cxScreen;
        const dy = mouseY - cyScreen;
        const pointerInside = mouseX >= rect.left && mouseX <= rect.right && mouseY >= rect.top && mouseY <= rect.bottom;

        if (pointerInside) {
            const nx = (mouseX - rect.left) / rect.width - 0.5;
            const ny = (mouseY - rect.top) / rect.height - 0.5;
            const maxX = st.baseTravelMax * 1.15;
            const maxY = st.baseTravelMax * (rect.height / rect.width) * 1.1;
            const offsetX = clamp(nx * 2 * maxX, -maxX, maxX);
            const offsetY = clamp(ny * 2 * maxY, -maxY, maxY);
            st.targetX = st.cx + offsetX;
            st.targetY = st.cy + offsetY;
        } else {
            const angle = Math.atan2(dy, dx);
            const dist = Math.hypot(dx, dy);
            const eyeRadiusScreen = Math.max(rect.width, rect.height) * 0.8;
            const proximity = clamp(1 - dist / (eyeRadiusScreen * 6), 0, 1);
            const travel = st.baseTravelMin + proximity * (st.baseTravelMax - st.baseTravelMin);
            st.targetX = st.cx + Math.cos(angle) * travel;
            st.targetY = st.cy + Math.sin(angle) * travel;
        }
    }

    function tick() {
        const svgs = grid.querySelectorAll('svg');
        svgs.forEach(svg => {
            computeTargets(svg);
            const st = svg._state;
            st.curX = lerp(st.curX, st.targetX, st.lerpAlpha);
            st.curY = lerp(st.curY, st.targetY, st.lerpAlpha);
            st.pupil.setAttribute('cx', st.curX.toFixed(2));
            st.pupil.setAttribute('cy', st.curY.toFixed(2));
        });
        requestAnimationFrame(tick);
    }

    window.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    }, { passive: true });

    window.addEventListener('touchmove', e => {
        const t = e.touches[0];
        if (t) {
            mouseX = t.clientX;
            mouseY = t.clientY;
        }
    }, { passive: true });

    window.addEventListener('resize', () => rebuildEyes());

    rebuildEyes(true);
    requestAnimationFrame(tick);
})();
