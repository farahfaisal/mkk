import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface AnimatedLogoProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export function AnimatedLogo({ src, alt, width = 200, height = 150, className = '' }: AnimatedLogoProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Start animation after component mounts
    setIsAnimating(true);
    
    // Set up interval for continuous animation
    const interval = setInterval(() => {
      setIsAnimating(true);
      
      // Reset animation state after animation completes
      setTimeout(() => {
        setIsAnimating(false);
      }, 1000); // Animation duration
    }, 5000); // Repeat every 5 seconds
    
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      animate={isAnimating ? { scale: [1, 1.1, 1] } : {}}
      transition={{ duration: 1, ease: "easeInOut" }}
      className={className}
      style={{ width, height }}
    >
      <img 
        src={src} 
        alt={alt}
        className="w-full h-full object-contain"
      />
    </motion.div>
  );
}