import Link from "next/link";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

interface Feature {
  label: string;
  included: boolean;
}

interface Plan {
  name: string;
  price: string;
  priceDetail: string;
  description: string;
  features: Feature[];
  cta: string;
  href: string;
  highlighted?: boolean;
  badge?: string;
}

const plans: Plan[] = [
  {
    name: "Guest",
    price: "Free",
    priceDetail: "No signup",
    description: "Try it out instantly — no account needed.",
    features: [
      { label: "3 matches per day", included: true },
      { label: "Overall match score", included: true },
      { label: "Skills breakdown", included: true },
      { label: "Top 3 action items", included: true },
      { label: "Match history", included: false },
      { label: "Share results", included: false },
      { label: "Bring Your Own API Key", included: false },
    ],
    cta: "Start Matching",
    href: "#",
  },
  {
    name: "Free Forever",
    price: "$0",
    priceDetail: "forever",
    description: "More matches and history — just sign up.",
    features: [
      { label: "10 matches per day", included: true },
      { label: "All basic insights", included: true },
      { label: "Top 5 detailed insights", included: true },
      { label: "30-day match history", included: true },
      { label: "Share via link", included: true },
      { label: "Bring Your Own API Key", included: true },
      { label: "Multi-resume comparison", included: false },
    ],
    cta: "Sign Up Free",
    href: "/auth/signup",
  },
  {
    name: "Lifetime",
    price: "$49",
    priceDetail: "one-time payment",
    description: "Unlimited everything. Pay once, use forever.",
    features: [
      { label: "Unlimited matches", included: true },
      { label: "All 23 insights", included: true },
      { label: "Unlimited history", included: true },
      { label: "PDF export & sharing", included: true },
      { label: "Multi-resume comparison", included: true },
      { label: "Priority AI processing", included: true },
      { label: "Bring Your Own API Key", included: true },
    ],
    cta: "Get Lifetime Access",
    href: "/auth/signup",
    highlighted: true,
    badge: "Best Value",
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="border-t py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start free. Upgrade when you&apos;re ready. No subscriptions — ever.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={cn(
                "relative flex flex-col",
                plan.highlighted &&
                  "border-primary shadow-lg ring-1 ring-primary"
              )}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge>{plan.badge}</Badge>
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="ml-2 text-sm text-muted-foreground">
                    {plan.priceDetail}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="flex-1">
                <ul className="space-y-3" role="list">
                  {plan.features.map((feature) => (
                    <li key={feature.label} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check
                          className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                          aria-hidden="true"
                        />
                      ) : (
                        <X
                          className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/50"
                          aria-hidden="true"
                        />
                      )}
                      <span
                        className={cn(
                          "text-sm",
                          !feature.included && "text-muted-foreground"
                        )}
                      >
                        {feature.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  variant={plan.highlighted ? "default" : "outline"}
                  className="w-full"
                  asChild
                >
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          All prices in USD. Lifetime access includes all current and future
          features. No recurring charges.
        </p>
      </div>
    </section>
  );
}
