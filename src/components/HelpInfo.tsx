import type { ReactNode } from "react";
import { BookOpen, HelpCircle, ListChecks, Workflow } from "lucide-react";
import Card from "./ui/Card";

interface InfoBlockProps {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}

function InfoBlock({ icon, title, children }: InfoBlockProps) {
  return (
    <article>
      <div className="mb-1.5 flex items-center gap-2">
        <span
          aria-hidden="true"
          className="grid h-6 w-6 place-items-center rounded-md bg-slate-950 text-white ring-1 ring-inset ring-white/10 shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_-1px_0_rgba(0,0,0,0.45)_inset,0_2px_4px_rgba(2,6,23,0.30)]"
        >
          {icon}
        </span>
        <h3 className="text-[13px] font-extrabold tracking-tight text-slate-950">
          {title}
        </h3>
      </div>
      <div className="pl-8 text-xs font-medium leading-relaxed text-slate-600">
        {children}
      </div>
    </article>
  );
}

interface InfoListProps {
  ordered?: boolean;
  items: ReactNode[];
}

function InfoList({ ordered, items }: InfoListProps) {
  const ListTag = ordered ? "ol" : "ul";
  const markerCls = ordered ? "list-decimal" : "list-disc";
  return (
    <ListTag
      className={`${markerCls} space-y-1 pl-4 marker:font-extrabold marker:text-slate-900`}
    >
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ListTag>
  );
}

const codeCls =
  "rounded-md bg-slate-950 px-1.5 py-0.5 font-mono text-[10.5px] font-semibold text-slate-200 ring-1 ring-inset ring-white/10";

export default function HelpInfo() {
  return (
    <Card aria-labelledby="help-title">
      <header className="mb-4 flex items-start gap-3">
        <span
          aria-hidden="true"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-950 text-white ring-1 ring-inset ring-white/10 shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_-1px_0_rgba(0,0,0,0.45)_inset,0_4px_10px_-2px_rgba(2,6,23,0.40)]"
        >
          <BookOpen className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h2
            id="help-title"
            className="text-base font-extrabold tracking-tight text-slate-950"
          >
            Help &amp; instructions
          </h2>
          <p className="text-xs font-medium leading-snug text-slate-600">
            What this tool does, what you need, and how it builds the APK.
          </p>
        </div>
      </header>

      <div className="space-y-4 border-t border-slate-200 pt-4">
        <InfoBlock icon={<HelpCircle className="h-3.5 w-3.5" />} title="What is this for?">
          <p>
            The Android Developer Console (ADC) asks you to prove ownership of
            your private signing key when you register an existing package
            name or add an additional key. This tool builds the verification
            APK that ADC asks for, using the snippet it gave you.
          </p>
        </InfoBlock>

        <InfoBlock icon={<ListChecks className="h-3.5 w-3.5" />} title="What you'll need">
          <InfoList
            ordered
            items={[
              "Your published APK file.",
              "The keystore that holds the private key matching the SHA-256 fingerprint you registered (with password).",
              "The exact verification snippet shown in the ADC registration dialog.",
            ]}
          />
        </InfoBlock>

        <InfoBlock icon={<Workflow className="h-3.5 w-3.5" />} title="How it works">
          <InfoList
            ordered
            items={[
              "Your APK is opened locally — nothing is uploaded.",
              <>
                Snippet is added at{" "}
                <code className={codeCls}>assets/adi-registration.properties</code>.
              </>,
              <>
                Result downloads as{" "}
                <code className={codeCls}>{"<name>-verification.apk"}</code>{" "}
                for upload to Android Developer Console.
              </>,
            ]}
          />
        </InfoBlock>
      </div>
    </Card>
  );
}
