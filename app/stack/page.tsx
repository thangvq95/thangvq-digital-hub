import React from 'react';
import type { Metadata } from 'next';
import { StackPageClient } from '@/components/stack/StackPageClient';

export const metadata: Metadata = {
  title: 'Tech Stack & Architecture — ThangVQ Digital Hub',
  description:
    'Deep dive into the full tech stack, autonomous AI workflows, CI/CD pipelines, and data architecture powering ThangVQ Digital Hub.',
  openGraph: {
    title: 'Tech Stack & Architecture — ThangVQ Digital Hub',
    description: 'Next.js 16 · NestJS · PostgreSQL · Hermes Agent · GitNexus · Cloudflare · Remotion',
  },
};

export default function StackPage() {
  return <StackPageClient />;
}
