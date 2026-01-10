import { MessageSquare, Users, Clock, TrendingUp } from 'lucide-react';
import { useChats } from '@/hooks/useN8nData';

export function ChatStatsCard() {
  const { data: contacts = [] } = useChats();

  const totalConversations = contacts.length;
  const unreadConversations = contacts.filter(c => c.unread > 0).length;
  const totalMessages = contacts.reduce((acc, c) => acc + c.unread, 0);
  
  // Calculate response stats
  const activeToday = contacts.filter(c => {
    const time = c.time || '';
    return time.includes('m ago') || time.includes('h ago') || time === 'Just now';
  }).length;

  const stats = [
    { 
      label: 'Total Chats', 
      value: totalConversations, 
      icon: MessageSquare,
      color: 'text-primary bg-primary/10'
    },
    { 
      label: 'Unread', 
      value: unreadConversations, 
      icon: Users,
      color: 'text-warning bg-warning/10'
    },
    { 
      label: 'Active Today', 
      value: activeToday, 
      icon: Clock,
      color: 'text-success bg-success/10'
    },
    { 
      label: 'Pending Replies', 
      value: totalMessages, 
      icon: TrendingUp,
      color: 'text-accent bg-accent/10'
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat) => (
        <div 
          key={stat.label}
          className="flex items-center gap-3 p-3 rounded-xl bg-secondary/20 border border-border/30"
        >
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
            <stat.icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
