interface SectionHeadingProps {
  title: string;
  light?: boolean;
}

export function SectionHeading({ title, light = false }: SectionHeadingProps) {
  return (
    <div className="text-center mb-12">
      <h2 className={`font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight ${light ? 'text-white' : 'text-ink'}`}>
        {title}
      </h2>
      <div className="mx-auto mt-5 flex items-center justify-center gap-2">
        <div className="h-px w-8 bg-brand/30" />
        <div className="h-2 w-2 rotate-45 bg-accent" />
        <div className="h-px w-8 bg-brand/30" />
      </div>
    </div>
  );
}
