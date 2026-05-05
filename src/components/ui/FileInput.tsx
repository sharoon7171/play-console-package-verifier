import { useRef, type ChangeEvent, type ReactNode } from "react";
import { Upload, X } from "lucide-react";
import { formatBytes } from "../../lib/format";

interface FileInputProps {
  accept?: string;
  file: File | null;
  onChange: (file: File | null) => void;
  placeholder?: string;
  id?: string;
  icon?: ReactNode;
}

export default function FileInput({
  accept,
  file,
  onChange,
  placeholder = "Select a file",
  id,
  icon,
}: FileInputProps) {
  const ref = useRef<HTMLInputElement>(null);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    onChange(e.target.files?.[0] ?? null);
    if (ref.current) ref.current.value = "";
  }

  function handleRemove(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    onChange(null);
    if (ref.current) ref.current.value = "";
  }

  function openPicker() {
    ref.current?.click();
  }

  return (
    <div>
      <input
        ref={ref}
        id={id}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={handleChange}
      />
      {file ? (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_1px_2px_rgba(2,6,23,0.06),0_2px_4px_-2px_rgba(2,6,23,0.06)]">
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              aria-hidden="true"
              className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-slate-950 text-white ring-1 ring-inset ring-white/10 shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_2px_4px_rgba(2,6,23,0.25)]"
            >
              {icon ?? <Upload className="h-3.5 w-3.5" aria-hidden="true" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold tracking-tight text-slate-950">
                {file.name}
              </p>
              <p className="text-[11px] font-medium text-slate-500">
                {formatBytes(file.size)}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={openPicker}
              className="rounded-md px-2 py-1 text-[11px] font-bold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
            >
              Change
            </button>
            <button
              type="button"
              onClick={handleRemove}
              aria-label="Remove file"
              className="rounded-md p-1 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={openPicker}
          className="group flex w-full items-center gap-2.5 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2 text-left transition hover:border-blue-600 hover:bg-blue-50/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/30"
        >
          <span
            aria-hidden="true"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200/80 transition group-hover:bg-slate-950 group-hover:text-white group-hover:ring-white/10"
          >
            {icon ?? <Upload className="h-3.5 w-3.5" aria-hidden="true" />}
          </span>
          <span className="text-xs font-bold tracking-tight text-slate-700 group-hover:text-slate-950">
            {placeholder}
          </span>
        </button>
      )}
    </div>
  );
}
