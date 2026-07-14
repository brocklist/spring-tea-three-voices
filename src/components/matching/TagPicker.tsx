import { Check } from 'lucide-react';

interface TagPickerProps {
  tags: string[];
  selectedTags: string[];
  onChange: (tags: string[]) => void;
}

export function TagPicker({ tags, selectedTags, onChange }: TagPickerProps) {
  function toggleTag(tag: string) {
    onChange(selectedTags.includes(tag) ? selectedTags.filter((item) => item !== tag) : [...selectedTags, tag]);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const selected = selectedTags.includes(tag);
        return (
          <button
            key={tag}
            type="button"
            onClick={() => toggleTag(tag)}
            aria-pressed={selected}
            className={[
              'inline-flex items-center gap-1 rounded-full px-3 py-2 text-xs font-bold transition',
              selected ? 'bg-tea-ink text-white' : 'bg-tea-mist text-tea-ink/64 hover:bg-tea-spring/24',
            ].join(' ')}
          >
            {selected ? <Check className="h-3.5 w-3.5" /> : null}
            {tag}
          </button>
        );
      })}
    </div>
  );
}
