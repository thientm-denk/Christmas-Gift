/* Christmas Gift — page script (no dependencies) */
(function () {
    'use strict';

    var $ = function (s, r) { return (r || document).querySelector(s); };
    var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var rand = function (a, b) { return a + Math.random() * (b - a); };

    var LOVE_START = new Date(2020, 5, 25, 0, 0, 0); // 25/06/2020
    var LETTER = [
        'Baby, I love you',
        'Anh biết anh không thể nói ngọt ngào',
        'Nhưng anh sẽ chứng minh nó bằng hành động',
        'Anh tin rằng, đây là lời thề tốt nhất cho em',
        'Suốt cuộc đời này, anh sẽ ở bên em',
        'Em sẽ là gió, em sẽ là tuyết',
        'Xuân hạ thu đông là em',
        'Bất cứ đâu em thấy',
        'mãi yêu',
        'em'
    ];
    var HEART_PATH = 'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z';

    var scroller = $('#main');
    var audio = $('#bgm');
    var musicBtn = $('#music');

    /* ---------------------------------------------------------
       Gate + music
       --------------------------------------------------------- */
    function setMusicUI(playing) {
        musicBtn.setAttribute('aria-pressed', playing ? 'true' : 'false');
        musicBtn.setAttribute('aria-label', playing ? 'Tắt nhạc' : 'Bật nhạc');
    }
    function playMusic() {
        var p = audio.play();
        if (p && p.then) p.then(function () { setMusicUI(true); }, function () { setMusicUI(false); });
        else setMusicUI(true);
    }
    audio.volume = 0.85;
    audio.addEventListener('pause', function () { setMusicUI(false); });
    audio.addEventListener('play', function () { setMusicUI(true); });
    musicBtn.addEventListener('click', function () {
        if (audio.paused) playMusic(); else audio.pause();
    });

    $('#open-gift').addEventListener('click', function () {
        playMusic();
        document.body.classList.add('opening');
        setTimeout(function () {
            document.body.classList.add('opened');
            scroller.focus({ preventScroll: true });
            startSnow();
            var r = $('#home .hero__title').getBoundingClientRect();
            spawnHearts(window.innerWidth / 2, r.top + r.height / 2, 18);
        }, reduceMotion ? 0 : 650);
    });

    /* ---------------------------------------------------------
       Reveal on scroll + nav dots
       --------------------------------------------------------- */
    var revealIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            if (e.isIntersecting) { e.target.classList.add('in'); revealIO.unobserve(e.target); }
        });
    }, { root: scroller, threshold: 0.15 });
    $$('.reveal').forEach(function (el) { revealIO.observe(el); });

    var dotLinks = $$('.dots a');
    var sectionIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            if (!e.isIntersecting) return;
            dotLinks.forEach(function (a) {
                a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id);
            });
        });
    }, { root: scroller, threshold: 0.55 });
    $$('.section').forEach(function (s) { sectionIO.observe(s); });

    /* ---------------------------------------------------------
       Love counter (computed from the real clock every tick)
       --------------------------------------------------------- */
    var elD = $('#t_d'), elH = $('#t_h'), elM = $('#t_m'), elS = $('#t_s');
    var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
    function tick() {
        var diff = Math.max(0, Date.now() - LOVE_START.getTime());
        var s = Math.floor(diff / 1000);
        elD.textContent = Math.floor(s / 86400).toLocaleString('vi-VN');
        elH.textContent = pad(Math.floor(s % 86400 / 3600));
        elM.textContent = pad(Math.floor(s % 3600 / 60));
        elS.textContent = pad(s % 60);
    }
    tick();
    setInterval(tick, 1000);

    /* ---------------------------------------------------------
       Fairy lights across the top of the hero
       --------------------------------------------------------- */
    var lights = $('#lights');
    function drawLights() {
        var w = lights.clientWidth;
        var n = Math.max(8, Math.min(26, Math.round(w / 52)));
        var colors = ['#f43f5e', '#f5c66b', '#4ade80', '#60a5fa', '#f9a8d4'];
        var sag = Math.min(46, w * 0.06);
        var y = function (u) { return 10 + sag * 4 * u * (1 - u); };
        var html = '<svg viewBox="0 0 ' + w + ' 90" preserveAspectRatio="none"><path d="M0 10 Q ' + (w / 2) + ' ' + (10 + sag * 2) + ' ' + w + ' 10" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="1.5"/></svg>';
        for (var i = 0; i < n; i++) {
            var u = (i + 0.5) / n;
            html += '<span class="bulb" style="left:' + (u * 100) + '%;top:' + (y(u) + 2) + 'px;--c:' + colors[i % colors.length] + ';--d:' + (-(i * 0.37) % 2.4).toFixed(2) + 's"></span>';
        }
        lights.innerHTML = html;
    }
    drawLights();

    /* ---------------------------------------------------------
       Snow (+ a few tiny hearts)
       --------------------------------------------------------- */
    var snow = $('#snow'), sctx = snow.getContext('2d');
    var flakes = [], snowRunning = false, sw = 0, sh = 0;
    function sizeSnow() {
        sw = window.innerWidth; sh = window.innerHeight;
        snow.width = sw * DPR; snow.height = sh * DPR;
        sctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        var count = Math.round(Math.min(160, sw * sh / 8000));
        flakes = [];
        for (var i = 0; i < count; i++) flakes.push(newFlake(true));
    }
    function newFlake(anywhere) {
        var heart = Math.random() < 0.08;
        return {
            x: rand(0, sw), y: anywhere ? rand(0, sh) : rand(-40, -10),
            r: heart ? rand(4, 7) : rand(0.8, 2.8),
            vy: rand(18, 55), vx: rand(-10, 10),
            ph: rand(0, Math.PI * 2), a: rand(0.35, 0.95), heart: heart
        };
    }
    function drawHeartShape(ctx, x, y, s) {
        ctx.beginPath();
        ctx.moveTo(x, y + s * 0.35);
        ctx.bezierCurveTo(x, y, x - s, y, x - s, y + s * 0.4);
        ctx.bezierCurveTo(x - s, y + s * 0.8, x, y + s * 1.1, x, y + s * 1.3);
        ctx.bezierCurveTo(x, y + s * 1.1, x + s, y + s * 0.8, x + s, y + s * 0.4);
        ctx.bezierCurveTo(x + s, y, x, y, x, y + s * 0.35);
        ctx.fill();
    }
    var lastSnow = 0;
    function snowFrame(t) {
        if (!snowRunning) return;
        var dt = Math.min(0.05, (t - (lastSnow || t)) / 1000); lastSnow = t;
        sctx.clearRect(0, 0, sw, sh);
        for (var i = 0; i < flakes.length; i++) {
            var f = flakes[i];
            f.ph += dt;
            f.y += f.vy * dt;
            f.x += (f.vx + Math.sin(f.ph) * 14) * dt;
            if (f.y > sh + 12) { flakes[i] = newFlake(false); continue; }
            if (f.x < -12) f.x = sw + 10; else if (f.x > sw + 12) f.x = -10;
            sctx.globalAlpha = f.a;
            if (f.heart) { sctx.fillStyle = '#f9a8d4'; drawHeartShape(sctx, f.x, f.y, f.r); }
            else { sctx.fillStyle = '#fff'; sctx.beginPath(); sctx.arc(f.x, f.y, f.r, 0, 6.283); sctx.fill(); }
        }
        sctx.globalAlpha = 1;
        requestAnimationFrame(snowFrame);
    }
    function startSnow() {
        if (snowRunning) return;
        if (reduceMotion) { snowRunning = true; snowFrame(0); snowRunning = false; return; }
        snowRunning = true; lastSnow = 0; requestAnimationFrame(snowFrame);
    }
    sizeSnow();
    document.addEventListener('visibilitychange', function () {
        if (!document.body.classList.contains('opened')) return;
        if (document.hidden) snowRunning = false; else startSnow();
    });

    /* ---------------------------------------------------------
       3D ring gallery (pointer drag + inertia + auto-rotate)
       --------------------------------------------------------- */
    var stage = $('#stage'), ring = $('#ring');
    var figs = $$('figure', ring);
    var N = figs.length, step = 360 / N;
    var rotY = 0, rotX = -8, velY = 0, velX = 0, radius = 300;
    var dragging = false, lastX = 0, lastY = 0, moved = 0, downFig = null, lastMove = 0;

    function layoutRing() {
        var cw = figs[0].offsetWidth;
        radius = Math.round((cw / 2) / Math.tan(Math.PI / N) * 1.5);
        figs.forEach(function (f, i) {
            f.style.transform = 'rotateY(' + (i * step) + 'deg) translateZ(' + radius + 'px)';
        });
    }
    function applyRing() {
        ring.style.transform = 'translateZ(' + (-radius * 0.85) + 'px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg)';
        // fade cards that face away, so the front of the ring reads clearly
        for (var i = 0; i < N; i++) {
            var c = Math.cos((i * step + rotY) * Math.PI / 180);
            figs[i].style.opacity = (0.28 + 0.72 * Math.pow((c + 1) / 2, 1.6)).toFixed(3);
        }
    }
    layoutRing(); applyRing();

    stage.addEventListener('pointerdown', function (e) {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        dragging = true; moved = 0; lastX = e.clientX; lastY = e.clientY; lastMove = performance.now();
        downFig = e.target.closest ? e.target.closest('figure') : null;
        velY = velX = 0;
        stage.classList.add('dragging');
        try { stage.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    });
    stage.addEventListener('pointermove', function (e) {
        if (!dragging) return;
        var dx = e.clientX - lastX, dy = e.clientY - lastY;
        moved += Math.abs(dx) + Math.abs(dy);
        lastX = e.clientX; lastY = e.clientY; lastMove = performance.now();
        velY = dx * 0.25; velX = -dy * 0.08;
        rotY += velY;
        rotX = Math.max(-22, Math.min(12, rotX + velX));
        applyRing();
    });
    function endDrag() {
        if (!dragging) return;
        dragging = false;
        stage.classList.remove('dragging');
        if (performance.now() - lastMove > 80) velY = velX = 0;
        if (moved < 6 && downFig) openViewer(figs.indexOf(downFig));
    }
    stage.addEventListener('pointerup', endDrag);
    stage.addEventListener('pointercancel', function () { moved = 99; endDrag(); });

    var galleryVisible = false, lastRing = 0;
    function ringFrame(t) {
        if (!galleryVisible) return;
        var dt = Math.min(0.05, (t - (lastRing || t)) / 1000); lastRing = t;
        if (!dragging) {
            velY *= Math.pow(0.05, dt); velX *= Math.pow(0.05, dt);
            rotY += velY * dt * 60 + (reduceMotion ? 0 : -8 * dt);
            rotX = Math.max(-22, Math.min(12, rotX + velX * dt * 60));
            rotX += (-8 - rotX) * Math.min(1, dt * 0.8);
            applyRing();
        }
        requestAnimationFrame(ringFrame);
    }
    new IntersectionObserver(function (es) {
        galleryVisible = es[0].isIntersecting;
        if (galleryVisible) { lastRing = 0; requestAnimationFrame(ringFrame); }
    }, { root: scroller }).observe(stage);

    // keyboard: arrows rotate when the stage is focused
    stage.tabIndex = 0;
    stage.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') { velY = -4; e.preventDefault(); }
        if (e.key === 'ArrowRight') { velY = 4; e.preventDefault(); }
        if (e.key === 'Enter') openViewer(frontIndex());
    });
    function frontIndex() {
        var a = ((-rotY % 360) + 360) % 360;
        return Math.round(a / step) % N;
    }

    /* Viewer */
    var viewer = $('#viewer'), vImg = $('#viewerImg'), vIndex = 0;
    function showImg(i) {
        vIndex = (i + N) % N;
        var src = figs[vIndex].querySelector('img');
        vImg.src = src.src; vImg.alt = src.alt;
    }
    function openViewer(i) {
        if (i < 0) return;
        showImg(i);
        if (viewer.showModal) viewer.showModal(); else viewer.setAttribute('open', '');
    }
    viewer.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-act]');
        var act = btn ? btn.getAttribute('data-act') : (e.target === viewer ? 'close' : null);
        if (act === 'close') viewer.close();
        if (act === 'prev') showImg(vIndex - 1);
        if (act === 'next') showImg(vIndex + 1);
    });
    viewer.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') showImg(vIndex - 1);
        if (e.key === 'ArrowRight') showImg(vIndex + 1);
    });
    var tsX = null;
    viewer.addEventListener('touchstart', function (e) { tsX = e.touches[0].clientX; }, { passive: true });
    viewer.addEventListener('touchend', function (e) {
        if (tsX === null) return;
        var dx = e.changedTouches[0].clientX - tsX; tsX = null;
        if (Math.abs(dx) > 50) showImg(vIndex + (dx < 0 ? 1 : -1));
    });

    /* ---------------------------------------------------------
       Particle heart + typed letter
       --------------------------------------------------------- */
    var hStage = $('#heartStage'), hc = $('#heartCanvas'), hctx = hc.getContext('2d');
    var typed = $('#typed'), openBtn = $('#openLetter');
    var skipBtn = $('#skipTyping'), toWish = $('#toWish');
    var hw = 0, hh = 0, hs = 1, parts = [], heartOn = false, heartVisible = false, heartStart = 0, glowBoost = 0;

    $('#letterFull').textContent = LETTER.join('. ');

    function heartXY(t) { // classic parametric heart, y up
        var s = Math.sin(t);
        return {
            x: 16 * s * s * s,
            y: 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)
        };
    }
    // outline polygon with cumulative arc length, for even sampling + hit tests
    var poly = [], polyLen = [0];
    (function () {
        for (var i = 0; i <= 360; i++) poly.push(heartXY(i / 360 * Math.PI * 2));
        for (var j = 1; j < poly.length; j++) {
            polyLen.push(polyLen[j - 1] + Math.hypot(poly[j].x - poly[j - 1].x, poly[j].y - poly[j - 1].y));
        }
    })();
    function outlineAt(u) {
        var L = u * polyLen[polyLen.length - 1], j = 1;
        while (j < polyLen.length - 1 && polyLen[j] < L) j++;
        var f = (L - polyLen[j - 1]) / ((polyLen[j] - polyLen[j - 1]) || 1);
        return { x: poly[j - 1].x + (poly[j].x - poly[j - 1].x) * f, y: poly[j - 1].y + (poly[j].y - poly[j - 1].y) * f };
    }
    function insideHeart(x, y) {
        var c = false;
        for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
            var a = poly[i], b = poly[j];
            if ((a.y > y) !== (b.y > y) && x < (b.x - a.x) * (y - a.y) / (b.y - a.y) + a.x) c = !c;
        }
        return c;
    }
    function sizeHeart() {
        hw = hStage.clientWidth; hh = hStage.clientHeight;
        hc.width = hw * DPR; hc.height = hh * DPR;
        hctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        hs = Math.min(hw / 34.5, hh / 30.5);
        var count = Math.round(Math.min(1500, Math.max(500, hw * hh / 230)));
        var palette = [[350, 90, 62], [338, 92, 70], [330, 85, 78], [44, 88, 70], [0, 0, 100]];
        parts = [];
        for (var i = 0; i < count; i++) {
            var edge = Math.random() < 0.62;
            var p;
            if (edge) { // even spacing along the outline, slightly scattered inward
                p = outlineAt(Math.random());
                var k = rand(0.9, 1.02);
                p = { x: p.x * k, y: p.y * k };
            } else {   // uniform fill of the interior
                do { p = { x: rand(-16, 16), y: rand(-17, 12) }; } while (!insideHeart(p.x / 0.9, p.y / 0.9));
            }
            var col = palette[edge ? (Math.random() < 0.85 ? (i % 3) : 3 + (i % 2)) : (i % 3)];
            parts.push({
                tx: p.x, ty: p.y,
                sx: rand(-20, 20), sy: rand(-18, 18),
                r: edge ? rand(0.8, 2.2) : rand(0.6, 1.5),
                a: edge ? rand(0.5, 0.95) : rand(0.12, 0.35),
                c: 'hsl(' + col[0] + ',' + col[1] + '%,' + col[2] + '%)',
                ph: rand(0, Math.PI * 2), d: rand(0, 0.6)
            });
        }
    }
    function beat(t) {
        var p = (t % 1.25) / 1.25;
        return Math.exp(-Math.pow(p / 0.07, 2)) + 0.6 * Math.exp(-Math.pow((p - 0.24) / 0.08, 2)) + Math.exp(-Math.pow((p - 1) / 0.07, 2));
    }
    var easeOut = function (x) { return 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3); };
    function heartFrame(now) {
        if (!heartOn || !heartVisible) return;
        var t = (now - heartStart) / 1000;
        var cx = hw / 2, cy = hh / 2 - 2.6 * hs;
        var pulse = 1 + (reduceMotion ? 0 : (0.035 + glowBoost * 0.03) * beat(t));
        glowBoost *= 0.985;
        hctx.clearRect(0, 0, hw, hh);

        var g = hctx.createRadialGradient(cx, cy, 0, cx, cy, 18 * hs);
        g.addColorStop(0, 'rgba(225,29,72,' + (0.22 + 0.1 * beat(t) + glowBoost * 0.2) + ')');
        g.addColorStop(1, 'rgba(225,29,72,0)');
        hctx.fillStyle = g; hctx.fillRect(0, 0, hw, hh);

        hctx.globalCompositeOperation = 'lighter';
        for (var i = 0; i < parts.length; i++) {
            var p = parts[i];
            var e = reduceMotion ? 1 : easeOut((t - p.d) / 1.6);
            var wob = reduceMotion ? 0 : Math.sin(t * 2 + p.ph) * 0.18;
            var x = p.sx + (p.tx - p.sx) * e + wob;
            var y = p.sy + (p.ty - p.sy) * e + Math.cos(t * 1.7 + p.ph) * 0.12;
            hctx.globalAlpha = p.a * Math.min(1, t * 1.5);
            hctx.fillStyle = p.c;
            hctx.beginPath();
            hctx.arc(cx + x * hs * pulse, cy - y * hs * pulse, p.r, 0, 6.283);
            hctx.fill();
        }
        hctx.globalCompositeOperation = 'source-over';
        hctx.globalAlpha = 1;
        requestAnimationFrame(heartFrame);
    }
    new IntersectionObserver(function (es) {
        heartVisible = es[0].isIntersecting;
        if (heartVisible && heartOn) requestAnimationFrame(heartFrame);
    }, { root: scroller }).observe(hStage);

    /* Typewriter: lay out every character up-front (invisible) so the
       text block never jumps, then reveal them one at a time. */
    var chars = [], caret = document.createElement('span');
    caret.className = 'caret';
    function buildLetter() {
        typed.innerHTML = '';
        chars = [];
        LETTER.forEach(function (line, li) {
            var ln = document.createElement('span');
            ln.className = 'ln' + (li === 0 ? ' ln--first' : '') + (li === LETTER.length - 1 ? ' ln--last' : '');
            line.split(' ').forEach(function (word, wi) {
                if (wi > 0) {
                    var sp = document.createElement('span');
                    sp.className = 'ch'; sp.textContent = ' ';
                    ln.appendChild(sp); chars.push({ el: sp, ch: ' ' });
                }
                var w = document.createElement('span');
                w.className = 'w';
                for (var i = 0; i < word.length; i++) {
                    var c = document.createElement('span');
                    c.className = 'ch'; c.textContent = word[i];
                    w.appendChild(c); chars.push({ el: c, ch: word[i] });
                }
                ln.appendChild(w);
            });
            chars.push({ el: null, ch: '\n', ln: ln });
            typed.appendChild(ln);
        });
    }
    var typeTimer = null, typeIdx = 0;
    function typeNext() {
        if (typeIdx >= chars.length) return finishTyping();
        var item = chars[typeIdx++];
        var delay = rand(45, 95);
        if (item.el) {
            item.el.classList.add('on');
            item.el.parentNode.insertBefore(caret, item.el.nextSibling);
            if (item.ch === ',' ) delay = 320;
        } else {
            delay = 560; // pause between lines
            var next = chars[typeIdx];
            if (next && next.el) next.el.parentNode.insertBefore(caret, next.el);
            glowBoost = 1;
        }
        typeTimer = setTimeout(typeNext, delay);
    }
    function finishTyping() {
        clearTimeout(typeTimer);
        chars.forEach(function (c) { if (c.el) c.el.classList.add('on'); });
        typed.lastChild.appendChild(caret);
        skipBtn.hidden = true;
        toWish.hidden = false;
        glowBoost = 2.5;
        var r = hStage.getBoundingClientRect();
        spawnHearts(r.left + r.width / 2, r.top + r.height * 0.55, 26);
    }
    openBtn.addEventListener('click', function () {
        openBtn.classList.add('gone');
        openBtn.setAttribute('aria-hidden', 'true');
        openBtn.tabIndex = -1;
        sizeHeart();
        buildLetter();
        heartOn = true; heartStart = performance.now();
        requestAnimationFrame(heartFrame);
        if (reduceMotion) { finishTyping(); return; }
        skipBtn.hidden = false;
        typeIdx = 0;
        typeTimer = setTimeout(typeNext, 1500);
    });
    skipBtn.addEventListener('click', finishTyping);

    /* ---------------------------------------------------------
       Floating hearts
       --------------------------------------------------------- */
    var fx = $('#fx');
    function spawnHearts(x, y, n) {
        if (reduceMotion) return;
        var cols = ['#fb7185', '#f43f5e', '#f9a8d4', '#f5c66b', '#fda4af'];
        for (var i = 0; i < n; i++) {
            if (fx.childElementCount > 90) break;
            var el = document.createElement('span');
            el.className = 'float-heart';
            var s = rand(14, 34);
            el.style.cssText = 'left:' + (x - s / 2 + rand(-20, 20)) + 'px;top:' + (y - s / 2) + 'px;--s:' + s + 'px;--c:' +
                cols[i % cols.length] + ';--dx:' + rand(-170, 170) + 'px;--dy:' + rand(-520, -180) + 'px;--r:' +
                rand(-40, 40) + 'deg;--t:' + rand(1.8, 3.2) + 's;animation-delay:' + rand(0, 0.35) + 's';
            el.innerHTML = '<svg viewBox="0 0 24 24"><path d="' + HEART_PATH + '"/></svg>';
            el.addEventListener('animationend', function () { this.remove(); });
            fx.appendChild(el);
        }
    }
    $('#sendLove').addEventListener('click', function (e) {
        var r = this.getBoundingClientRect();
        spawnHearts(r.left + r.width / 2, r.top, 22);
    });

    /* ---------------------------------------------------------
       Resize
       --------------------------------------------------------- */
    var rz;
    window.addEventListener('resize', function () {
        clearTimeout(rz);
        rz = setTimeout(function () {
            sizeSnow(); drawLights(); layoutRing(); applyRing();
            if (heartOn) sizeHeart();
        }, 150);
    });
})();
