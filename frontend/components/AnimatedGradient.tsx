import React from 'react'

interface AnimatedGradientProps {
    variant?: 'hero' | 'subtle' | 'vibrant'
    className?: string
}

export const AnimatedGradient: React.FC<AnimatedGradientProps> = ({
    variant = 'hero',
    className = '',
}) => {
    const variantClasses = {
        hero: 'animated-gradient-hero',
        subtle: 'animated-gradient-subtle',
        vibrant: 'animated-gradient-vibrant',
    }

    return (
        <div className={`animated-gradient-container ${variantClasses[variant]} ${className}`}>
            <div className="gradient-layer gradient-layer-1" />
            <div className="gradient-layer gradient-layer-2" />
            <div className="gradient-layer gradient-layer-3" />
        </div>
    )
}
