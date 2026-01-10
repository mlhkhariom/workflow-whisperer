import { useState } from 'react';
import { Tag, Plus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const PRESET_TAGS = [
  { label: 'VIP', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  { label: 'New Customer', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { label: 'Hot Lead', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  { label: 'Follow Up', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { label: 'Interested', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { label: 'Pending', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
];

interface ContactTagsProps {
  contactId: string;
  initialTags?: string[];
  onTagsChange?: (tags: string[]) => void;
}

export function ContactTags({ contactId, initialTags = [], onTagsChange }: ContactTagsProps) {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [showInput, setShowInput] = useState(false);
  const [newTag, setNewTag] = useState('');

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      const updated = [...tags, tag];
      setTags(updated);
      onTagsChange?.(updated);
    }
    setNewTag('');
    setShowInput(false);
  };

  const removeTag = (tag: string) => {
    const updated = tags.filter(t => t !== tag);
    setTags(updated);
    onTagsChange?.(updated);
  };

  const getTagStyle = (tag: string) => {
    const preset = PRESET_TAGS.find(p => p.label === tag);
    return preset?.color || 'bg-primary/20 text-primary border-primary/30';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Tag className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">Tags</span>
      </div>

      {/* Current Tags */}
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <Badge 
            key={tag}
            variant="outline"
            className={cn(
              "text-xs px-2 py-0.5 flex items-center gap-1",
              getTagStyle(tag)
            )}
          >
            {tag}
            <button 
              onClick={() => removeTag(tag)}
              className="hover:text-destructive ml-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
        
        {!showInput && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowInput(true)}
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add
          </Button>
        )}
      </div>

      {/* Add Tag Input */}
      {showInput && (
        <div className="space-y-2 animate-fade-in">
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Custom tag..."
              className="h-8 text-xs"
              onKeyDown={(e) => e.key === 'Enter' && addTag(newTag)}
              autoFocus
            />
            <Button size="sm" className="h-8 px-3" onClick={() => addTag(newTag)}>
              Add
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-8 px-2"
              onClick={() => setShowInput(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Preset Tags */}
          <div className="flex flex-wrap gap-1">
            {PRESET_TAGS.filter(p => !tags.includes(p.label)).map((preset) => (
              <button
                key={preset.label}
                onClick={() => addTag(preset.label)}
                className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full border transition-all hover:scale-105",
                  preset.color
                )}
              >
                + {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
