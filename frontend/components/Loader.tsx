'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useLoader } from '@/contexts/LoaderContext';

export default function Loader() {
    const pathname = usePathname();
    const { isLoading, setIsLoading } = useLoader();
    const [shouldRender, setShouldRender] = useState(true);
    const [isMounted, setIsMounted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [fadeIn, setFadeIn] = useState(false);

    // Only show loader on homepage
    const isHomePage = pathname === '/';

    // Handle client-side mounting and animation
    useEffect(() => {
        setIsMounted(true);

        // Skip loader if not on homepage
        if (!isHomePage) {
            setIsLoading(false);
            setShouldRender(false);
            return;
        }

        // Fade in effect
        setTimeout(() => setFadeIn(true), 50);

        // Progress counter from 0 to 100 over 3.3 seconds
        const totalDuration = 3300; // 3.3 seconds
        const intervalTime = 30; // Update every 30ms
        const increment = 100 / (totalDuration / intervalTime);

        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                const next = prev + increment;
                if (next >= 100) {
                    clearInterval(progressInterval);
                    return 100;
                }
                return next;
            });
        }, intervalTime);

        // Hide loader after 3.3 seconds
        const hideTimer = setTimeout(() => {
            setIsLoading(false);
        }, totalDuration);

        return () => {
            clearInterval(progressInterval);
            clearTimeout(hideTimer);
        };
    }, [setIsLoading, isHomePage]);

    // Handle unmounting after fade-out animation
    useEffect(() => {
        if (!isLoading && isMounted) {
            const timer = setTimeout(() => {
                setShouldRender(false);
            }, 800); // Match fade-out duration
            return () => clearTimeout(timer);
        }
    }, [isLoading, isMounted]);

    // Don't render if not on homepage, not mounted, or shouldn't render
    if (!isHomePage || !isMounted || !shouldRender) return null;

    return (
        <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950 transition-all duration-700 ease-in-out ${fadeIn && isLoading
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-95 pointer-events-none'
                }`}
        >
            <div className="relative flex flex-col items-center justify-center">
                {/* Logo / Icon Container */}
                <div
                    className={`mb-8 relative transition-all duration-1000 transform ${fadeIn && isLoading ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-4'
                        }`}
                >
                    <div className="w-28 h-28 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-primary-500/30">
                        <span className="text-6xl">🏥</span>
                    </div>

                    {/* Ripple Effect */}
                    <div className="absolute inset-0 bg-primary-500 rounded-3xl animate-ping opacity-10"></div>
                </div>

                {/* Text Content */}
                <div
                    className={`text-center mb-8 transition-all duration-1000 delay-200 transform ${fadeIn && isLoading ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                        }`}
                >
                    <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
                        BioCare
                    </h1>
                    <p className="text-primary-400 text-sm font-medium tracking-widest uppercase">
                        Healthcare System
                    </p>
                </div>

                {/* Progress Percentage */}
                <div
                    className={`text-center mb-6 transition-all duration-1000 delay-300 transform ${fadeIn && isLoading ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                        }`}
                >
                    <div className="text-6xl font-bold text-primary-400 mb-2 tabular-nums">
                        {Math.floor(progress)}%
                    </div>
                    <p className="text-slate-400 text-xs tracking-wider">LOADING</p>
                </div>

                {/* Progress Bar */}
                <div
                    className={`w-64 h-2 bg-slate-800 rounded-full overflow-hidden transition-all duration-1000 delay-400 ${fadeIn && isLoading ? 'opacity-100' : 'opacity-0'
                        }`}
                >
                    <div
                        className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-300 ease-out rounded-full"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
}
