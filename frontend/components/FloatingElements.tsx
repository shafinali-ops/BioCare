import React from 'react'

interface FloatingElementsProps {
    variant?: 'medical' | 'particles' | 'orbs'
}

export const FloatingElements: React.FC<FloatingElementsProps> = ({ variant = 'medical' }) => {
    if (variant === 'medical') {
        return (
            <div className="floating-elements-container">
                {/* Floating Medical Icons */}
                <div className="floating-icon floating-icon-1">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-teal-400/30">
                        <path d="M12 2L12 22M2 12L22 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                </div>

                <div className="floating-icon floating-icon-2">
                    <svg width="35" height="35" viewBox="0 0 24 24" fill="none" className="text-blue-400/30">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor" />
                    </svg>
                </div>

                <div className="floating-icon floating-icon-3">
                    <svg width="45" height="45" viewBox="0 0 24 24" fill="none" className="text-purple-400/30">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                        <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </div>

                <div className="floating-icon floating-icon-4">
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" className="text-pink-400/30">
                        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                        <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </div>
            </div>
        )
    }

    if (variant === 'particles') {
        return (
            <div className="particles-container">
                {Array.from({ length: 20 }).map((_, i) => (
                    <div
                        key={i}
                        className="particle"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${5 + Math.random() * 10}s`,
                        }}
                    />
                ))}
            </div>
        )
    }

    if (variant === 'orbs') {
        return (
            <div className="orbs-container">
                <div className="gradient-orb orb-1" />
                <div className="gradient-orb orb-2" />
                <div className="gradient-orb orb-3" />
            </div>
        )
    }

    return null
}
