"use client"
import { useEffect, useRef } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale';
  delay?: number;
  duration?: number;
  className?: string;
}

const getTransform = (direction: string) => {
  switch (direction) {
    case 'up':    return 'translateY(40px)';
    case 'down':  return 'translateY(-40px)';
    case 'left':  return 'translateX(40px)';
    case 'right': return 'translateX(-40px)';
    case 'scale': return 'scale(0.88)';
    default:      return 'translateY(40px)';
  }
};

export default function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 800,
  className = '',
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || hasAnimated.current) return;

    // Step 1: Set initial hidden state immediately
    el.style.opacity = '0';
    el.style.transform = getTransform(direction);
    el.style.willChange = 'opacity, transform';

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasAnimated.current) return;
        hasAnimated.current = true;
        observer.unobserve(el);

        // Step 2: After a frame, add transition and animate to visible
        // The double-rAF forces browser to commit the hidden state first,
        // so the CSS transition actually plays.
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            el.style.transition = [
              `opacity ${duration}ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
              `transform ${duration}ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
            ].join(', ');
            el.style.opacity = '1';
            el.style.transform = 'translateY(0) translateX(0) scale(1)';

            // Cleanup after animation finishes
            const totalMs = duration + delay + 50;
            setTimeout(() => {
              el.style.willChange = 'auto';
              el.style.transition = '';
            }, totalMs);
          });
        });
      },
      { threshold: 0.08 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
