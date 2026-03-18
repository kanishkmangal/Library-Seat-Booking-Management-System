import { useState, useRef, useEffect } from 'react';

const SNAP_POINTS = {
  COLLAPSED: 80, // pixels from bottom (just showing handle + summary)
  HALF: 0.5, // 50% of viewport height
  FULL: 0.85, // 85% of viewport height
};

const BottomSheet = ({ children, isOpen, selectedCount, totalAmount }) => {
  const [currentY, setCurrentY] = useState(SNAP_POINTS.COLLAPSED);
  const [isDragging, setIsDragging] = useState(false);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const sheetRef = useRef(null);
  const startY = useRef(0);
  const startTranslateY = useRef(0);

  // Update window height on resize
  useEffect(() => {
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate actual pixel values for snap points
  const getSnapPositions = () => ({
    collapsed: windowHeight - SNAP_POINTS.COLLAPSED,
    half: windowHeight * (1 - SNAP_POINTS.HALF),
    full: windowHeight * (1 - SNAP_POINTS.FULL),
  });

  // Initialize position
  useEffect(() => {
    if (!isDragging) {
      setCurrentY(isOpen ? getSnapPositions().half : getSnapPositions().collapsed);
    }
  }, [isOpen, windowHeight]);

  const handleTouchStart = (e) => {
    // Only drag from the handle area to prevent interfering with inner scrolling
    if (!e.target.closest('.drag-handle-area')) return;

    setIsDragging(true);
    startY.current = e.touches[0].clientY;
    startTranslateY.current = currentY;
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;

    const deltaY = e.touches[0].clientY - startY.current;
    let newY = startTranslateY.current + deltaY;

    // Constrain dragging
    const snaps = getSnapPositions();
    if (newY < snaps.full) newY = snaps.full - Math.sqrt(snaps.full - newY); // Pull resistance at top
    if (newY > snaps.collapsed) newY = snaps.collapsed;

    setCurrentY(newY);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const snaps = getSnapPositions();
    const velocity = currentY - startTranslateY.current; // Simple velocity proxy

    // Determine closest snap point
    let targetY = snaps.half;

    if (velocity > 50 || currentY > (snaps.half + snaps.collapsed) / 2) {
      // Swiped down quickly or passed middle threshold -> Collapse
      targetY = snaps.collapsed;
    } else if (velocity < -50 || currentY < (snaps.full + snaps.half) / 2) {
      // Swiped up quickly or passed top threshold -> Full
      targetY = snaps.full;
    } else {
      // Settle at half
      targetY = snaps.half;
    }

    setCurrentY(targetY);
  };

  const isCollapsed = currentY >= getSnapPositions().collapsed - 10;

  return (
    <>
      {/* Mobile Bottom Sheet (Hidden on md and larger) */}
      <div className="md:hidden">
        {/* Backdrop overlay when expanded */}
        {!isCollapsed && (
          <div
            className="fixed inset-0 bg-black/40 z-40 transition-opacity duration-300"
            onClick={() => setCurrentY(getSnapPositions().collapsed)}
          />
        )}

        <div
          ref={sheetRef}
          className={`fixed left-0 right-0 bottom-0 z-50 bg-white dark:bg-gray-800 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col ${
            isDragging ? '' : 'transition-transform duration-300 ease-out'
          }`}
          style={{
            height: `${windowHeight}px`,
            transform: `translateY(${currentY}px)`,
          }}
        >
          {/* Drag Handle Area */}
          <div
            className="drag-handle-area w-full pt-3 pb-2 px-6 cursor-grab active:cursor-grabbing shrink-0 flex flex-col items-center group"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Animated Drag Indicator */}
            <div className="flex flex-col items-center justify-center mb-2">
              <svg 
                className={`w-6 h-6 text-gray-400 dark:text-gray-500 transition-transform duration-300 ease-in-out ${isCollapsed ? 'rotate-0' : 'rotate-180'}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mt-1 group-hover:bg-gray-400 dark:group-hover:bg-gray-500 transition-colors" />
            </div>
            
            {/* Mini Summary visible only when collapsed */}
            <div
              className={`w-full flex justify-between items-center transition-opacity duration-200 ${
                isCollapsed ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'
              }`}
            >
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {selectedCount} Seat{selectedCount !== 1 ? 's' : ''} Selected
              </div>
              <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                ₹{totalAmount}
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 pb-20 overscroll-contain">
             <div className="opacity-100 transition-opacity duration-300">
               {children}
             </div>
          </div>
        </div>
      </div>

      {/* Desktop Sticky Sidebar (Hidden on small screens) */}
      <div className="hidden md:block sticky top-4">
        {children}
      </div>
    </>
  );
};

export default BottomSheet;
