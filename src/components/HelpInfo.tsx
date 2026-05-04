import type { ReactNode } from "react";
import { HelpCircle, ListChecks, Workflow } from "lucide-react";
import Card from "./ui/Card";

interface InfoBlockProps {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}

function InfoBlock({ icon, title, children }: InfoBlockProps) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-1.5">
        <span className="text-zinc-500">{icon}</span>
        <h3 className="text-xs font-semibold text-zinc-900">{title}</h3>
      </div>
      <div className="text-[11px] leading-relaxed text-zinc-600">{children}</div>
    </div>
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
    <ListTag className={`${markerCls} space-y-0.5 pl-3.5 marker:text-zinc-400`}>
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ListTag>
  );
}

const codeCls =
  "rounded bg-zinc-100 px-1 py-0.5 text-[10px] text-zinc-800";

export default function HelpInfo() {
  return (
    <Card aria-label="Help and instructions">
      <div className="space-y-3">
        <header className="flex items-center gap-2">
          <span className="text-zinc-500">
            <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <h2 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Help &amp; instructions
          </h2>
        </header>

        <div className="space-y-3 border-t border-zinc-200 pt-3">
          <InfoBlock icon={<HelpCircle className="h-3 w-3" />} title="What is this for?">
            <p>
              Google Play Console requires you to verify ownership of your
              app's package name. This tool generates a verification APK with
              the snippet Play Console gave you.
            </p>
          </InfoBlock>

          <InfoBlock icon={<ListChecks className="h-3 w-3" />} title="What you'll need">
            <InfoList
              ordered
              items={[
                "Your published APK file.",
                "The keystore used to sign that APK (with password).",
                "The exact verification snippet from Play Console.",
              ]}
            />
          </InfoBlock>

          <InfoBlock icon={<Workflow className="h-3 w-3" />} title="How it works">
            <InfoList
              ordered
              items={[
                "Your APK is opened locally — nothing is uploaded.",
                <>
                  Verification file is added at{" "}
                  <code className={codeCls}>assets/adi-registration.properties</code>.
                </>,
                <>
                  Result downloads as{" "}
                  <code className={codeCls}>{"<name>-verification.apk"}</code>{" "}
                  for upload to Play Console.
                </>,
              ]}
            />
          </InfoBlock>
        </div>
      </div>
    </Card>
  );
}
