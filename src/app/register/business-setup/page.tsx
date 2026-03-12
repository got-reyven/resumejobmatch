"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import { INDUSTRIES, EMPLOYEE_RANGES } from "@/lib/constants/industries";
import { createClient } from "@/lib/supabase/client";

const MAX_INDUSTRIES = 3;

export default function BusinessSetupPage() {
  const router = useRouter();

  const [companyName, setCompanyName] = useState("");
  const [employeeRange, setEmployeeRange] = useState("");
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [industrySearch, setIndustrySearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredIndustries = INDUSTRIES.filter(
    (ind) =>
      ind.toLowerCase().includes(industrySearch.toLowerCase()) &&
      !selectedIndustries.includes(ind)
  );

  function addIndustry(industry: string) {
    if (selectedIndustries.length >= MAX_INDUSTRIES) return;
    setSelectedIndustries((prev) => [...prev, industry]);
    setIndustrySearch("");
    setShowDropdown(false);
  }

  function removeIndustry(industry: string) {
    setSelectedIndustries((prev) => prev.filter((i) => i !== industry));
  }

  const isValid =
    companyName.trim().length > 0 &&
    employeeRange.length > 0 &&
    selectedIndustries.length >= 1;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Session expired. Please sign in again.");
        return;
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ user_type: "business" })
        .eq("id", user.id);

      if (profileError) {
        setError(profileError.message);
        return;
      }

      const { data: orgs } = await supabase
        .from("organizations")
        .select("id")
        .eq("owner_id", user.id)
        .limit(1);

      let orgId: string;

      if (orgs && orgs.length > 0) {
        orgId = orgs[0].id;
        const { error: updateError } = await supabase
          .from("organizations")
          .update({
            name: companyName.trim(),
            company_size: employeeRange,
            industry: selectedIndustries,
          })
          .eq("id", orgId);

        if (updateError) {
          setError(updateError.message);
          return;
        }
      } else {
        const { data: newOrg, error: insertError } = await supabase
          .from("organizations")
          .insert({
            owner_id: user.id,
            name: companyName.trim(),
            company_size: employeeRange,
            industry: selectedIndustries,
          })
          .select("id")
          .single();

        if (insertError) {
          setError(insertError.message);
          return;
        }
        orgId = newOrg.id;

        await supabase.from("organization_members").insert({
          organization_id: orgId,
          user_id: user.id,
          role: "owner",
          joined_at: new Date().toISOString(),
          status: "active",
        });
      }

      router.push("/dashboard");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-xl border bg-background p-8 shadow-sm">
      <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <Building2 className="h-6 w-6 text-primary" />
      </div>

      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          Business Account Setup
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tell us about your company to personalize your experience
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label
            htmlFor="companyName"
            className="mb-1.5 block text-sm font-medium"
          >
            Company Name <span className="text-destructive">*</span>
          </label>
          <Input
            id="companyName"
            type="text"
            placeholder="Acme Inc."
            required
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <label
            htmlFor="employeeRange"
            className="mb-1.5 block text-sm font-medium"
          >
            Number of Employees <span className="text-destructive">*</span>
          </label>
          <select
            id="employeeRange"
            required
            value={employeeRange}
            onChange={(e) => setEmployeeRange(e.target.value)}
            disabled={loading}
            className={cn(
              "h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none",
              "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
              !employeeRange && "text-muted-foreground"
            )}
          >
            <option value="" disabled>
              Select range
            </option>
            {EMPLOYEE_RANGES.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Industry <span className="text-destructive">*</span>
            <span className="ml-1 font-normal text-muted-foreground">
              (select up to {MAX_INDUSTRIES})
            </span>
          </label>

          {selectedIndustries.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {selectedIndustries.map((ind) => (
                <Badge key={ind} variant="secondary" className="gap-1 pr-1">
                  {ind}
                  <button
                    type="button"
                    onClick={() => removeIndustry(ind)}
                    className="rounded-full p-0.5 hover:bg-muted-foreground/20"
                    aria-label={`Remove ${ind}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {selectedIndustries.length < MAX_INDUSTRIES && (
            <div className="relative">
              <Input
                type="text"
                placeholder="Search industries..."
                value={industrySearch}
                onChange={(e) => {
                  setIndustrySearch(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                disabled={loading}
              />
              {showDropdown && filteredIndustries.length > 0 && (
                <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border bg-background py-1 shadow-md">
                  {filteredIndustries.map((ind) => (
                    <li key={ind}>
                      <button
                        type="button"
                        className="w-full px-3 py-1.5 text-left text-sm hover:bg-accent"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => addIndustry(ind)}
                      >
                        {ind}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={!isValid || loading}>
          {loading ? "Setting up..." : "Proceed to Dashboard"}
        </Button>
      </form>
    </div>
  );
}
