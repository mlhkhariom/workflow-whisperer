import { User, Bot, MoreVertical, Loader2, Phone, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatMessages, type ChatContact } from "@/hooks/useN8nData";
import { useEffect, useRef } from "react";

interface ChatWindowProps {
  contactId: string | null;
  contact?: ChatContact | null;
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function ChatWindow({ contactId, contact }: ChatWindowProps) {
  const { data: messages = [], isLoading, error } = useChatMessages(contactId);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!contactId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background/50">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="w-10 h-10 text-primary" />
          </div>
          <h3 className="font-bold text-xl mb-2">Select a conversation</h3>
          <p className="text-muted-foreground text-sm max-w-xs">
            Choose a chat from the sidebar to view the conversation history
          </p>
        </div>
      </div>
    );
  }

  const displayName = contact?.name || `Contact ${contactId.slice(0, 8)}`;
  const phoneNumber = contact?.phoneNumber || '';

  return (
    <div className="flex-1 flex flex-col bg-background/50">
      {/* Header */}
      <div className="h-18 border-b border-border/50 flex items-center justify-between px-6 py-4 bg-card/30">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">
                {displayName.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-success border-2 border-card" />
          </div>
          <div>
            <h3 className="font-bold">{displayName}</h3>
            {phoneNumber ? (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Phone className="w-3 h-3" />
                {phoneNumber}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">{messages.length} messages</p>
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-secondary/50">
          <MoreVertical className="w-5 h-5" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-6" ref={scrollRef}>
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary mb-3" />
            <span className="text-sm text-muted-foreground">Loading messages...</span>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-sm text-destructive">Failed to load messages</p>
          </div>
        )}

        {!isLoading && !error && messages.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No messages in this conversation</p>
          </div>
        )}

        <div className="space-y-4">
          {messages.map((message, i) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 animate-fade-in",
                message.sender === "user" && "flex-row-reverse"
              )}
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                message.sender === "user" 
                  ? "bg-gradient-to-br from-primary/20 to-primary/10" 
                  : "bg-gradient-to-br from-accent/20 to-accent/10"
              )}>
                {message.sender === "user" ? (
                  <User className="w-4 h-4 text-primary" />
                ) : (
                  <Bot className="w-4 h-4 text-accent" />
                )}
              </div>
              <div className={cn(
                "max-w-[70%] rounded-2xl px-4 py-3",
                message.sender === "user" ? "chat-bubble-user" : "chat-bubble-assistant"
              )}>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.message}</p>
                <span className="text-xs text-muted-foreground mt-2 block">
                  {formatTime(message.timestamp)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Read-only notice */}
      <div className="p-4 border-t border-border/50 bg-card/20">
        <p className="text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-success/50" />
          Read-only view of WhatsApp conversations
        </p>
      </div>
    </div>
  );
}