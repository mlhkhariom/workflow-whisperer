import { User, Bot, MoreVertical, Loader2, Phone } from "lucide-react";
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

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!contactId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg">Select a conversation</h3>
          <p className="text-muted-foreground text-sm mt-1">Choose a chat to view the conversation history</p>
        </div>
      </div>
    );
  }

  const displayName = contact?.name || `Contact ${contactId.slice(0, 8)}`;
  const phoneNumber = contact?.phoneNumber || '';

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="h-16 border-b border-border flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-success border-2 border-card" />
          </div>
          <div>
            <h3 className="font-semibold">{displayName}</h3>
            {phoneNumber ? (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {phoneNumber}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">{messages.length} messages</p>
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <MoreVertical className="w-5 h-5" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-6" ref={scrollRef}>
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-primary mr-2" />
            <span className="text-sm text-muted-foreground">Loading messages...</span>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-sm text-destructive">Failed to load messages</p>
          </div>
        )}

        {!isLoading && !error && messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No messages in this conversation</p>
          </div>
        )}

        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 animate-fade-in",
                message.sender === "user" && "flex-row-reverse"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                message.sender === "user" ? "bg-primary/20" : "bg-success/20"
              )}>
                {message.sender === "user" ? (
                  <User className="w-4 h-4 text-primary" />
                ) : (
                  <Bot className="w-4 h-4 text-success" />
                )}
              </div>
              <div className={cn(
                "max-w-[70%] rounded-2xl px-4 py-3",
                message.sender === "user" ? "chat-bubble-user" : "chat-bubble-assistant"
              )}>
                <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                <span className="text-xs text-muted-foreground mt-2 block">
                  {formatTime(message.timestamp)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Read-only notice */}
      <div className="p-4 border-t border-border bg-muted/30">
        <p className="text-center text-sm text-muted-foreground">
          This is a read-only view of WhatsApp conversations
        </p>
      </div>
    </div>
  );
}