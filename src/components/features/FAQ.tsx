"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "Do I need to create an account to use the tool?",
    answer:
      "No. You can start matching your resume against a job description right away as a guest — no signup required. Guests get up to 3 free matches per day with basic insights.",
  },
  {
    question: "What file formats are supported for resume upload?",
    answer:
      "We accept PDF and DOCX files up to 5MB. Simply drag and drop your file or click to browse. The text is extracted and parsed automatically using AI.",
  },
  {
    question: "How does the matching work?",
    answer:
      "Our AI analyzes your resume against the job description across multiple dimensions — skills, experience, qualifications, and overall fit. You get a weighted match score plus detailed, actionable insights explaining why you match and what to improve.",
  },
  {
    question: "Can I paste a job listing URL instead of the full description?",
    answer:
      "Yes. You can either paste the full job description text or drop in a public job listing URL from sites like LinkedIn, Indeed, or company career pages. We'll extract the job details automatically.",
  },
  {
    question: "What's the difference between Jobseeker and Business plans?",
    answer:
      "Jobseeker plans are designed for individuals optimizing their own resume — you see insights like action items, ATS keyword analysis, and tailored summary suggestions. Business plans are for hiring managers and recruiters evaluating candidates — you get insights like top strengths, risk areas, and interview focus points, plus team collaboration features.",
  },
  {
    question: "Is my resume data stored or shared?",
    answer:
      "Your privacy is important to us. Resume data is processed in-memory for matching and only stored if you create an account and explicitly save your match results. We never share your data with third parties.",
  },
  {
    question: "How many insights do I get per match?",
    answer:
      "We offer 23 unique AI-powered insights across three tiers. Guests and free users get core insights like overall match score, skills breakdown, and action items. Registered free users unlock additional insights like qualification fit and section strength. Pro subscribers get access to all insights including rewrite suggestions, competitive positioning, and more.",
  },
  {
    question: "Can I compare multiple resumes against the same job?",
    answer:
      "Multi-resume comparison is available on the Business Pro plan, allowing you to compare up to 3 candidates side-by-side against the same job description with per-requirement scoring.",
  },
];

function FAQAccordionItem({ item }: { item: FAQItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left transition-colors"
        aria-expanded={open}
      >
        <span className="pr-4 text-sm font-semibold">{item.question}</span>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
          aria-hidden="true"
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-200 ease-in-out",
          open ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {item.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export function FAQ() {
  return (
    <section id="faq" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need to know about Resume Job Match.
          </p>
        </div>

        <div className="mt-12">
          {faqs.map((faq) => (
            <FAQAccordionItem key={faq.question} item={faq} />
          ))}
        </div>
      </div>
    </section>
  );
}
