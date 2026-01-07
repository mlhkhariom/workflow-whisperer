import { useState } from "react";
import { Search, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useChats } from "@/hooks/useN8nData";
import { formatDistanceToNow } from "date-fns";

interface ChatListProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ChatList({ selectedId, onSelect }: ChatListProps) {
  const [search, setSearch] = useState("");
  const { data: chats = [], isLoading, error } = useChats();

  const filteredChats = chats.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.last_message?.toLowerCase().includes(search.toLowerCase()) ||
    c.contact_uid?.toLowerCase().includes(search.toLowerCase())
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
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            <p>Failed to load chats</p>
            <p className="text-xs mt-1">Check n8n connection</p>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No conversations found
          </div>
        ) : (
          filteredChats.map((chat) => (
            <button
              key={chat.contact_uid}
              onClick={() => onSelect(chat.contact_uid)}
              className={cn(
                "w-full p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors text-left border-b border-border/50",
                selectedId === chat.contact_uid && "bg-primary/10 border-l-2 border-l-primary"
              )}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm truncate">
                    {chat.name || `User ${chat.contact_uid.slice(-6)}`}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {chat.last_message_time 
                      ? formatDistanceToNow(new Date(chat.last_message_time), { addSuffix: false })
                      : ""}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground truncate mt-0.5">
                  {chat.last_message || "No messages"}
                </p>
              </div>
              {chat.unread_count > 0 && (
                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                  {chat.unread_count}
                </span>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
