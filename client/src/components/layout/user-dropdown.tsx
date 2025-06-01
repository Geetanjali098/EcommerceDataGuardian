import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useLocation } from 'wouter';

export function UserDropdown() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout.mutate();
  };

  if (!user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary rounded-md">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.avatarUrl} alt={user.name || ''} />
          <AvatarFallback>{(user.name|| 'U').charAt(0)}</AvatarFallback>
        </Avatar>
        <span className="hidden sm:inline text-sm font-medium truncate max-w-[100px]">
          {user.name || 'User'}
        </span>
        <ChevronDown className="h-4 w-4" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48 sm:w-56">
        <div className="px-3 py-2">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
            {user.name || 'User'}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
            { user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1): 'User'}
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
          onClick={() => {
            setLocation('/users');
          }}
        >
          <User className="h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>

        <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
          onClick={() => {
            setLocation('/settings');
          }}
        >
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900 cursor-pointer"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

