interface SectionHeadingProps {
  title: string;
  description?: string;
}

export default function SectionHeading({ title, description }: SectionHeadingProps) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
        {title}
      </h3>
      {description ? (
        <p className="truncate text-[11px] text-zinc-400">{description}</p>
      ) : null}
    </div>
  );
}
