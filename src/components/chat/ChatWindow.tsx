import { User, Bot, MoreVertical, Loader2, Phone, MessageCircle, Check, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatMessages, type ChatContact } from "@/hooks/useN8nData";
import { useEffect, useRef, useMemo } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ChatWindowProps {
  contactId: string | null;
  contact?: ChatContact | null;
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  }
}

function getMessageGroups(messages: { id: string; message: string; sender: string; timestamp: string }[]) {
  const groups: { date: string; messages: typeof messages }[] = [];
  
  messages.forEach(msg => {
    const dateKey = new Date(msg.timestamp).toDateString();
    const existingGroup = groups.find(g => g.date === dateKey);
    if (existingGroup) {
      existingGroup.messages.push(msg);
    } else {
      groups.push({ date: dateKey, messages: [msg] });
    }
  });
  
  return groups;
}

export function ChatWindow({ contactId, contact }: ChatWindowProps) {
  const { data: messages = [], isLoading, error } = useChatMessages(contactId);
  const scrollRef = useRef<HTMLDivElement>(null);

  const messageGroups = useMemo(() => getMessageGroups(messages), [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!contactId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-background to-card/50">
        <div className="text-center animate-fade-in">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-6 glow-primary">
            <MessageCircle className="w-12 h-12 text-primary" />
          </div>
          <h3 className="font-bold text-2xl mb-3 text-gradient">Select a Conversation</h3>
          <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
            Choose a chat from the sidebar to view messages and conversation history
          </p>
        </div>
      </div>
    );
  }

  const displayName = contact?.name || `Contact ${contactId.slice(0, 8)}`;
  const phoneNumber = contact?.phoneNumber || '';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-background via-background to-card/30">
      {/* Header */}
      <div className="h-20 border-b border-border/50 flex items-center justify-between px-6 bg-card/40 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 border-2 border-primary/30">
            <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/30 text-primary font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-bold text-lg">{displayName}</h3>
            <div className="flex items-center gap-2">
              {phoneNumber && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Phone className="w-3 h-3" />
                  {phoneNumber}
                </p>
              )}
              <span className="flex items-center gap-1 text-xs text-success">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                Active
              </span>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-secondary/50">
          <MoreVertical className="w-5 h-5" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-6 py-4" ref={scrollRef}>
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Loading messages...</span>
          </div>
        )}

        {error && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-destructive" />
            </div>
            <p className="text-sm text-destructive font-medium">Failed to load messages</p>
            <p className="text-xs text-muted-foreground mt-1">Please try again later</p>
          </div>
        )}

        {!isLoading && !error && messages.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <p className="text-sm text-muted-foreground font-medium">No messages yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Start a conversation to see messages here</p>
          </div>
        )}

        <div className="space-y-6">
          {messageGroups.map((group) => (
            <div key={group.date}>
              {/* Date Separator */}
              <div className="flex items-center justify-center my-6">
                <div className="bg-secondary/50 text-muted-foreground text-xs px-4 py-1.5 rounded-full font-medium backdrop-blur-sm">
                  {formatDate(group.messages[0].timestamp)}
                </div>
              </div>

              {/* Messages for this date */}
              <div className="space-y-3">
                {group.messages.map((message, i) => {
                  const isUser = message.sender === "user";
                  const showAvatar = i === 0 || group.messages[i - 1]?.sender !== message.sender;
                  
                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-2 animate-fade-in",
                        isUser ? "flex-row-reverse" : "flex-row"
                      )}
                      style={{ animationDelay: `${i * 20}ms` }}
                    >
                      {/* Avatar */}
                      <div className={cn("w-8 shrink-0", !showAvatar && "invisible")}>
                        {showAvatar && (
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center",
                            isUser 
                              ? "bg-gradient-to-br from-primary to-primary/70" 
                              : "bg-gradient-to-br from-accent to-accent/70"
                          )}>
                            {isUser ? (
                              <User className="w-4 h-4 text-primary-foreground" />
                            ) : (
                              <Bot className="w-4 h-4 text-accent-foreground" />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Message Bubble */}
                      <div className={cn(
                        "max-w-[75%] group relative",
                        isUser ? "items-end" : "items-start"
                      )}>
                        <div className={cn(
                          "rounded-2xl px-4 py-2.5 shadow-sm",
                          isUser 
                            ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-br-md" 
                            : "bg-card border border-border/50 text-foreground rounded-bl-md"
                        )}>
                          <p className="text-sm whitespace-pre-wrap leading-relaxed break-words">
                            {message.message}
                          </p>
                        </div>
                        <div className={cn(
                          "flex items-center gap-1 mt-1 px-1",
                          isUser ? "justify-end" : "justify-start"
                        )}>
                          <span className="text-[10px] text-muted-foreground">
                            {formatTime(message.timestamp)}
                          </span>
                          {isUser && (
                            <CheckCheck className="w-3 h-3 text-primary/70" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <div className="flex items-center gap-1.5 text-xs bg-secondary/30 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span>Read-only view • WhatsApp Conversations</span>
          </div>
        </div>
      </div>
    </div>
  );
}