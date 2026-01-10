import { useState } from 'react';
import { Zap, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const TEMPLATES = [
  {
    category: 'Greeting',
    messages: [
      'Hello! How can I help you today?',
      'Hi there! Thanks for reaching out. How may I assist you?',
      'Welcome! I\'m here to help with any questions about our products.',
    ]
  },
  {
    category: 'Product Inquiry',
    messages: [
      'Sure! Let me check the availability and pricing for you.',
      'We have several options in that category. What\'s your budget range?',
      'This laptop comes with a 6-month warranty. Would you like to see similar models?',
    ]
  },
  {
    category: 'Pricing',
    messages: [
      'The price includes GST and delivery. Would you like to proceed?',
      'We can offer a special discount if you\'re buying multiple items.',
      'EMI options are available. Shall I share the details?',
    ]
  },
  {
    category: 'Closing',
    messages: [
      'Thank you for your inquiry! Feel free to reach out anytime.',
      'Great! I\'ll process your order right away.',
      'Let me know if you need anything else. Have a great day!',
    ]
  },
];

interface MessageTemplatesProps {
  onSelectTemplate?: (message: string) => void;
}

export function MessageTemplates({ onSelectTemplate }: MessageTemplatesProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const handleCopy = async (message: string, index: string) => {
    await navigator.clipboard.writeText(message);
    setCopiedIndex(index);
    toast.success('Template copied!');
    setTimeout(() => setCopiedIndex(null), 2000);
    onSelectTemplate?.(message);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-4 h-4 text-warning" />
        <h4 className="text-sm font-semibold">Quick Replies</h4>
      </div>
      
      {TEMPLATES.map((template) => (
        <div 
          key={template.category}
          className="rounded-xl border border-border/30 overflow-hidden"
        >
          <button
            onClick={() => setExpandedCategory(
              expandedCategory === template.category ? null : template.category
            )}
            className="w-full flex items-center justify-between px-3 py-2.5 bg-secondary/20 hover:bg-secondary/30 transition-colors text-left"
          >
            <span className="text-sm font-medium">{template.category}</span>
            {expandedCategory === template.category ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
          
          {expandedCategory === template.category && (
            <div className="p-2 space-y-1.5 bg-card/50 animate-fade-in">
              {template.messages.map((msg, i) => {
                const indexKey = `${template.category}-${i}`;
                const isCopied = copiedIndex === indexKey;
                
                return (
                  <button
                    key={i}
                    onClick={() => handleCopy(msg, indexKey)}
                    className={cn(
                      "w-full text-left p-2.5 rounded-lg text-xs",
                      "bg-secondary/30 hover:bg-secondary/50 transition-all",
                      "flex items-start justify-between gap-2 group"
                    )}
                  >
                    <span className="flex-1 leading-relaxed">{msg}</span>
                    <span className={cn(
                      "shrink-0 w-6 h-6 rounded-md flex items-center justify-center transition-all",
                      isCopied 
                        ? "bg-success/20 text-success" 
                        : "bg-transparent group-hover:bg-primary/10 text-muted-foreground group-hover:text-primary"
                    )}>
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
