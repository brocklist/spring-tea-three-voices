export const pageTransition = {
  duration: 0.28,
  ease: [0.22, 1, 0.36, 1] as const,
};

export const dialogSpring = {
  type: 'spring' as const,
  stiffness: 330,
  damping: 32,
  mass: 0.82,
};

export const tapSpring = {
  type: 'spring' as const,
  stiffness: 460,
  damping: 30,
};
