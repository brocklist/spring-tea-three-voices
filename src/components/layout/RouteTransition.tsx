import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';
import { pageTransition } from '../../lib/motion';

export function RouteTransition({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className="route-transition"
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -5 }}
      transition={reducedMotion ? { duration: 0.12 } : pageTransition}
    >
      {children}
    </motion.div>
  );
}
