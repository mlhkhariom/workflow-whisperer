import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Radio, Loader2 } from "lucide-react";
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
      // Simulate AI response for demo (in production, this would call the n8n webhook)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      const responses: Record<string, string> = {
        laptop: "I have some great laptop options for you! 🎮\n\n**ASUS ROG Strix G16** - $1,399\n• RTX 4060, 16GB RAM, 165Hz Display\n\n**Lenovo Legion 5 Pro** - $1,499\n• RTX 4070, 16GB RAM, 240Hz Display\n\nWhich one interests you?",
        desktop: "Here are our top desktop picks! 🖥️\n\n**Dell XPS Desktop** - $1,899\n• RTX 4070, 32GB RAM, 1TB SSD\n\n**HP Omen 45L** - $2,199\n• RTX 4080, 64GB RAM, 2TB SSD\n\nWant more details on any of these?",
        accessories: "Check out our accessories! ⌨️\n\n**Mechanical Keyboard RGB** - $149\n**4K Gaming Monitor 32\"** - $599\n**Gaming Mouse Pro** - $79\n\nAnything catch your eye?",
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
    <div className="p-8 h-[calc(100vh-0px)] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            Live Chat
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/20 text-success text-sm font-medium">
              <Radio className="w-4 h-4 animate-pulse" />
              Connected
            </span>
          </h1>
          <p className="text-muted-foreground mt-1">Test your AI sales agent in real-time</p>
        </div>
      </div>

      <div className="flex-1 glass-panel rounded-xl flex flex-col overflow-hidden glow-success">
        {/* Chat Header */}
        <div className="p-4 border-b border-border bg-success/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-success" />
          </div>
          <div>
            <h3 className="font-semibold">AI Sales Agent</h3>
            <p className="text-xs text-success">n8n workflow: working</p>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-6" ref={scrollRef}>
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3 animate-fade-in",
                  message.role === "user" && "flex-row-reverse"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                    message.role === "user" ? "bg-primary/20" : "bg-success/20"
                  )}
                >
                  {message.role === "user" ? (
                    <User className="w-4 h-4 text-primary" />
                  ) : (
                    <Bot className="w-4 h-4 text-success" />
                  )}
                </div>
                <div
                  className={cn(
                    "max-w-[70%] rounded-2xl px-4 py-3",
                    message.role === "user" ? "chat-bubble-user" : "chat-bubble-assistant"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <span className="text-xs text-muted-foreground mt-2 block">
                    {message.time}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 animate-fade-in">
                <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-success" />
                </div>
                <div className="chat-bubble-assistant rounded-2xl px-4 py-3">
                  <Loader2 className="w-5 h-5 animate-spin text-success" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-border bg-card/50">
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
              className="flex-1 bg-muted/50"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-success hover:bg-success/90 text-success-foreground glow-success"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
