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
        <div className="flex items-center justify-between gap-2 rounded-md border border-zinc-200 bg-white px-2.5 py-1.5">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-zinc-500">
              {icon ?? <Upload className="h-3.5 w-3.5" aria-hidden="true" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-zinc-900">
                {file.name}
              </p>
              <p className="text-[11px] text-zinc-500">{formatBytes(file.size)}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              onClick={openPicker}
              className="rounded px-1.5 py-0.5 text-[11px] font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
            >
              Change
            </button>
            <button
              type="button"
              onClick={handleRemove}
              aria-label="Remove file"
              className="rounded p-0.5 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={openPicker}
          className="group flex w-full items-center gap-2 rounded-md border border-dashed border-zinc-300 bg-white px-2.5 py-1.5 text-left transition hover:border-zinc-400 hover:bg-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20"
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-zinc-500 transition group-hover:text-zinc-700">
            {icon ?? <Upload className="h-3.5 w-3.5" aria-hidden="true" />}
          </span>
          <span className="text-xs font-medium text-zinc-700 group-hover:text-zinc-900">
            {placeholder}
          </span>
        </button>
      )}
    </div>
  );
}
