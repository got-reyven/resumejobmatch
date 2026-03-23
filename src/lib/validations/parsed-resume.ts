import { z } from "zod";

export const experienceSchema = z.object({
  title: z.string(),
  company: z.string(),
  start_date: z.string().nullable(),
  end_date: z.string().nullable(),
  description: z.string().nullable(),
  highlights: z.array(z.string()).default([]),
});

export const educationSchema = z.object({
  degree: z.string(),
  institution: z.string(),
  field_of_study: z.string().nullable(),
  start_year: z.number().nullable(),
  end_year: z.number().nullable(),
});

export const certificationSchema = z.object({
  name: z.string(),
  issuer: z.string().nullable(),
  year: z.number().nullable(),
});

export const parsedResumeSchema = z.object({
  name: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  location: z.string().nullable(),
  summary: z.string().nullable(),
  skills: z.array(z.string()),
  key_responsibilities: z.array(z.string()).default([]),
  experience: z.array(experienceSchema),
  education: z.array(educationSchema),
  certifications: z.array(certificationSchema).default([]),
  languages: z.array(z.string()).default([]),
  total_years_experience: z.number().nullable(),
});

export type ParsedResume = z.infer<typeof parsedResumeSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Education = z.infer<typeof educationSchema>;
