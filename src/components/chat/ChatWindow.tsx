import { User, Bot, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  time: string;
}

const mockMessages: Message[] = [
  { id: "1", role: "user", content: "Hi, I'm looking for a gaming laptop", time: "10:32 AM" },
  { id: "2", role: "assistant", content: "Hello! I'd be happy to help you find the perfect gaming laptop. What's your budget range, and are there any specific features you're looking for like high refresh rate display, specific GPU requirements, or portability?", time: "10:32 AM" },
  { id: "3", role: "user", content: "Budget around $1500, need good graphics for AAA games", time: "10:33 AM" },
  { id: "4", role: "assistant", content: "Great choice! For $1500, I can recommend some excellent options with RTX 4060/4070 GPUs. Let me show you our top picks:", time: "10:33 AM" },
  { id: "5", role: "user", content: "That sounds good, show me what you have", time: "10:34 AM" },
  { id: "6", role: "assistant", content: "Here are our top gaming laptops in your budget:\n\n🎮 **ASUS ROG Strix G16** - $1,399\n• RTX 4060, 16GB RAM, 165Hz Display\n• Great for most AAA games at high settings\n\n🎮 **Lenovo Legion 5 Pro** - $1,499\n• RTX 4070, 16GB RAM, 240Hz Display\n• Excellent cooling, premium build\n\nWould you like more details on any of these?", time: "10:34 AM" },
];

interface ChatWindowProps {
  contactId: string | null;
}

export function ChatWindow({ contactId }: ChatWindowProps) {
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
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-success border-2 border-card" />
          </div>
          <div>
            <h3 className="font-semibold">User #{contactId}234</h3>
            <p className="text-xs text-success">Online</p>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <MoreVertical className="w-5 h-5" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6">
          {mockMessages.map((message) => (
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
                <span className="text-xs text-muted-foreground mt-2 block">{message.time}</span>
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
