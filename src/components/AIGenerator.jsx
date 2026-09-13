import { useState } from 'react';
import { claudeApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Wand2, Loader2, Send, X } from 'lucide-react';

export default function AIGenerator({ type, onGenerate, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!input.trim()) return;

    setIsGenerating(true);
    try {
      const result = await claudeApi.generate(input.trim(), type);
      onGenerate(result.generated);
      setIsOpen(false);
      setInput('');
    } catch (err) {
      console.error('AI generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2 text-xs"
      >
        <Wand2 className="h-3 w-3" />
        AI Generate
      </Button>
    );
  }

  return (
    <div className="flex gap-2 p-3 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
        className="flex-1 text-sm"
        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleGenerate()}
        disabled={isGenerating}
        autoFocus
      />
      <Button
        size="sm"
        variant="gradient"
        onClick={handleGenerate}
        disabled={isGenerating || !input.trim()}
      >
        {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => { setIsOpen(false); setInput(''); }}
        disabled={isGenerating}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
