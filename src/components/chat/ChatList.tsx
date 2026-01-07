import { useState } from "react";
import { Search, User, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useChats, type ChatContact } from "@/hooks/useN8nData";

interface ChatListProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ChatList({ selectedId, onSelect }: ChatListProps) {
  const [search, setSearch] = useState("");
  const { data: contacts = [], isLoading, error, refetch } = useChats();

  const filteredContacts = contacts.filter(c => {
    const name = c.name || '';
    const lastMessage = c.lastMessage || '';
    const phone = c.phoneNumber || '';
    const searchLower = search.toLowerCase();
    return name.toLowerCase().includes(searchLower) ||
      lastMessage.toLowerCase().includes(searchLower) ||
      phone.includes(search);
  });

  return (
    <div className="w-80 h-full border-r border-border flex flex-col bg-card/50">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Conversations</h2>
          <Button variant="ghost" size="icon" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </Button>
        </div>
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
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-primary mr-2" />
            <span className="text-sm text-muted-foreground">Loading chats...</span>
          </div>
        )}

        {error && (
          <div className="p-4 text-center">
            <p className="text-sm text-destructive mb-2">Failed to load chats</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}

        {!isLoading && !error && filteredContacts.length === 0 && (
          <div className="p-4 text-center text-muted-foreground text-sm">
            {contacts.length === 0 
              ? "No conversations yet. Set up n8n webhook."
              : "No conversations match your search."}
          </div>
        )}

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
