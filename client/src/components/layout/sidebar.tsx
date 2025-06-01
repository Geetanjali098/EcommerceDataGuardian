import React from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { 
  BarChartBig, Database, Filter, PieChart, 
  AlertTriangle, Bell, Users, Settings, LogOut,
   ChevronLeft,ChevronRight
} from 'lucide-react';
import { SidebarSection } from '@/types';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const [location] = useLocation();
  const { logout, isAdmin } = useAuth();
  const sidebarRef = React.useRef<HTMLDivElement>(null);
  const [scrollToTop, setScrollToTop] = React.useState(false);
  const [scrollToBottom, setScrollToBottom] = React.useState(false);

  const handleLogout = () => {
    logout.mutate();
  };

  const sections: SidebarSection[] = [
    {
      title: 'Menu',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: 'BarChartBig' },
        { name: 'Data Sources', href: '/data-sources', icon: 'Database' },
        { name: 'Data Pipelines', href: '/data-pipelines', icon: 'Filter' },
      ]
    },
    {
      title: 'Analytics',
      items: [
        { name: 'Reports', href: '/reports', icon: 'PieChart' },
        { name: 'Anomalies', href: '/anomalies', icon: 'AlertTriangle' },
        { name: 'Alerts', href: '/alerts', icon: 'Bell' },
      ]
    },
    {
      title: 'Settings',
      items: [
        { name: 'Users & Roles', href: '/users', icon: 'Users' },
        { name: 'System Settings', href: '/settings', icon: 'Settings' },
      ]
    }
  ];

  const filteredSections = sections.map(section => ({
    ...section,
    items: section.items.filter(item => {
      if (item.name === 'Users & Roles' && !isAdmin()) return false;
      return true;
    })
  }));

  const getIcon = (iconName: string) => {
    const icons: Record<string, JSX.Element> = {
      BarChartBig: <BarChartBig className="h-5 w-5" />,
      Database: <Database className="h-5 w-5" />,
      Filter: <Filter className="h-5 w-5" />,
      PieChart: <PieChart className="h-5 w-5" />,
      AlertTriangle: <AlertTriangle className="h-5 w-5" />,
      Bell: <Bell className="h-5 w-5" />,
      Users: <Users className="h-5 w-5" />,
      Settings: <Settings className="h-5 w-5" />,
    };
    return icons[iconName] || <BarChartBig className="h-5 w-5" />;
  };

  const handleScroll = () => {
    if (!sidebarRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = sidebarRef.current;
    setScrollToTop(scrollTop > 50);
    setScrollToBottom(scrollTop + clientHeight < scrollHeight - 10);
  };

  const handleScrollToTop = () => {
    sidebarRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScrollToBottom = () => {
    if (!sidebarRef.current) return;
    sidebarRef.current.scrollTo({ top: sidebarRef.current.scrollHeight, behavior: 'smooth' });
  };

  return (
    <aside 
      className={cn(
        "hidden lg:flex lg: flex-col fixed h-screen border-r bg-white dark:bg-dark-light shadow-sm z-20 transition-all duration-300",
        isOpen ? "w-64" : "w-20", // Collapsed width 
        "top-0 left-0 bottom-0" // Ensure it covers full height   
      )}
    >
      {/* Sidebar Toggle Button */}
       <div className="px-4 py-6">
        <div className={cn(
          "mb-6 flex items-center justify-between",
          !isOpen && "flex-col space-y-2"
        )}>
          {isOpen ? (
            <span className="text-xl font-semibold text-primary dark:text-white">DataQuality</span>
          ) : (
            <span className="text-xl font-semibold text-primary dark:text-white">DQ</span>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggle}
            className="hidden lg:flex"
          >
            <ChevronLeft className={cn(
              "h-5 w-5 text-gray-500 transition-transform",
              !isOpen && "rotate-180"
            )} />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </div>
      </div>
      
      {/* Scroll Buttons */}
      {scrollToTop && (
        <button
          onClick={handleScrollToTop}
          className="absolute top-4 right-4 z-20 bg-white dark:bg-dark-light rounded-full shadow-md p-2 hover:bg-gray-100 dark:hover:bg-dark-lighter"
          aria-label="Scroll to top"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m18 15-6-6-6 6" />
          </svg>
        </button>
      )}

      <div
        ref={sidebarRef}
        className="overflow-y-auto flex-1 px-4 py-6"
        onScroll={handleScroll}
      >
        <div className="space-y-4">
          {filteredSections.map((section, index) => (
            <div key={index} className="space-y-2">
              <p className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 px-2">
                {section.title}
              </p>
              {section.items.map((item, itemIndex) => (
                <Link
                  key={itemIndex}
                  href={item.href}
                  className={cn(
                    "flex items-center px-2 py-2 text-base font-medium rounded-md",
                    location === item.href
                      ? "text-primary bg-blue-50 dark:bg-dark-lighter"
                      : "text-gray-600 hover:text-primary hover:bg-blue-50 dark:text-gray-300 dark:hover:bg-dark-lighter"
                  )}
                >
                  <span className="w-6">{getIcon(item.icon)}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          ))}

          <div className="space-y-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-2 py-2 text-base font-medium text-gray-600 hover:text-primary hover:bg-blue-50 dark:text-gray-300 dark:hover:bg-dark-lighter rounded-md"
            >
              <span className="w-6"><LogOut className="h-5 w-5" /></span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {scrollToBottom && (
        <button
          onClick={handleScrollToBottom}
          className="absolute bottom-4 right-4 z-20 bg-white dark:bg-dark-light rounded-full shadow-md p-2 hover:bg-gray-100 dark:hover:bg-dark-lighter"
          aria-label="Scroll to bottom"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      )}
    </aside>
  );
}

export default Sidebar;

