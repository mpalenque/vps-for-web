/**
 * iOS Orientation Fix
 * 
 * This script helps with orientation detection on iOS devices, where
 * orientation events might behave differently compared to other platforms.
 */

export function setupIosOrientationFix() {
  // Check if running on iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  
  if (!isIOS) return;
  
  console.log("[IMMERSAL] iOS detected, applying orientation fixes");
  
  // Force an initial orientation reading on iOS
  window.addEventListener('orientationchange', () => {
    // Delay to ensure the orientation change has completed
    setTimeout(() => {
      // Create a synthetic deviceorientation event to force sensor recalibration
      window.dispatchEvent(new Event('deviceorientation'));
      
      // Force redraw of screen elements
      const viewport = document.querySelector('meta[name=viewport]');
      if (viewport) {
        const content = viewport.getAttribute('content');
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
        setTimeout(() => {
          viewport.setAttribute('content', content);
        }, 300);
      }
    }, 200);
  });
  
  // Fix for iOS Safari issue where it might not send deviceorientation events
  // until the user interacts with the page in certain ways
  document.addEventListener('touchend', () => {
    if (typeof DeviceOrientationEvent.requestPermission !== 'function') return;
    
    if (!window.hasOrientationEventListener) {
      window.hasOrientationEventListener = true;
      window.addEventListener('deviceorientation', () => {}, { once: true });
    }
  }, { passive: true });
}
