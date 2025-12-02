 // Sound settings
        let soundEnabled = true;
        const audioContext = new(window.AudioContext || window.webkitAudioContext)();

        function playTick() {
            if (!soundEnabled) return;
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.connect(gain);
            gain.connect(audioContext.destination);
            osc.frequency.value = 800;
            gain.gain.value = 0.1;
            osc.start();
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
            osc.stop(audioContext.currentTime + 0.05);
        }

        function playCelebration() {
            if (!soundEnabled) return;
            const notes = [523.25, 659.25, 783.99, 1046.50];
            notes.forEach((freq, i) => {
                setTimeout(() => {
                    const osc = audioContext.createOscillator();
                    const gain = audioContext.createGain();
                    osc.connect(gain);
                    gain.connect(audioContext.destination);
                    osc.frequency.value = freq;
                    gain.gain.value = 0.2;
                    osc.start();
                    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                    osc.stop(audioContext.currentTime + 0.3);
                }, i * 100);
            });
        }

        // Create stars
        function createStars() {
            const container = document.getElementById('stars');
            for (let i = 0; i < 100; i++) {
                const star = document.createElement('div');
                star.className = 'star';
                star.style.left = Math.random() * 100 + '%';
                star.style.top = Math.random() * 100 + '%';
                star.style.animationDelay = Math.random() * 3 + 's';
                container.appendChild(star);
            }
        }
        createStars();

        // Theme controls
        const body = document.body;
        const themeToggle = document.getElementById('themeToggle');
        const soundToggle = document.getElementById('soundToggle');
        const themeBtns = document.querySelectorAll('.theme-btn');

        // Load saved settings
        const savedTheme = localStorage.getItem('theme') || 'blue';
        const savedMode = localStorage.getItem('mode') || 'dark';
        const savedSound = localStorage.getItem('sound') !== 'false';

        body.dataset.theme = savedTheme;
        if (savedMode === 'light') body.style.filter = 'invert(1) hue-rotate(180deg)';
        soundEnabled = savedSound;
        soundToggle.textContent = soundEnabled ? '🔊' : '🔇';

        themeBtns.forEach(btn => {
            if (btn.dataset.theme === savedTheme) btn.classList.add('active');
        });

        themeToggle.addEventListener('click', () => {
            const isLight = body.style.filter.includes('invert');
            body.style.filter = isLight ? '' : 'invert(1) hue-rotate(180deg)';
            localStorage.setItem('mode', isLight ? 'dark' : 'light');
        });

        soundToggle.addEventListener('click', () => {
            soundEnabled = !soundEnabled;
            soundToggle.textContent = soundEnabled ? '🔊' : '🔇';
            localStorage.setItem('sound', soundEnabled);
        });

        themeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                themeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                body.dataset.theme = btn.dataset.theme;
                localStorage.setItem('theme', btn.dataset.theme);
            });
        });

        const pad = n => String(n).padStart(2, '0');

        function parseCustomTarget() {
            const params = new URLSearchParams(location.search);
            if (!params.has('target')) return null;
            const t = params.get('target');
            const d = new Date(t);
            return isNaN(d.getTime()) ? null : d;
        }

        function getNextNewYear(now = new Date()) {
            const year = now.getFullYear();
            const jan1 = new Date(year + 1, 0, 1, 0, 0, 0);
            return now < jan1 ? jan1 : new Date(year + 2, 0, 1, 0, 0, 0);
        }

        function breakdown(ms) {
            const sec = Math.max(0, Math.floor(ms / 1000));
            const days = Math.floor(sec / 86400);
            const hours = Math.floor((sec % 86400) / 3600);
            const minutes = Math.floor((sec % 3600) / 60);
            const seconds = sec % 60;
            return {
                days,
                hours,
                minutes,
                seconds
            };
        }

        function setProgress({
            days,
            hours,
            minutes,
            seconds
        }, target) {
            const now = new Date();
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const endOfDay = new Date(startOfDay.getTime() + 86400000);
            const daySpan = endOfDay - startOfDay;
            const dayElapsed = now - startOfDay;
            const dayPct = (dayElapsed / daySpan) * 100;

            const hourPct = (now.getMinutes() * 60 + now.getSeconds()) / 3600 * 100;
            const minPct = (now.getSeconds()) / 60 * 100;
            const total = target - now;
            const yearStart = new Date(target.getFullYear() - 1, 0, 1);
            const yearSpan = target - yearStart;
            const yearPct = 100 - (total / yearSpan) * 100;

            document.getElementById('fill-days').style.width = yearPct.toFixed(2) + '%';
            document.getElementById('fill-hours').style.width = dayPct.toFixed(2) + '%';
            document.getElementById('fill-minutes').style.width = hourPct.toFixed(2) + '%';
            document.getElementById('fill-seconds').style.width = minPct.toFixed(2) + '%';
        }

        // Fireworks
        const fx = (() => {
            const canvas = document.getElementById('fx');
            const ctx = canvas.getContext('2d');
            let w, h, raf;
            let particles = [];

            function resize() {
                w = canvas.width = innerWidth;
                h = canvas.height = innerHeight;
            }
            addEventListener('resize', resize, {
                passive: true
            });
            resize();

            function spawn(x, y, color) {
                for (let i = 0; i < 100; i++) {
                    const a = Math.random() * Math.PI * 2;
                    const s = Math.random() * 7 + 2;
                    particles.push({
                        x,
                        y,
                        vx: Math.cos(a) * s,
                        vy: Math.sin(a) * s,
                        life: 140 + Math.random() * 60,
                        color
                    });
                }
            }

            function loop() {
                ctx.fillStyle = 'rgba(10, 14, 26, 0.1)';
                ctx.fillRect(0, 0, w, h);

                for (let i = particles.length - 1; i >= 0; i--) {
                    const p = particles[i];
                    p.x += p.vx;
                    p.y += p.vy;
                    p.vy += 0.08;
                    p.vx *= 0.99;
                    p.life -= 1;

                    ctx.globalAlpha = Math.max(0, p.life / 180);
                    ctx.fillStyle = p.color;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
                    ctx.fill();

                    if (p.life <= 0) particles.splice(i, 1);
                }
                raf = requestAnimationFrame(loop);
            }

            function boom() {
                const colors = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#06b6d4"];
                for (let i = 0; i < 4; i++) {
                    const cx = Math.random() * w;
                    const cy = Math.random() * h * 0.6;
                    spawn(cx, cy, colors[Math.floor(Math.random() * colors.length)]);
                }
            }

            loop();
            return {
                boom
            };
        })();

        (function() {
            // Load saved custom date
            const savedDate = localStorage.getItem('customDate');
            const custom = savedDate ? new Date(savedDate) : parseCustomTarget();
            let target = custom || new Date("2026-01-01T00:00:00");

            const fmt = new Intl.DateTimeFormat(undefined, {
                dateStyle: 'full',
                timeStyle: 'long'
            });

            document.getElementById('tz').textContent =
                `Your time zone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`;
            document.getElementById('target-text').textContent = fmt.format(target);

            const ids = ['days', 'hours', 'minutes', 'seconds'];
            const el = Object.fromEntries(ids.map(id => [id, document.getElementById(id)]));

            let lastSecond = -1;

            function render() {
                const now = new Date();
                if (now >= target) {
                    fx.boom();
                    playCelebration();
                    document.getElementById('celebration').classList.remove('hidden');

                    setTimeout(() => {
                        document.getElementById('celebration').classList.add('hidden');

                        if (custom) {
                            target = new Date(
                                target.getFullYear() + 1,
                                target.getMonth(),
                                target.getDate(),
                                target.getHours(),
                                target.getMinutes(),
                                target.getSeconds()
                            );
                        } else {
                            target = getNextNewYear(now);
                        }

                        document.getElementById('target-text').textContent = fmt.format(target);
                        localStorage.setItem('customDate', target.toISOString());
                    }, 10000);
                }

                const diff = target - now;
                const t = breakdown(diff);

                // Play tick sound on second change
                if (t.seconds !== lastSecond) {
                    playTick();
                    lastSecond = t.seconds;
                }

                el.days.textContent = String(t.days);
                el.hours.textContent = pad(t.hours);
                el.minutes.textContent = pad(t.minutes);
                el.seconds.textContent = pad(t.seconds);
                setProgress(t, target);
            }

            render();
            setInterval(render, 1000);

            document.getElementById('setBtn').addEventListener('click', () => {
                const input = document.getElementById('customDate').value;
                if (input) {
                    const d = new Date(input);
                    if (!isNaN(d.getTime())) {
                        target = d;
                        localStorage.setItem('customDate', d.toISOString());
                        document.getElementById('target-text').textContent = fmt.format(target);
                        render();
                    } else {
                        alert("Invalid date format!");
                    }
                } else {
                    alert("Please pick a date and time.");
                }
            });
        })();