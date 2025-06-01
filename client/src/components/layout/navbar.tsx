import React from 'react';
import { Menu } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { UserDropdown } from './user-dropdown';
import { NotificationPanel } from './notification-panel';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { X } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';

interface NavbarProps {
  onSidebarToggle: () => void;
   onMobileSidebarToggle: () => void;
  onDesktopSidebarToggle: () => void;
  isDesktopSidebarOpen: boolean;
}

export function Navbar({ onSidebarToggle
  , onMobileSidebarToggle, onDesktopSidebarToggle, isDesktopSidebarOpen
 }: NavbarProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <nav className="bg-white dark:bg-dark-light shadow-sm fixed w-full z-10">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden"
                onClick={onSidebarToggle}
              >
                 {isSidebarOpen ? (
          <X className="h-5 w-5 text-gray-500" />
        ) : (
          <Menu className="h-5 w-5 text-gray-500" />
        )}
        <span className="sr-only">
          {isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        </span>
              </Button>
              <span className="ml-2 text-xl font-semibold text-primary dark:text-white">DataQuality</span>
            </div>
          </div>

          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden"
            onClick={onMobileSidebarToggle}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open mobile sidebar</span>
          </Button>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <NotificationPanel />
            <UserDropdown />
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
