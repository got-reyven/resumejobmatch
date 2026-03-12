"use client";

import { useRouter } from "next/navigation";
import { Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import { useReducer, useEffect } from "react";

interface PlanOption {
  id: "free" | "pro";
  name: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  comingSoon?: boolean;
}

const plans: Record<string, PlanOption[]> = {
  jobseeker: [
    {
      id: "free",
      name: "Free Forever",
      price: "$0",
      period: "forever",
      features: [
        "10 matches per day",
        "Basic jobseeker insights",
        "3-day saved match history",
        "Share insights via link",
      ],
      cta: "Proceed to Dashboard",
    },
    {
      id: "pro",
      name: "Jobseeker Pro",
      price: "$19",
      period: "/ month",
      features: [
        "Everything in Free, plus:",
        "Unlimited matching",
        "All advanced insights",
        "Unlimited match history",
        "PDF export",
      ],
      cta: "Coming Soon",
      comingSoon: true,
    },
  ],
  business: [
    {
      id: "free",
      name: "Free Forever",
      price: "$0",
      period: "forever",
      features: [
        "20 matches per day",
        "Basic hiring insights",
        "14-day match history",
        "Share via link",
      ],
      cta: "Proceed to Dashboard",
    },
    {
      id: "pro",
      name: "Business Pro",
      price: "$149",
      period: "/ month",
      features: [
        "Everything in Free, plus:",
        "Unlimited matches",
        "All advanced insights",
        "30-day match history",
        "Invite team members",
        "PDF export",
        "Multi-resume comparison (up to 3)",
      ],
      cta: "Coming Soon",
      comingSoon: true,
    },
  ],
};

type UserType = "jobseeker" | "business";
type State = { userType: UserType; ready: boolean; loading: boolean };
type Action = { type: "init"; userType: UserType } | { type: "loading" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "init":
      return { ...state, userType: action.userType, ready: true };
    case "loading":
      return { ...state, loading: true };
  }
}

export default function PlanPage() {
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, {
    userType: "jobseeker",
    ready: false,
    loading: false,
  });

  useEffect(() => {
    const stored = localStorage.getItem("register_user_type");
    dispatch({
      type: "init",
      userType: stored === "business" ? "business" : "jobseeker",
    });
  }, []);

  const { userType, ready, loading } = state;
  const availablePlans = plans[userType] ?? plans.jobseeker;

  function handleSelect(plan: PlanOption) {
    if (plan.comingSoon) return;
    dispatch({ type: "loading" });

    if (userType === "business") {
      router.push("/register/business-setup");
    } else {
      router.push("/dashboard");
    }
  }

  if (!ready) {
    return (
      <div className="w-full max-w-2xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Choose your plan
          </h1>
          <p className="mt-2 text-sm text-white/70">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Choose your plan
        </h1>
        <p className="mt-2 text-sm text-white/70">
          {userType === "business"
            ? "Select the plan that fits your hiring needs"
            : "Select the plan that fits your job search"}
        </p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">
        {availablePlans.map((plan) => (
          <div
            key={plan.id}
            className={cn(
              "relative flex flex-col rounded-xl bg-white shadow-sm",
              plan.comingSoon && "opacity-75"
            )}
          >
            {plan.comingSoon && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge>Coming Soon</Badge>
              </div>
            )}

            <div className="border-b px-5 pt-6 pb-4 text-center">
              <p className="text-sm font-medium text-muted-foreground">
                {plan.name}
              </p>
              <div className="mt-2">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="ml-1 text-sm text-muted-foreground">
                  {plan.period}
                </span>
              </div>
            </div>

            <div className="flex-1 px-5 py-4">
              <ul className="space-y-2.5">
                {plan.features.map((feature, idx) => {
                  const isHeader = feature.startsWith("Everything");
                  return (
                    <li
                      key={idx}
                      className={cn(
                        "flex items-center gap-2 text-sm",
                        isHeader && "font-medium text-muted-foreground"
                      )}
                    >
                      {isHeader ? (
                        <Zap className="h-3.5 w-3.5 shrink-0 text-primary" />
                      ) : (
                        <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                      )}
                      {feature}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="border-t px-5 py-4">
              <Button
                className="w-full"
                variant={plan.comingSoon ? "outline" : "default"}
                disabled={plan.comingSoon || loading}
                onClick={() => handleSelect(plan)}
              >
                {plan.id === "free" && loading ? "Please wait..." : plan.cta}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
