'use client';
import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function NavigationLoader() {
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Whenever pathname or searchParams changes, we could potentially stop the loader
    // But since we want to enforce a minimum of 1.5s animation, we handle it in the click event.
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Find the closest anchor tag
      const target = (e.target as HTMLElement).closest('a');
      if (!target || !target.href) return;

      const currentUrl = new URL(window.location.href);
      const targetUrl = new URL(target.href);

      // Check if it's an internal link
      if (
        targetUrl.origin === currentUrl.origin &&
        targetUrl.pathname !== currentUrl.pathname &&
        target.target !== '_blank'
      ) {
        setIsNavigating(true);
        // Force the loading screen to show for 1.5s
        setTimeout(() => {
          setIsNavigating(false);
        }, 1500);
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  if (!isNavigating) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-[#F9F8F6] flex flex-col items-center justify-center transition-opacity duration-300">
      <div className="relative flex flex-col items-center gap-6">
        {/* Logo outline container */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          {/* Base logo (dimmed) */}
          <img src="/logo.png" alt="Loading" className="absolute inset-0 w-full h-full object-contain opacity-20 filter grayscale" />
          
          {/* Filling logo (animated clip path) */}
          <div 
            className="absolute inset-0 w-full h-full overflow-hidden"
            style={{
              animation: 'fillUp 1.5s ease-in-out forwards'
            }}
          >
            <img src="/logo.png" alt="Loading" className="absolute bottom-0 w-full h-20 object-contain drop-shadow-md" />
          </div>

          {/* Spinner ring */}
          <svg className="absolute -inset-4 w-28 h-28 animate-[spin_3s_linear_infinite]" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="none" stroke="#D4CCC9" strokeWidth="1" strokeDasharray="4 8" />
          </svg>
          <svg className="absolute -inset-2 w-24 h-24 animate-[spin_2s_linear_infinite_reverse]" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="none" stroke="#3B2D2A" strokeWidth="1.5" strokeDasharray="30 270" strokeLinecap="round" />
          </svg>
        </div>
        
        <div className="text-[11px] font-semibold text-[#3B2D2A]/60 tracking-[0.3em] uppercase animate-pulse">
          Loading
        </div>
      </div>

      <style jsx>{`
        @keyframes fillUp {
          0% { height: 0%; }
          100% { height: 100%; }
        }
      `}</style>
    </div>
  );
}
