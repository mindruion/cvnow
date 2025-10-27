// Mobile responsive utility to override inline styles
export const makeMobileResponsive = () => {
  // Check if we're on mobile
  const isMobile = window.innerWidth <= 767;
  const isExtraSmallMobile = window.innerWidth <= 480;
  
  if (!isMobile) return;
  
  // Find all elements with inline grid styles
  const elementsWithGridStyles = document.querySelectorAll('[style*="grid-template-columns"]');
  
  elementsWithGridStyles.forEach(element => {
    const style = element.getAttribute('style');
    
    // Check if it's a multi-column grid
    if (style && style.includes('repeat(auto-fit, minmax(220px, 1fr))')) {
      // Override with single column for mobile
      const newStyle = style.replace(
        /grid-template-columns:\s*repeat\(auto-fit,\s*minmax\(220px,\s*1fr\)\)/g,
        'grid-template-columns: 1fr'
      );
      
      // Adjust gap for mobile
      const gapValue = isExtraSmallMobile ? '8px' : '12px';
      const finalStyle = newStyle.replace(
        /gap:\s*[^;]+/g,
        `gap: ${gapValue}`
      );
      
      element.setAttribute('style', finalStyle);
    }
  });
  
  // Also handle any elements with gridColumn styles
  const elementsWithGridColumn = document.querySelectorAll('[style*="grid-column"]');
  elementsWithGridColumn.forEach(element => {
    const style = element.getAttribute('style');
    if (style && style.includes('gridColumn')) {
      // Remove gridColumn styles on mobile
      const newStyle = style.replace(/gridColumn:\s*[^;]+;?\s*/g, '');
      element.setAttribute('style', newStyle);
    }
  });
};

// Call on window resize
export const setupMobileResponsive = () => {
  // Initial call
  makeMobileResponsive();
  
  // Call on resize
  window.addEventListener('resize', makeMobileResponsive);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('resize', makeMobileResponsive);
  };
};
