import React from 'react';
import './AnimatedLoading.css';

const AnimatedLoading = () => {
  // Generate random positions and properties for stars
  const generateStars = () => {
    return [...Array(60)].map((_, i) => {
      const size = Math.random() * 4 + 2; // 2px to 6px
      const opacity = Math.random() * 0.7 + 0.3; // 0.3 to 1.0
      const delay = Math.random() * 15; // 0 to 15 seconds
      const duration = Math.random() * 20 + 25; // 25 to 45 seconds (much slower)
      
      return {
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size,
        opacity,
        delay,
        duration,
        type: i % 5, // Different star types for variety
      };
    });
  };

  const stars = generateStars();

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100vh',
      background: 'linear-gradient(180deg, #0c1445 0%, #1a1a2e 50%, #16213e 100%)',
      zIndex: 9999,
      overflow: 'hidden'
    }}>
      {/* Floating stars */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none'
      }}>
        {stars.map((star) => (
          <div
            key={star.id}
            style={{
              position: 'absolute',
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              color: 'white',
              fontSize: `${star.size}px`,
              opacity: star.opacity,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
              animationName: 'slowFloat',
              animationIterationCount: 'infinite',
              animationTimingFunction: 'ease-in-out',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              filter: 'drop-shadow(0 0 3px rgba(255, 255, 255, 0.3))',
            }}
          >
            {star.type === 0 && '★'}
            {star.type === 1 && '✦'}
            {star.type === 2 && '✧'}
            {star.type === 3 && '✩'}
            {star.type === 4 && '✪'}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnimatedLoading;
