import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PlanGroup {
  audience: string;
  subtitle: string;
  freePrice: string;
  proPrice: string;
  proBadge?: string;
  freeCta: string;
  proCta: string;
  freeHref: string;
  proHref: string;
  freeFeatures: string[];
  proExtras: string[];
}

const planGroups: PlanGroup[] = [
  {
    audience: "For Job Seekers",
    subtitle: "Optimize your resume and land more interviews",
    freePrice: "$0",
    proPrice: "$19",
    freeCta: "Sign Up Free",
    proCta: "Coming Soon",
    proBadge: "Coming Soon",
    freeHref: "/register?type=jobseeker",
    proHref: "/register?type=jobseeker",
    freeFeatures: [
      "10 matches per day",
      "Basic jobseeker insights",
      "3-day saved match history",
      "Share insights via link",
    ],
    proExtras: [
      "Unlimited matching",
      "All advanced insights",
      "Unlimited match history",
      "PDF export",
    ],
  },
  {
    audience: "For Business",
    subtitle: "Evaluate candidates faster with your team",
    freePrice: "$0",
    proPrice: "$149",
    freeCta: "Sign Up Free",
    proCta: "Coming Soon",
    proBadge: "Coming Soon",
    freeHref: "/register?type=business",
    proHref: "/register?type=business",
    freeFeatures: [
      "20 matches per day",
      "Basic hiring insights",
      "14-day match history",
      "Share via link",
    ],
    proExtras: [
      "Unlimited matches",
      "All advanced insights",
      "30-day match history",
      "Invite team members",
      "PDF export",
      "Multi-resume comparison (up to 3)",
    ],
  },
];

function FeatureList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5" role="list">
      {items.map((item) => (
        <li key={item} className="flex items-center gap-2">
          <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <span className="text-sm">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function PlanGroupCard({ group }: { group: PlanGroup }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-background">
      <div className="border-b bg-muted/40 px-6 py-5 text-center">
        <h3 className="text-lg font-semibold">{group.audience}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{group.subtitle}</p>
      </div>

      <div className="grid grid-cols-2 divide-x">
        <div className="flex flex-col">
          <div className="border-b px-5 pt-5 pb-5">
            <p className="text-center text-sm font-medium text-muted-foreground">
              Free Forever
            </p>
            <div className="mt-2 text-center">
              <span className="text-3xl font-bold">{group.freePrice}</span>
              <span className="ml-1 text-sm text-muted-foreground">
                forever
              </span>
            </div>
          </div>

          <div className="flex-1 px-5 py-4">
            <FeatureList items={group.freeFeatures} />
          </div>

          <div className="border-t px-5 py-5">
            <Button variant="outline" className="w-full" asChild>
              <Link href={group.freeHref}>{group.freeCta}</Link>
            </Button>
          </div>
        </div>

        <div className="relative flex flex-col">
          {group.proBadge && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge>{group.proBadge}</Badge>
            </div>
          )}

          <div className="border-b px-5 pt-5 pb-5">
            <p className="text-center text-sm font-medium text-primary">Pro</p>
            <div className="mt-2 text-center">
              <span className="text-3xl font-bold">{group.proPrice}</span>
              <span className="ml-1 text-sm text-muted-foreground">
                / month
              </span>
            </div>
          </div>

          <div className="flex-1 px-5 py-4">
            <p className="mb-3 text-sm font-medium text-muted-foreground">
              Everything in Free, plus:
            </p>
            <FeatureList items={group.proExtras} />
          </div>

          <div className="border-t px-5 py-5">
            <Button className="w-full" asChild>
              <Link href={group.proHref}>{group.proCta}</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Pricing() {
  return (
    <section id="pricing" className="border-t py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start free. Upgrade when you&apos;re ready. Cancel anytime.
          </p>
        </div>

        <div className="mx-auto mt-10 flex max-w-6xl flex-col items-center justify-between gap-4 rounded-lg border border-dashed bg-muted/30 px-6 py-5 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-semibold">No account needed to start</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try the app as a guest with up to 3 matches per day and basic
              insights — completely free, no signup required.
            </p>
          </div>
          <Button variant="outline" className="shrink-0" asChild>
            <Link href="#hero">Try Matching Resumes Now</Link>
          </Button>
        </div>

        <div className="mx-auto mt-10 grid max-w-6xl gap-8 lg:grid-cols-2">
          {planGroups.map((group) => (
            <PlanGroupCard key={group.audience} group={group} />
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          All prices in USD. Cancel anytime — no long-term contracts.
        </p>
      </div>
    </section>
  );
}
