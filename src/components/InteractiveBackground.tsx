'use client';

import { useEffect, useRef } from 'react';

interface Point {
    x: number;
    y: number;
    isPlane: boolean;
}

const PLANE_POINTS = [
    // Fuselage
    { x: 0, y: -40 }, { x: 0, y: -30 }, { x: 0, y: -20 }, { x: 0, y: -10 },
    { x: 0, y: 0 }, { x: 0, y: 10 }, { x: 0, y: 20 }, { x: 0, y: 30 }, { x: 0, y: 40 },
    // Wings
    { x: -10, y: 0 }, { x: -20, y: 5 }, { x: -30, y: 10 }, { x: -40, y: 15 },
    { x: 10, y: 0 }, { x: 20, y: 5 }, { x: 30, y: 10 }, { x: 40, y: 15 },
    // Tail
    { x: -10, y: 35 }, { x: -20, y: 40 },
    { x: 10, y: 35 }, { x: 20, y: 40 },
];

export default function InteractiveBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // A full-screen canvas repainting every frame is a bad trade on mobile
        // for a purely decorative background: it costs real battery and jank and
        // adds zero function. So we skip it entirely on touch/small screens and
        // when the viewer asked for reduced motion. Desktop gets the full effect.
        const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
        const isMobile = coarsePointer || window.innerWidth < 768;
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (isMobile || reduceMotion) return;

        const NUM_DOTS = 100;
        const interactive = true;

        // Build dots: first PLANE_POINTS are the plane, rest scattered.
        const dots: Point[] = [];
        for (let i = 0; i < NUM_DOTS; i++) {
            const isPlane = i < PLANE_POINTS.length;
            dots.push({
                x: isPlane ? PLANE_POINTS[i].x : (Math.random() - 0.5) * window.innerWidth,
                y: isPlane ? PLANE_POINTS[i].y : (Math.random() - 0.5) * window.innerHeight,
                isPlane,
            });
        }

        let width = 0;
        let height = 0;
        let dpr = 1;

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            // Cap DPR at 2 so retina phones don't render a 3x buffer.
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.floor(width * dpr);
            canvas.height = Math.floor(height * dpr);
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resize();

        let mouseX = width / 2;
        let mouseY = height / 2;
        const handleMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        };
        if (interactive) window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('resize', resize);

        let rafId = 0;
        const draw = (t: number) => {
            ctx.clearRect(0, 0, width, height);

            const centerX = width / 2;
            const centerY = height / 2;
            const time = t / 2000;
            const breathe = Math.sin(time) * 0.5 + 1;

            for (let i = 0; i < dots.length; i++) {
                const dot = dots[i];

                const angle = time * 0.5 + i * 0.05;
                const swirlX = Math.cos(angle) * 50 * breathe;
                const swirlY = Math.sin(angle) * 50 * breathe;

                let finalX = centerX + dot.x * 5 * breathe + swirlX;
                let finalY = centerY + dot.y * 5 * breathe + swirlY;

                const floatTime = t / 1000;
                finalX += Math.sin(floatTime + i) * 20;
                finalY += Math.cos(floatTime + i) * 20;

                let active = false;
                if (interactive) {
                    const dx = mouseX - finalX;
                    const dy = mouseY - finalY;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const maxDist = 400;
                    const force = Math.max(0, (maxDist - dist) / maxDist);
                    finalX += dx * force * -3;
                    finalY += dy * force * -3;
                    active = force > 0.5;
                }

                const size = active ? 4 : 3;
                ctx.beginPath();
                ctx.arc(finalX, finalY, size / 2, 0, Math.PI * 2);
                if (active) {
                    ctx.fillStyle = '#3b82f6';
                    ctx.globalAlpha = 1;
                    ctx.shadowColor = '#3b82f6';
                    ctx.shadowBlur = 10;
                } else {
                    ctx.fillStyle = dot.isPlane ? '#60a5fa' : '#94a3b8';
                    ctx.globalAlpha = 0.6;
                    ctx.shadowBlur = 0;
                }
                ctx.fill();
            }
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;

            if (!reduceMotion) rafId = requestAnimationFrame(draw);
        };

        // Reduced motion: draw a single static frame, no loop.
        rafId = requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(rafId);
            if (interactive) window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
            aria-hidden="true"
        />
    );
}
