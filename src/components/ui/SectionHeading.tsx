interface SectionHeadingProps {
  title: string;
  description?: string;
}

export default function SectionHeading({ title, description }: SectionHeadingProps) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-slate-200 pb-1.5">
      <h3 className="inline-flex items-center gap-2 text-[13px] font-extrabold tracking-tight text-slate-950">
        <span
          aria-hidden="true"
          className="inline-block h-1.5 w-1.5 rounded-full bg-blue-600 ring-2 ring-white"
        />
        {title}
      </h3>
      {description ? (
        <p className="truncate text-[11px] font-semibold text-slate-500">
          {description}
        </p>
      ) : null}
    </div>
  );
}
