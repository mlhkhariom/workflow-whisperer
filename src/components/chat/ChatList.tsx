import { useState } from "react";
import { Search, User, Loader2, RefreshCw, MessageCircle } from "lucide-react";
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
    <div className="w-80 h-full border-r border-border/50 flex flex-col bg-card/30">
      {/* Header */}
      <div className="p-5 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">Conversations</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => refetch()} 
            disabled={isLoading}
            className="h-8 w-8 rounded-lg hover:bg-secondary/50"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-secondary/30 border-border/50 h-10 rounded-xl"
          />
        </div>
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary mb-3" />
            <span className="text-sm text-muted-foreground">Loading chats...</span>
          </div>
        )}

        {error && (
          <div className="p-6 text-center">
            <p className="text-sm text-destructive mb-3">Failed to load chats</p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="rounded-lg">
              Try Again
            </Button>
          </div>
        )}

        {!isLoading && !error && filteredContacts.length === 0 && (
          <div className="p-6 text-center">
            <MessageCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              {contacts.length === 0 
                ? "No conversations yet"
                : "No matches found"}
            </p>
          </div>
        )}

        {filteredContacts.map((contact, i) => (
          <button
            key={contact.id}
            onClick={() => onSelect(contact.id)}
            className={cn(
              "w-full p-4 flex items-start gap-3 hover:bg-secondary/30 transition-all text-left border-b border-border/30 animate-fade-in",
              selectedId === contact.id && "bg-primary/10 border-l-2 border-l-primary hover:bg-primary/15"
            )}
            style={{ animationDelay: `${i * 30}ms` }}
          >
            <div className="relative shrink-0">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                selectedId === contact.id 
                  ? "bg-gradient-to-br from-primary/20 to-accent/20" 
                  : "bg-secondary/50"
              )}>
                <span className={cn(
                  "text-sm font-semibold",
                  selectedId === contact.id ? "text-primary" : "text-muted-foreground"
                )}>
                  {contact.name.slice(0, 2).toUpperCase()}
                </span>
              </div>
              {contact.online && (
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-success border-2 border-card" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className={cn(
                  "font-semibold text-sm",
                  selectedId === contact.id && "text-primary"
                )}>
                  {contact.name}
                </span>
                <span className="text-xs text-muted-foreground">{contact.time}</span>
              </div>
              <p className="text-sm text-muted-foreground truncate">{contact.lastMessage}</p>
            </div>
            {contact.unread > 0 && (
              <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold shrink-0">
                {contact.unread}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}