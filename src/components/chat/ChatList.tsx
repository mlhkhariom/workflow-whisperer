import { useState } from "react";
import { Search, Loader2, RefreshCw, MessageCircle, MessageSquare, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useChats, type ChatContact } from "@/hooks/useN8nData";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

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
    <div className="w-96 h-full border-r border-border/50 flex flex-col bg-card/50 backdrop-blur-sm">
      {/* Header */}
      <div className="p-5 border-b border-border/50 bg-card/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Conversations</h2>
              <p className="text-xs text-muted-foreground">{contacts.length} chats</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => refetch()} 
            disabled={isLoading}
            className="h-9 w-9 rounded-xl hover:bg-secondary/50"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, message, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-secondary/30 border-border/50 h-11 rounded-xl focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Loader2 className="w-7 h-7 animate-spin text-primary" />
            </div>
            <span className="text-sm text-muted-foreground font-medium">Loading conversations...</span>
          </div>
        )}

        {error && (
          <div className="p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-7 h-7 text-destructive" />
            </div>
            <p className="text-sm text-destructive font-medium mb-2">Failed to load chats</p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="rounded-lg">
              <RefreshCw className="w-3.5 h-3.5 mr-2" />
              Try Again
            </Button>
          </div>
        )}

        {!isLoading && !error && filteredContacts.length === 0 && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <p className="text-muted-foreground font-medium text-sm mb-1">
              {contacts.length === 0 
                ? "No conversations yet"
                : "No matches found"}
            </p>
            <p className="text-xs text-muted-foreground/70">
              {contacts.length === 0 
                ? "New chats will appear here"
                : "Try a different search term"}
            </p>
          </div>
        )}

        <div className="py-2">
          {filteredContacts.map((contact, i) => {
            const isSelected = selectedId === contact.id;
            const initials = contact.name.slice(0, 2).toUpperCase();
            
            return (
              <button
                key={contact.id}
                onClick={() => onSelect(contact.id)}
                className={cn(
                  "w-full px-4 py-3.5 flex items-start gap-3.5 transition-all text-left animate-fade-in relative",
                  "hover:bg-secondary/40",
                  isSelected && "bg-primary/10 hover:bg-primary/15"
                )}
                style={{ animationDelay: `${i * 20}ms` }}
              >
                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-primary rounded-r-full" />
                )}

                {/* Avatar */}
                <div className="relative shrink-0">
                  <Avatar className={cn(
                    "h-12 w-12 border-2 transition-colors",
                    isSelected ? "border-primary/50" : "border-transparent"
                  )}>
                    <AvatarFallback className={cn(
                      "text-sm font-semibold transition-colors",
                      isSelected 
                        ? "bg-gradient-to-br from-primary/30 to-accent/30 text-primary" 
                        : "bg-secondary text-muted-foreground"
                    )}>
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  {contact.online && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-success border-2 border-card" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn(
                      "font-semibold text-sm truncate",
                      isSelected && "text-primary"
                    )}>
                      {contact.name}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0 ml-2">{contact.time}</span>
                  </div>
                  
                  {contact.phoneNumber && (
                    <p className="text-xs text-muted-foreground/70 flex items-center gap-1 mb-1">
                      <Phone className="w-3 h-3" />
                      {contact.phoneNumber}
                    </p>
                  )}
                  
                  <p className={cn(
                    "text-sm truncate",
                    contact.unread > 0 ? "text-foreground font-medium" : "text-muted-foreground"
                  )}>
                    {contact.lastMessage || "No messages yet"}
                  </p>
                </div>

                {/* Unread Badge */}
                {contact.unread > 0 && (
                  <Badge variant="default" className="shrink-0 h-5 min-w-5 rounded-full px-1.5 text-xs font-bold bg-primary">
                    {contact.unread > 9 ? '9+' : contact.unread}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}