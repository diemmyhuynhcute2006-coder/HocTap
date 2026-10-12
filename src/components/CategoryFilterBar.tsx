import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface CategoryItem<T extends string = string> {
  key: T;
  label: string;
  icon: string;
}

interface CategoryFilterBarProps<T extends string = string> {
  categories: CategoryItem<T>[];
  activeCategory: T;
  onSelectCategory: (key: T) => void;
  accentBgClass: string;
}

export const CategoryFilterBar = <T extends string = string>({
  categories,
  activeCategory,
  onSelectCategory,
  accentBgClass,
}: CategoryFilterBarProps<T>) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Drag-to-scroll states
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollStartLeft, setScrollStartLeft] = useState(0);
  const hasDraggedRef = useRef(false);

  // Arrow button visibility / active states
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollability = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  };

  useEffect(() => {
    checkScrollability();
    const el = scrollContainerRef.current;
    if (!el) return;

    const handleScroll = () => checkScrollability();
    el.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      el.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [categories]);

  // Mouse wheel scroll: converts vertical wheel deltaY to horizontal scrollLeft
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        el.scrollBy({
          left: e.deltaY * 1.5,
          behavior: 'smooth',
        });
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Drag to scroll handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setIsDragging(true);
    hasDraggedRef.current = false;
    setStartX(e.pageX - el.offsetLeft);
    setScrollStartLeft(el.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const el = scrollContainerRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const distance = (x - startX) * 1.4;
    if (Math.abs(distance) > 5) {
      hasDraggedRef.current = true;
    }
    el.scrollLeft = scrollStartLeft - distance;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Button Arrow scrolls ~150px
  const handleScrollLeft = () => {
    scrollContainerRef.current?.scrollBy({ left: -150, behavior: 'smooth' });
  };

  const handleScrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 150, behavior: 'smooth' });
  };

  return (
    <div className="relative px-3 sm:px-6 py-2.5 border-b border-stone-100 dark:border-stone-800/80 bg-stone-50/70 dark:bg-stone-950/40 flex items-center gap-1.5 select-none">
      {/* Scroll Left Button (<) */}
      <button
        type="button"
        onClick={handleScrollLeft}
        className={`p-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 shadow-xs hover:bg-stone-100 dark:hover:bg-stone-700 transition-all shrink-0 ${
          canScrollLeft ? 'opacity-100 cursor-pointer' : 'opacity-40 cursor-default'
        }`}
        title="Cuộn sang trái"
        aria-label="Cuộn sang trái"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Categories Scroll Container */}
      <div
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        className="flex items-center gap-2 overflow-x-auto overflow-y-hidden whitespace-nowrap no-scrollbar py-1 px-1 cursor-grab active:cursor-grabbing flex-1"
        style={{
          WebkitOverflowScrolling: 'touch',
          scrollBehavior: 'smooth',
          scrollbarWidth: 'none',
        }}
      >
        {categories.map((cat) => {
          const isSelected = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => {
                // If user dragged more than threshold, ignore accidental click
                if (hasDraggedRef.current) return;
                onSelectCategory(cat.key);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                isSelected
                  ? `${accentBgClass} shadow-xs font-semibold scale-[1.02]`
                  : 'bg-white dark:bg-stone-800/90 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700/80 border border-stone-200/70 dark:border-stone-700/70'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Scroll Right Button (>) */}
      <button
        type="button"
        onClick={handleScrollRight}
        className={`p-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 shadow-xs hover:bg-stone-100 dark:hover:bg-stone-700 transition-all shrink-0 ${
          canScrollRight ? 'opacity-100 cursor-pointer' : 'opacity-40 cursor-default'
        }`}
        title="Cuộn sang phải"
        aria-label="Cuộn sang phải"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
