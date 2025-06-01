import React from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { 
  BarChartBig, Database, Filter, PieChart, 
  AlertTriangle, Bell, Users, Settings, LogOut, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarSection } from '@/types';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const [location] = useLocation();
  const { logout, isAdmin } = useAuth();
  
  const handleLogout = () => {
    logout.mutate();
    onClose();
  };
  
  const sections: SidebarSection[] = [
    {
      title: 'Main',
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
  
  // Filter out Users & Roles if not admin
  const filteredSections = sections.map(section => ({
    ...section,
    items: section.items.filter(item => {
      if (item.name === 'Users & Roles' && !isAdmin()) {
        return false;
      }
      return true;
    })
  }));
  
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'BarChartBig': return <BarChartBig className="h-5 w-5" />;
      case 'Database': return <Database className="h-5 w-5" />;
      case 'Filter': return <Filter className="h-5 w-5" />;
      case 'PieChart': return <PieChart className="h-5 w-5" />;
      case 'AlertTriangle': return <AlertTriangle className="h-5 w-5" />;
      case 'Bell': return <Bell className="h-5 w-5" />;
      case 'Users': return <Users className="h-5 w-5" />;
      case 'Settings': return <Settings className="h-5 w-5" />;
      default: return <BarChartBig className="h-5 w-5" />;
    }
  };
  
  return (
    <>
      {/* Mobile sidebar overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      
      {/* Mobile sidebar */}
      <aside 
        className={cn(
          "transform lg:hidden transition-transform fixed bg-white dark:bg-dark-light w-64 h-full shadow-md z-30 overflow-y-auto",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xl font-semibold text-primary dark:text-white">DataQuality</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5 text-gray-500" />
              <span className="sr-only">Close sidebar</span>
            </Button>
          </div>
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
                  >
                    <a 
                      className={cn(
                        "flex items-center px-2 py-2 text-base font-medium rounded-md",
                        location === item.href
                          ? "text-primary bg-blue-50 dark:bg-dark-lighter"
                          : "text-gray-600 hover:text-primary hover:bg-blue-50 dark:text-gray-300 dark:hover:bg-dark-lighter"
                      )}
                      onClick={onClose}
                    >
                      <span className="w-6">{getIcon(item.icon)}</span>
                      <span>{item.name}</span>
                    </a>
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
      </aside>
    </>
  );
}

export default MobileSidebar;
