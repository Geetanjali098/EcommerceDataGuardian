import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScrollableMetricsCardsProps {
  title?: string;
  children: React.ReactNode;
}

export function ScrollableMetricsCards({ title, children }: ScrollableMetricsCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollButtons = () => {
    const container = containerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 10
      );
    }
  };

  useEffect(() => {
    checkScrollButtons();
    window.addEventListener('resize', checkScrollButtons);
    return () => window.removeEventListener('resize', checkScrollButtons);
  }, []);

  const scrollLeft = () => {
    if (containerRef.current) {
      const container = containerRef.current;
      const cardWidth = container.querySelector('div')?.clientWidth || 0;
      const margin = 24; // Estimated margin between cards
      container.scrollBy({ left: -(cardWidth + margin), behavior: 'smooth' });
      setTimeout(checkScrollButtons, 300);
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      const container = containerRef.current;
      const cardWidth = container.querySelector('div')?.clientWidth || 0;
      const margin = 24; // Estimated margin between cards
      container.scrollBy({ left: cardWidth + margin, behavior: 'smooth' });
      setTimeout(checkScrollButtons, 300);
    }
  };

  return (
    <div className="relative">
      {title && <h3 className="text-lg font-medium mb-3">{title}</h3>}
      
      {/* Scroll buttons */}
      <div className="absolute -left-4 top-1/2 -translate-y-1/2 z-10">
        <Button
          variant="outline"
          size="icon"
          onClick={scrollLeft}
          disabled={!canScrollLeft}
          className={cn(
            "rounded-full shadow-md h-8 w-8 bg-white dark:bg-gray-800",
            !canScrollLeft && "opacity-0",
            canScrollLeft && "opacity-100"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Scroll left</span>
        </Button>
      </div>
      
      <div className="absolute -right-4 top-1/2 -translate-y-1/2 z-10">
        <Button
          variant="outline"
          size="icon"
          onClick={scrollRight}
          disabled={!canScrollRight}
          className={cn(
            "rounded-full shadow-md h-8 w-8 bg-white dark:bg-gray-800",
            !canScrollRight && "opacity-0",
            canScrollRight && "opacity-100"
          )}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Scroll right</span>
        </Button>
      </div>
      
      {/* Scrollable container */}
      <div 
        ref={containerRef}
        className="flex space-x-6 overflow-x-auto pb-4 pt-1 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onScroll={checkScrollButtons}
      >
        {children}
      </div>
      
      {/* Custom scrollbar styling is handled in CSS */}
    </div>
  );
}