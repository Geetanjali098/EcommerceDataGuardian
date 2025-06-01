import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCircle, Clock, AlertTriangle, Info } from 'lucide-react';
import { formatTimeAgo } from '@/lib/utils';

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'alert' | 'info' | 'success';
}

// Sample notifications data
const notifications: Notification[] = [
  {
    id: 1,
    title: 'Data Quality Alert',
    message: 'Product data completeness score dropped below threshold.',
    time: '2025-05-13T08:30:00',
    read: false,
    type: 'alert'
  },
  {
    id: 2,
    title: 'Pipeline Completed',
    message: 'Customer data import pipeline completed successfully.',
    time: '2025-05-13T06:15:00',
    read: false,
    type: 'success'
  },
  {
    id: 3,
    title: 'System Update',
    message: 'New data validation rules applied to shipping information.',
    time: '2025-05-12T18:45:00',
    read: true,
    type: 'info'
  },
  {
    id: 4,
    title: 'Anomaly Detected',
    message: 'Unusual pattern detected in user login attempts.',
    time: '2025-05-12T15:20:00',
    read: true,
    type: 'alert'
  }
];

// Get notification icon based on type
function getNotificationIcon(type: string) {
  switch (type) {
    case 'alert':
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    case 'success':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'info':
    default:
      return <Info className="h-5 w-5 text-blue-500" />;
  }
}

export function NotificationPanel() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [notificationList, setNotificationList] = React.useState<Notification[]>(notifications);
  
  const unreadCount = notificationList.filter(n => !n.read).length;
  
  const markAllAsRead = () => {
    setNotificationList(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };
  
  const markAsRead = (id: number) => {
    setNotificationList(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-gray-500 hover:text-primary dark:text-gray-300 dark:hover:text-white">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge variant="destructive" className="absolute top-0 right-0 w-5 h-5 flex items-center justify-center p-0 text-xs font-bold leading-none transform translate-x-1/2 -translate-y-1/2">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[380px] sm:w-[540px] overflow-y-auto">
        <SheetHeader className="mb-4">
          <div className="flex items-center justify-between">
            <SheetTitle>Notifications</SheetTitle>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                Mark all as read
              </Button>
            )}
          </div>
        </SheetHeader>
        
        <div className="space-y-4">
          {notificationList.length > 0 ? (
            notificationList.map(notification => (
              <div 
                key={notification.id}
                className={`
                  p-4 rounded-lg border transition-colors
                  ${notification.read ? 'bg-gray-50 dark:bg-dark' : 'bg-white dark:bg-dark-light ring-2 ring-primary/20'}
                  ${notification.type === 'alert' ? 'border-red-100 dark:border-red-900' : 
                    notification.type === 'success' ? 'border-green-100 dark:border-green-900' : 
                    'border-blue-100 dark:border-blue-900'}
                `}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <p className={`text-sm font-medium ${notification.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTimeAgo(notification.time)}
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {notification.message}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">No notifications</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                You're all caught up! No new notifications at this time.
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}