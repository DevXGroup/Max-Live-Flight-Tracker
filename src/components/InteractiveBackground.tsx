'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useAnimationFrame } from 'framer-motion';

interface Point {
    x: number;
    y: number;
    originX: number;
    originY: number;
    color: string;
}

const NUM_DOTS = 100;
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
    const containerRef = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const smoothX = useSpring(mouseX, { stiffness: 50, damping: 20 });
    const smoothY = useSpring(mouseY, { stiffness: 50, damping: 20 });

    const [dotsList, setDotsList] = useState<Point[]>([]);
    const [isMounted, setIsMounted] = useState(false);

    // Initialize dots
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsMounted(true);
        const newDots: Point[] = [];
        // Initialize mouse to center to avoid initial jump
        mouseX.set(window.innerWidth / 2);
        mouseY.set(window.innerHeight / 2);

        for (let i = 0; i < NUM_DOTS; i++) {
            // Some dots form a plane, others are scattered
            const isPlanePart = i < PLANE_POINTS.length;
            const planePoint = PLANE_POINTS[i];

            newDots.push({
                x: isPlanePart ? planePoint.x : (Math.random() - 0.5) * window.innerWidth,
                y: isPlanePart ? planePoint.y : (Math.random() - 0.5) * window.innerHeight,
                originX: (Math.random() - 0.5) * window.innerWidth,
                originY: (Math.random() - 0.5) * window.innerHeight,
                color: isPlanePart ? '#3b82f6' : '#64748b', // Blue for plane, slate for others
            });
        }
        setDotsList(newDots);
    }, []);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [mouseX, mouseY]);

    if (!isMounted) return null;

    return (
        <div ref={containerRef} className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {dotsList.map((dot, i) => (
                <Dot
                    key={i}
                    dot={dot}
                    mouseX={smoothX}
                    mouseY={smoothY}
                    index={i}
                />
            ))}
        </div>
    );
}

import { MotionValue } from 'framer-motion';

function Dot({ dot, mouseX, mouseY, index }: { dot: Point, mouseX: MotionValue<number>, mouseY: MotionValue<number>, index: number }) {
    const ref = useRef<HTMLDivElement>(null);

    useAnimationFrame((t) => {
        if (!ref.current) return;

        const currentMouseX = mouseX.get();
        const currentMouseY = mouseY.get();

        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        // Converge/Diverge Breathing Pattern
        const time = t / 2000; // Slow breathing
        const breathe = Math.sin(time) * 0.5 + 1; // Oscillates between 0.5 and 1.5

        // Swirl effect
        const angle = time * 0.5 + (index * 0.05);
        const swirlX = Math.cos(angle) * 50 * breathe;
        const swirlY = Math.sin(angle) * 50 * breathe;

        // Base position with breathing
        const targetX = centerX + (dot.x * 5 * breathe) + swirlX;
        const targetY = centerY + (dot.y * 5 * breathe) + swirlY;

        // Add some individual floating movement
        const floatTime = t / 1000;
        const floatX = Math.sin(floatTime + index) * 20;
        const floatY = Math.cos(floatTime + index) * 20;

        const finalX = targetX + floatX;
        const finalY = targetY + floatY;

        const dx = currentMouseX - finalX;
        const dy = currentMouseY - finalY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Interaction radius
        const maxDist = 400;
        const force = Math.max(0, (maxDist - dist) / maxDist);

        // Repulsion
        const repulsionX = dx * force * -3;
        const repulsionY = dy * force * -3;

        ref.current.style.transform = `translate(${finalX + repulsionX}px, ${finalY + repulsionY}px)`;

        // Change color based on proximity
        // Make dots more visible generally
        const isActive = force > 0.5;
        ref.current.style.backgroundColor = isActive ? '#3b82f6' : (dot.color === '#3b82f6' ? '#60a5fa' : '#94a3b8');
        ref.current.style.opacity = isActive ? '1' : '0.6';
        ref.current.style.width = isActive ? '4px' : '3px';
        ref.current.style.height = isActive ? '4px' : '3px';
        ref.current.style.boxShadow = isActive ? '0 0 10px #3b82f6' : 'none';
    });

    return (
        <div
            ref={ref}
            className="absolute rounded-full transition-colors duration-300"
            style={{
                backgroundColor: dot.color,
                left: 0,
                top: 0,
                willChange: 'transform',
            }}
        />
    );
}
