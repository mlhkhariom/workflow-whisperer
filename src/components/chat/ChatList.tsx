import { useState } from "react";
import { Search, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface Contact {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

const mockContacts: Contact[] = [
  { id: "1", name: "User #1234", lastMessage: "Looking for a gaming laptop", time: "2m", unread: 2, online: true },
  { id: "2", name: "User #5678", lastMessage: "Thanks for the help!", time: "15m", unread: 0, online: true },
  { id: "3", name: "User #9012", lastMessage: "What accessories do you have?", time: "32m", unread: 1, online: false },
  { id: "4", name: "User #3456", lastMessage: "Can I see desktop options?", time: "1h", unread: 0, online: false },
  { id: "5", name: "User #7890", lastMessage: "Perfect, I'll take it!", time: "2h", unread: 0, online: false },
];

interface ChatListProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ChatList({ selectedId, onSelect }: ChatListProps) {
  const [search, setSearch] = useState("");

  const filteredContacts = mockContacts.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-80 h-full border-r border-border flex flex-col bg-card/50">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold mb-4">Conversations</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-muted/50 border-border"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {filteredContacts.map((contact) => (
          <button
            key={contact.id}
            onClick={() => onSelect(contact.id)}
            className={cn(
              "w-full p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors text-left border-b border-border/50",
              selectedId === contact.id && "bg-primary/10 border-l-2 border-l-primary"
            )}
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
              {contact.online && (
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-success border-2 border-card" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{contact.name}</span>
                <span className="text-xs text-muted-foreground">{contact.time}</span>
              </div>
              <p className="text-sm text-muted-foreground truncate mt-0.5">{contact.lastMessage}</p>
            </div>
            {contact.unread > 0 && (
              <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                {contact.unread}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
