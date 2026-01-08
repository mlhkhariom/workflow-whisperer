import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Radio, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  time: string;
}

export function LiveChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "👋 Welcome to the live chat testing interface! I'm connected to your n8n AI Sales Agent workflow. Try asking about laptops, desktops, or accessories!",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      const responses: Record<string, string> = {
        laptop: "I have some great laptop options for you! 🎮\n\n**ASUS ROG Strix G16** - ₹1,39,990\n• RTX 4060, 16GB RAM, 165Hz Display\n\n**Lenovo Legion 5 Pro** - ₹1,49,990\n• RTX 4070, 16GB RAM, 240Hz Display\n\nWhich one interests you?",
        desktop: "Here are our top desktop picks! 🖥️\n\n**Dell XPS Desktop** - ₹1,89,990\n• RTX 4070, 32GB RAM, 1TB SSD\n\n**HP Omen 45L** - ₹2,19,990\n• RTX 4080, 64GB RAM, 2TB SSD\n\nWant more details on any of these?",
        accessories: "Check out our accessories! ⌨️\n\n**Mechanical Keyboard RGB** - ₹14,999\n**4K Gaming Monitor 32\"** - ₹59,999\n**Gaming Mouse Pro** - ₹7,999\n\nAnything catch your eye?",
        default: "I'd be happy to help you find the perfect product! We have:\n\n💻 **Laptops** - Gaming & workstation options\n🖥️ **Desktops** - Custom builds & pre-built PCs\n⌨️ **Accessories** - Keyboards, monitors, mice\n\nWhat are you looking for today?",
      };

      const lowerInput = userMessage.content.toLowerCase();
      let responseContent = responses.default;
      
      if (lowerInput.includes("laptop")) responseContent = responses.laptop;
      else if (lowerInput.includes("desktop") || lowerInput.includes("pc")) responseContent = responses.desktop;
      else if (lowerInput.includes("accessor") || lowerInput.includes("keyboard") || lowerInput.includes("monitor")) responseContent = responses.accessories;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseContent,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 h-[calc(100vh-0px)] flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight flex items-center gap-4">
            Live Chat<span className="text-gradient">.</span>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 text-success text-sm font-semibold">
              <Radio className="w-4 h-4 animate-pulse" />
              Connected
            </span>
          </h1>
          <p className="text-muted-foreground mt-2">Test your AI sales agent in real-time</p>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 glass-card flex flex-col overflow-hidden glow-accent">
        {/* Chat Header */}
        <div className="p-5 border-b border-border/50 bg-gradient-to-r from-accent/5 to-transparent flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h3 className="font-bold">AI Sales Agent</h3>
            <p className="text-xs text-accent">n8n workflow: Active</p>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-6" ref={scrollRef}>
          <div className="space-y-6">
            {messages.map((message, i) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3 animate-fade-in",
                  message.role === "user" && "flex-row-reverse"
                )}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    message.role === "user" 
                      ? "bg-gradient-to-br from-primary/20 to-primary/10" 
                      : "bg-gradient-to-br from-accent/20 to-accent/10"
                  )}
                >
                  {message.role === "user" ? (
                    <User className="w-5 h-5 text-primary" />
                  ) : (
                    <Bot className="w-5 h-5 text-accent" />
                  )}
                </div>
                <div
                  className={cn(
                    "max-w-[70%] rounded-2xl px-5 py-4",
                    message.role === "user" ? "chat-bubble-user" : "chat-bubble-assistant"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  <span className="text-xs text-muted-foreground mt-3 block">
                    {message.time}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 animate-fade-in">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-accent" />
                </div>
                <div className="chat-bubble-assistant rounded-2xl px-5 py-4">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-accent" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-5 border-t border-border/50 bg-card/30">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-3"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-secondary/30 border-border/50 h-12 rounded-xl px-5"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="h-12 px-6 bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-accent-foreground rounded-xl glow-accent"
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}