import React, { ReactNode, useRef, useState, forwardRef } from 'react'

interface GlassCardProps {
    children: ReactNode
    className?: string
    hover3D?: boolean
    intensity?: 'light' | 'medium' | 'strong'
    glow?: boolean
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(({
    children,
    className = '',
    hover3D = false,
    intensity = 'medium',
    glow = false,
}, ref) => {
    const internalRef = useRef<HTMLDivElement | null>(null)
    const [transform, setTransform] = useState('')

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!hover3D || !internalRef.current) return

        const card = internalRef.current
        const rect = card.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const centerX = rect.width / 2
        const centerY = rect.height / 2
        const rotateX = (y - centerY) / 10
        const rotateY = (centerX - x) / 10

        setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`)
    }

    const handleMouseLeave = () => {
        if (hover3D) {
            setTransform('')
        }
    }

    const intensityClasses = {
        light: 'glass-card-light',
        medium: 'glass-card-medium',
        strong: 'glass-card-strong',
    }

    // Merge refs
    const setRefs = (element: HTMLDivElement) => {
        internalRef.current = element

        if (typeof ref === 'function') {
            ref(element)
        } else if (ref) {
            (ref as React.MutableRefObject<HTMLDivElement | null>).current = element
        }
    }

    return (
        <div
            ref={setRefs}
            className={`glass-card ${intensityClasses[intensity]} ${glow ? 'glass-card-glow' : ''} ${className}`}
            style={{ transform, transition: 'transform 0.1s ease-out' }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {children}
        </div>
    )
})

GlassCard.displayName = 'GlassCard'
