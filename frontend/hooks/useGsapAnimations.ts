import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

/**
 * Custom hook for GSAP animations
 * Provides reusable animation utilities for text, scroll, and viewport animations
 * Enhanced with scroll-based pinning, scrubbing, and advanced text reveals
 */
export const useGsapAnimations = () => {
  /**
   * Advanced letter-by-letter reveal with scroll trigger
   * Each letter animates independently for a sophisticated effect
   */
  const animateLetterReveal = (
    element: HTMLElement | null,
    options?: {
      duration?: number
      stagger?: number
      delay?: number
      scrollTrigger?: boolean
      start?: string
      scrub?: boolean
    }
  ) => {
    if (!element) return null

    const {
      duration = 0.05,
      stagger = 0.02,
      delay = 0,
      scrollTrigger = false,
      start = 'top 80%',
      scrub = false
    } = options || {}

    // Split text into words first to preserve line breaking
    const text = element.textContent || ''
    const words = text.split(' ')

    element.innerHTML = words
      .map((word) => {
        const chars = word
          .split('')
          .map(
            (char) =>
              `<span class="char" style="display:inline-block;opacity:0;transform:translateY(20px) rotateX(-90deg);transform-origin:bottom;">${char}</span>`
          )
          .join('')
        return `<span class="word-wrapper" style="display:inline-block;white-space:nowrap;">${chars}</span>`
      })
      .join('&nbsp;') // Use non-breaking space or just space with styles

    const chars = element.querySelectorAll('.char')

    const animation = gsap.fromTo(
      chars,
      {
        opacity: 0,
        y: 20,
        rotateX: -90,
      },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration,
        stagger,
        delay,
        ease: 'power3.out',
        scrollTrigger: scrollTrigger ? {
          trigger: element,
          start,
          end: 'top 20%',
          scrub,
          toggleActions: 'play none none reverse',
        } : undefined,
      }
    )

    return animation
  }
  /**
   * Animate text with character-by-character reveal
   */
  const animateTextReveal = (
    element: HTMLElement | null,
    options?: {
      duration?: number
      stagger?: number
      delay?: number
    }
  ) => {
    if (!element) return

    const { duration = 0.05, stagger = 0.03, delay = 0 } = options || {}

    // Split text into characters
    const text = element.textContent || ''
    element.innerHTML = text
      .split('')
      .map((char) => `<span class="char" style="display:inline-block;opacity:0">${char === ' ' ? '&nbsp;' : char}</span>`)
      .join('')

    const chars = element.querySelectorAll('.char')

    gsap.fromTo(
      chars,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration,
        stagger,
        delay,
        ease: 'power2.out',
      }
    )
  }

  /**
   * Animate text with word-by-word reveal
   */
  const animateWordReveal = (
    element: HTMLElement | null,
    options?: {
      duration?: number
      stagger?: number
      delay?: number
    }
  ) => {
    if (!element) return

    const { duration = 0.4, stagger = 0.08, delay = 0 } = options || {}

    // Split text into words
    const text = element.textContent || ''
    element.innerHTML = text
      .split(' ')
      .map((word) => `<span class="word" style="display:inline-block;opacity:0">${word}&nbsp;</span>`)
      .join('')

    const words = element.querySelectorAll('.word')

    gsap.fromTo(
      words,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration,
        stagger,
        delay,
        ease: 'power3.out',
      }
    )
  }

  /**
   * Fade in animation with viewport detection
   */
  const animateFadeIn = (
    element: HTMLElement | null,
    options?: {
      duration?: number
      delay?: number
      y?: number
      x?: number
    }
  ) => {
    if (!element) return

    const { duration = 0.8, delay = 0, y = 40, x = 0 } = options || {}

    gsap.fromTo(
      element,
      { opacity: 0, y, x },
      {
        opacity: 1,
        y: 0,
        x: 0,
        duration,
        delay,
        ease: 'power2.out',
      }
    )
  }

  /**
   * Scroll-triggered animation
   */
  const animateOnScroll = (
    element: HTMLElement | null,
    options?: {
      duration?: number
      y?: number
      x?: number
      scale?: number
      rotation?: number
      scrub?: boolean
      start?: string
      end?: string
    }
  ) => {
    if (!element || typeof window === 'undefined') return

    const {
      duration = 1,
      y = 50,
      x = 0,
      scale = 1,
      rotation = 0,
      scrub = false,
      start = 'top 80%',
      end = 'top 20%',
    } = options || {}

    gsap.fromTo(
      element,
      { opacity: 0, y, x, scale: scale === 1 ? 1 : 0.8, rotation: 0 },
      {
        opacity: 1,
        y: 0,
        x: 0,
        scale,
        rotation,
        duration,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: element,
          start,
          end,
          scrub,
          toggleActions: 'play none none reverse',
        },
      }
    )
  }

  /**
   * Stagger animation for multiple elements
   */
  const animateStagger = (
    elements: NodeListOf<Element> | Element[] | null,
    options?: {
      duration?: number
      stagger?: number
      delay?: number
      y?: number
      x?: number
    }
  ) => {
    if (!elements || elements.length === 0) return

    const { duration = 0.6, stagger = 0.1, delay = 0, y = 30, x = 0 } = options || {}

    gsap.fromTo(
      elements,
      { opacity: 0, y, x },
      {
        opacity: 1,
        y: 0,
        x: 0,
        duration,
        stagger,
        delay,
        ease: 'power2.out',
      }
    )
  }

  /**
   * Counter animation (for stats)
   */
  const animateCounter = (
    element: HTMLElement | null,
    options?: {
      start?: number
      end: number
      duration?: number
      suffix?: string
      prefix?: string
    }
  ) => {
    if (!element || typeof window === 'undefined') return

    const { start = 0, end, duration = 2, suffix = '', prefix = '' } = options || {}

    const obj = { value: start }

    gsap.to(obj, {
      value: end,
      duration,
      ease: 'power1.out',
      onUpdate: () => {
        element.textContent = prefix + Math.round(obj.value) + suffix
      },
      scrollTrigger: {
        trigger: element,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    })
  }

  /**
   * Scale animation
   */
  const animateScale = (
    element: HTMLElement | null,
    options?: {
      duration?: number
      delay?: number
      from?: number
      to?: number
    }
  ) => {
    if (!element) return

    const { duration = 0.6, delay = 0, from = 0.8, to = 1 } = options || {}

    gsap.fromTo(
      element,
      { scale: from, opacity: 0 },
      {
        scale: to,
        opacity: 1,
        duration,
        delay,
        ease: 'back.out(1.7)',
      }
    )
  }

  /**
   * Floating animation (continuous)
   */
  const animateFloat = (
    element: HTMLElement | null,
    options?: {
      duration?: number
      y?: number
      rotation?: number
    }
  ) => {
    if (!element) return

    const { duration = 3, y = 20, rotation = 5 } = options || {}

    gsap.to(element, {
      y,
      rotation,
      duration,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    })
  }

  /**
   * Parallax effect on scroll
   */
  const animateParallax = (
    element: HTMLElement | null,
    options?: {
      speed?: number
      start?: string
      end?: string
    }
  ) => {
    if (!element || typeof window === 'undefined') return

    const { speed = 0.5, start = 'top bottom', end = 'bottom top' } = options || {}

    gsap.to(element, {
      y: () => window.innerHeight * speed,
      ease: 'none',
      scrollTrigger: {
        trigger: element,
        start,
        end,
        scrub: true,
      },
    })
  }

  /**
   * Pin element during scroll (sticky effect)
   * Creates a sticky section that pins while content scrolls
   */
  const animatePin = (
    element: HTMLElement | null,
    options?: {
      start?: string
      end?: string
      pinSpacing?: boolean
      markers?: boolean
    }
  ) => {
    if (!element || typeof window === 'undefined') return null

    const {
      start = 'top top',
      end = '+=100%',
      pinSpacing = true,
      markers = false
    } = options || {}

    const scrollTrigger = ScrollTrigger.create({
      trigger: element,
      start,
      end,
      pin: true,
      pinSpacing,
      markers,
      anticipatePin: 1,
    })

    return scrollTrigger
  }

  /**
   * Scrub animation (animation progress follows scroll position)
   * Perfect for smooth scroll-linked animations
   */
  const animateScrub = (
    element: HTMLElement | null,
    options?: {
      from?: gsap.TweenVars
      to: gsap.TweenVars
      start?: string
      end?: string
      scrub?: boolean | number
      markers?: boolean
    }
  ) => {
    if (!element || typeof window === 'undefined') return null

    const {
      from = {},
      to,
      start = 'top bottom',
      end = 'bottom top',
      scrub = 1,
      markers = false,
    } = options || {}

    const animation = gsap.fromTo(
      element,
      from,
      {
        ...to,
        ease: 'none',
        scrollTrigger: {
          trigger: element,
          start,
          end,
          scrub,
          markers,
        },
      }
    )

    return animation
  }

  /**
   * Enhanced word reveal with scroll trigger
   * Smooth word-by-word animation on scroll
   */
  const animateWordRevealOnScroll = (
    element: HTMLElement | null,
    options?: {
      duration?: number
      stagger?: number
      start?: string
      scrub?: boolean
      y?: number
    }
  ) => {
    if (!element) return null

    const {
      duration = 0.6,
      stagger = 0.1,
      start = 'top 80%',
      scrub = false,
      y = 50
    } = options || {}

    // Split text into words
    const text = element.textContent || ''
    element.innerHTML = text
      .split(' ')
      .map((word) => `<span class="word" style="display:inline-block;opacity:0;transform:translateY(${y}px);">${word}&nbsp;</span>`)
      .join('')

    const words = element.querySelectorAll('.word')

    const animation = gsap.fromTo(
      words,
      { opacity: 0, y },
      {
        opacity: 1,
        y: 0,
        duration,
        stagger,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: element,
          start,
          end: 'top 20%',
          scrub,
          toggleActions: 'play none none reverse',
        },
      }
    )

    return animation
  }

  /**
   * Fade and slide reveal on scroll with enhanced easing
   */
  const animateFadeSlideOnScroll = (
    element: HTMLElement | null,
    options?: {
      duration?: number
      y?: number
      x?: number
      rotation?: number
      scale?: number
      start?: string
      end?: string
      scrub?: boolean | number
      stagger?: number
    }
  ) => {
    if (!element || typeof window === 'undefined') return null

    const {
      duration = 1,
      y = 80,
      x = 0,
      rotation = 0,
      scale = 0.9,
      start = 'top 85%',
      end = 'top 20%',
      scrub = false,
      stagger,
    } = options || {}

    const animation = gsap.fromTo(
      element,
      {
        opacity: 0,
        y,
        x,
        rotation,
        scale
      },
      {
        opacity: 1,
        y: 0,
        x: 0,
        rotation: 0,
        scale: 1,
        duration,
        ease: 'power3.out',
        stagger,
        scrollTrigger: {
          trigger: element,
          start,
          end,
          scrub,
          toggleActions: 'play none none reverse',
        },
      }
    )

    return animation
  }

  /**
   * Timeline with scroll scrub
   * Create complex sequences that follow scroll position
   */
  const createScrollTimeline = (
    trigger: HTMLElement | null,
    animations: Array<{
      target: HTMLElement | string
      from?: gsap.TweenVars
      to: gsap.TweenVars
      position?: string
    }>,
    options?: {
      start?: string
      end?: string
      scrub?: boolean | number
      pin?: boolean
      markers?: boolean
    }
  ) => {
    if (!trigger || typeof window === 'undefined') return null

    const {
      start = 'top top',
      end = 'bottom top',
      scrub = 1,
      pin = false,
      markers = false,
    } = options || {}

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger,
        start,
        end,
        scrub,
        pin,
        markers,
      },
    })

    animations.forEach((anim) => {
      if (anim.from) {
        tl.fromTo(anim.target, anim.from, anim.to, anim.position || '>')
      } else {
        tl.to(anim.target, anim.to, anim.position || '>')
      }
    })

    return tl
  }

  return {
    animateLetterReveal,
    animateTextReveal,
    animateWordReveal,
    animateWordRevealOnScroll,
    animateFadeIn,
    animateOnScroll,
    animateFadeSlideOnScroll,
    animateStagger,
    animateCounter,
    animateScale,
    animateFloat,
    animateParallax,
    animatePin,
    animateScrub,
    createScrollTimeline,
  }
}

/**
 * Hook to run animations on component mount
 */
export const useGsapOnMount = (callback: () => void, deps: any[] = []) => {
  const hasRun = useRef(false)

  useEffect(() => {
    if (!hasRun.current) {
      hasRun.current = true
      callback()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
