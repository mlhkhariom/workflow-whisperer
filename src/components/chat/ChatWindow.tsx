import { User, Bot, MoreVertical, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatMessages } from "@/hooks/useN8nData";
import { format } from "date-fns";

interface ChatWindowProps {
  contactId: string | null;
}

export function ChatWindow({ contactId }: ChatWindowProps) {
  const { data: messages = [], isLoading, error } = useChatMessages(contactId);

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

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="h-16 border-b border-border flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
          <div>
            <h3 className="font-semibold">User {contactId.slice(-6)}</h3>
            <p className="text-xs text-muted-foreground">{contactId}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <MoreVertical className="w-5 h-5" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Failed to load messages
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No messages yet
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3 animate-fade-in",
                  message.role === "user" && "flex-row-reverse"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                  message.role === "user" ? "bg-primary/20" : "bg-success/20"
                )}>
                  {message.role === "user" ? (
                    <User className="w-4 h-4 text-primary" />
                  ) : (
                    <Bot className="w-4 h-4 text-success" />
                  )}
                </div>
                <div className={cn(
                  "max-w-[70%] rounded-2xl px-4 py-3",
                  message.role === "user" ? "chat-bubble-user" : "chat-bubble-assistant"
                )}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <span className="text-xs text-muted-foreground mt-2 block">
                    {message.created_at 
                      ? format(new Date(message.created_at), "h:mm a")
                      : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Read-only notice */}
      <div className="p-4 border-t border-border bg-muted/30">
        <p className="text-center text-sm text-muted-foreground">
          This is a read-only view of WhatsApp conversations from n8n
        </p>
      </div>
    </div>
  );
}
