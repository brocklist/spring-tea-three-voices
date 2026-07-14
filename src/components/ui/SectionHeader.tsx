interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  align?: 'left' | 'center';
}

export function SectionHeader({ eyebrow, title, description, align = 'left' }: SectionHeaderProps) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-tea-leaf/16 bg-white/72 px-3 py-1 text-xs font-bold text-tea-leaf">
        <span className="h-1.5 w-1.5 rounded-full bg-tea-gold" />
        {eyebrow}
      </div>
      <h2 className="text-3xl font-black tracking-tight text-tea-ink sm:text-4xl">{title}</h2>
      <p className="mt-3 text-base leading-7 text-tea-ink/68">{description}</p>
    </div>
  );
}
