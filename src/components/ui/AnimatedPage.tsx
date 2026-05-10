// src/components/ui/AnimatedPage.tsx
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
}

const variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
}

export default function AnimatedPage({ children, className }: Props) {
  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ── Stagger container + item helpers ─────────────────────────── */
export const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
}

export const fadeUpItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

/* ── Hover lift card ───────────────────────────────────────────── */
export function MotionCard({
  children,
  className,
  style,
}: {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <motion.div
      className={className}
      style={style}
      variants={fadeUpItem}
      whileHover={{ y: -4, boxShadow: '0 12px 36px rgba(64,106,255,0.18)' }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
    >
      {children}
    </motion.div>
  )
}
