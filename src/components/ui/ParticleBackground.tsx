"use client";

import { useEffect, useRef } from 'react';

export function ParticleBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        const particles: Particle[] = [];
        // Adjust density to be visually impressive but not laggy
        const particleCount = Math.min(Math.floor((width * height) / 8000), 150);
        const connectionDistance = 160;

        let mouse = {
            x: width / 2,
            y: height / 2,
            radius: 200
        };

        class Particle {
            x: number;
            y: number;
            vx: number;
            vy: number;
            baseVx: number;
            baseVy: number;
            radius: number;

            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                // Anti-gravity base velocity: slight horizontal drift, strict upward float
                this.baseVx = (Math.random() - 0.5) * 0.5;
                this.baseVy = -(Math.random() * 1.2 + 0.5);
                this.vx = this.baseVx;
                this.vy = this.baseVy;
                this.radius = Math.random() * 2 + 1;
            }

            update() {
                // Wrap around edges to simulate infinite upward flow
                if (this.x < -10) this.x = width + 10;
                if (this.x > width + 10) this.x = -10;
                if (this.y < -10) {
                    this.y = height + 10;
                    this.x = Math.random() * width;
                }
                if (this.y > height + 10) this.y = -10; // In case pushed down past the bottom

                // Anti-gravity force field interaction (mouse repels particles away smoothly)
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < mouse.radius) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;

                    // Non-linear repel force
                    const force = (mouse.radius - distance) / mouse.radius;
                    // Apply outward push
                    this.vx -= forceDirectionX * force * 0.8;
                    this.vy -= forceDirectionY * force * 0.8;
                }

                // Apply spring friction to return to the natural antigravity flow
                this.vx += (this.baseVx - this.vx) * 0.05;
                this.vy += (this.baseVy - this.vy) * 0.05;

                this.x += this.vx;
                this.y += this.vy;
            }

            draw() {
                if (!ctx) return;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(14, 165, 233, 0.8)'; // text-sky-500
                ctx.shadowBlur = 15;
                ctx.shadowColor = '#0ea5e9'; // Sci-fi blue glow
                ctx.fill();
                ctx.closePath();
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        let animationId: number;

        const animate = () => {
            // IMPORTANT: Reset shadow BEFORE drawing the background rect
            ctx.shadowBlur = 0;

            // Give trailing effect (pure black)
            ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
            ctx.fillRect(0, 0, width, height);

            // Draw neural connections
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < connectionDistance) {
                        ctx.beginPath();
                        const opacity = 1 - (distance / connectionDistance);
                        // Draw lines between particles that glow purple/blue
                        ctx.strokeStyle = `rgba(14, 165, 233, ${opacity * 0.5})`;
                        ctx.lineWidth = 1;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                        ctx.closePath();
                    }
                }
            }

            // Draw particles on top
            for (const particle of particles) {
                particle.update();
                particle.draw();
            }

            animationId = requestAnimationFrame(animate);
        };

        animate();

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
            style={{ background: '#000000' }}
        />
    );
}
