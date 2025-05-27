'use client';

import React, {useRef, useEffect} from 'react';

const ParticleBackground = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const particleCount = 65;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('span');
            particle.textContent = '$';
            particle.classList.add('particle');

            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const size = Math.random() * 2 + 1;
            const animationDuration = Math.random() * 10 + 5;

            particle.style.left = `${x}vw`;
            particle.style.top = `${y}vh`;
            particle.style.fontSize = `${size}rem`;
            particle.style.animationDuration = `${animationDuration}s`;

            container.appendChild(particle);
        }

        return () => {
            // Cleanup: Remove all particles when the component unmounts
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
        };
    }, []);

    return <div className="particle-container" ref={containerRef}></div>;
};

export default ParticleBackground;