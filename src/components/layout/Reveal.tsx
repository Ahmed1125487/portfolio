import React from 'react';
import { motion, useReducedMotion, type Transition } from 'framer-motion';

export type RevealDirection = 'up' | 'left' | 'right' | 'none';

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  direction?: RevealDirection;
  className?: string;
}

const directionOffsets: Record<RevealDirection, { x: number; y: number }> = {
  up: { x: 0, y: 40 },
  left: { x: -40, y: 0 },
  right: { x: 40, y: 0 },
  none: { x: 0, y: 0 },
};

export const Reveal: React.FC<RevealProps> = ({
  children,
  delay = 0,
  direction = 'up',
  className,
}) => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const offset = directionOffsets[direction];
  const transition: Transition = {
    duration: 0.7,
    ease: 'easeOut',
    delay,
  };

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: offset.x, y: offset.y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={transition}
    >
      {children}
    </motion.div>
  );
};

interface StaggerProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const Stagger: React.FC<StaggerProps> = ({ children, className, delay = 0.1 }) => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: delay,
            delayChildren: 0.05,
          },
        },
      }}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={React.isValidElement(child) ? child.key ?? `stagger-${index}` : `stagger-${index}`}
          variants={{
            hidden: { opacity: 0, y: 40 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.7,
                ease: 'easeOut',
                delay: index * delay,
              },
            },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};
