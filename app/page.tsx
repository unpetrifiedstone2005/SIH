"use client";

import { Inter } from "next/font/google";
import Link from "next/link";
import {
  DatabaseZap,
  BrainCircuit,
  BellRing,
  Map,
  LineChart,
  AlertTriangle,
  Layers,
  ServerCog,
  ArrowRight,
} from "lucide-react";

// shadcn/ui
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const inter = Inter({ subsets: ["latin"] });

export default function Page() {
  return (
    <main className={`${inter.className} min-h-screen bg-slate-50 text-slate-900`}>
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-slate-900" aria-hidden />
            <span className="text-sm font-semibold tracking-tight">
              Rockfall AI
            </span>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <a href="#features" className="text-slate-600 hover:text-slate-900 transition">
              Features
            </a>
            <a href="#how-it-works" className="text-slate-600 hover:text-slate-900 transition">
              How It Works
            </a>
            <a href="#technology" className="text-slate-600 hover:text-slate-900 transition">
              Technology
            </a>
          </nav>

          {/* Primary CTA */}
          <Button asChild>
            <Link href="/dashboard">
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Abstract background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-24 h-[32rem] w-[32rem] rounded-full bg-gradient-to-br from-sky-200 via-indigo-100 to-transparent blur-3xl opacity-70" />
          <div className="absolute -bottom-40 -right-40 h-[36rem] w-[36rem] rounded-full bg-gradient-to-tr from-slate-200 via-cyan-100 to-transparent blur-3xl opacity-60" />
          <svg className="absolute inset-0 h-full w-full opacity-[0.12]" aria-hidden>
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-4">
              Precision Engineering Meets Predictive Intelligence
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Predict. Prevent. Protect.
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              Leveraging AI to transform slope stability monitoring and ensure
              operational safety in open-pit mines. Built for geotechnical
              teams who demand accuracy, speed, and confidence.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/dashboard">
                  Launch Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#how-it-works">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight">A Three-Step Approach to Safety</h2>
          <p className="mt-2 text-slate-600">From continuous data to actionable insight—designed for mission-critical decisions.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100">
                  <DatabaseZap className="h-5 w-5 text-slate-700" aria-hidden />
                </div>
                <CardTitle>Data Ingestion</CardTitle>
              </div>
              <CardDescription>
                Continuously stream multi-source data from geotechnical sensors, drones, and environmental monitors.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-slate-600">
                Structured pipelines ensure integrity and timeliness across all data feeds.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100">
                  <BrainCircuit className="h-5 w-5 text-slate-700" aria-hidden />
                </div>
                <CardTitle>AI Analysis</CardTitle>
              </div>
              <CardDescription>
                Predictive models analyze complex patterns to forecast potential rockfall events before they happen.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-slate-600">
                Robust validation and continuous learning maintain performance in dynamic conditions.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100">
                  <BellRing className="h-5 w-5 text-slate-700" aria-hidden />
                </div>
                <CardTitle>Real-time Alerts</CardTitle>
              </div>
              <CardDescription>
                Receive instant, actionable alerts with detailed risk assessments, sent directly to your team.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-slate-600">
                Integrate with your incident response workflows to accelerate time-to-action.
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Engineered for Precision and Reliability</h2>
          <p className="mt-2 text-slate-600">Built for harsh environments and high-stakes operations.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card className="bg-slate-900 text-slate-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-800">
                  <Map className="h-5 w-5 text-slate-200" aria-hidden />
                </div>
                <CardTitle>Real-time Risk Mapping</CardTitle>
              </div>
              <CardDescription className="text-slate-300">
                High-resolution, continuously updating risk visualizations across your site.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-300">
                Focus attention where it matters most with clear spatial context.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 text-slate-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-800">
                  <LineChart className="h-5 w-5 text-slate-200" aria-hidden />
                </div>
                <CardTitle>Predictive Forecasting</CardTitle>
              </div>
              <CardDescription className="text-slate-300">
                Anticipate emerging risks with short-term and seasonal projections.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-300">
                Scenario analysis supports planning and resource allocation.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 text-slate-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-800">
                  <AlertTriangle className="h-5 w-5 text-slate-200" aria-hidden />
                </div>
                <CardTitle>Automated Alerts</CardTitle>
              </div>
              <CardDescription className="text-slate-300">
                Configurable thresholds, clear severity levels, and audit-ready logs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-300">
                Deliver alerts to the right people at the right time—every time.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 text-slate-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-800">
                  <Layers className="h-5 w-5 text-slate-200" aria-hidden />
                </div>
                <CardTitle>Multi-Source Data Integration</CardTitle>
              </div>
              <CardDescription className="text-slate-300">
                Unify disparate sources for a single, consistent operational picture.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-300">
                Sensor networks, UAV imagery, and environmental feeds—seamlessly combined.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Technology */}
      <section id="technology" className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Built with Industry-Leading Technology</h2>
            <p className="mt-2 text-slate-600">Modern tooling for performance, security, and reliability.</p>
          </div>
          <div className="hidden md:flex h-10 w-10 items-center justify-center rounded-md bg-slate-100">
            <ServerCog className="h-5 w-5 text-slate-700" aria-hidden />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">Next.js</Badge>
          <Badge variant="secondary">React</Badge>
          <Badge variant="secondary">PostgreSQL</Badge>
          <Badge variant="secondary">Prisma</Badge>
          <Badge variant="secondary">Python</Badge>
          <Badge variant="secondary">PyTorch</Badge>
          <Badge variant="secondary">TensorFlow</Badge>
        </div>

        {/* Optional: Frequently Asked Questions */}
        <div className="mt-10">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How does the system ensure data reliability?</AccordionTrigger>
              <AccordionContent className="text-slate-600">
                Redundant ingestion paths and integrity checks validate each stream prior to analysis.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Can it integrate with our existing safety workflows?</AccordionTrigger>
              <AccordionContent className="text-slate-600">
                Yes. The platform supports webhook-based triggers and common incident management tools.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>What about performance in remote operations?</AccordionTrigger>
              <AccordionContent className="text-slate-600">
                Edge-friendly design and efficient data encoding maintain responsiveness over constrained links.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative mx-auto max-w-none border-t border-slate-200 bg-slate-100/60">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
          <div className="rounded-xl bg-white p-8 shadow-sm ring-1 ring-slate-200 md:p-10">
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div>
                <h3 className="text-2xl font-bold tracking-tight">
                  Ready to Enhance Your Site&apos;s Safety?
                </h3>
                <p className="mt-2 max-w-2xl text-slate-600">
                  Put predictive intelligence to work for your team and make data-driven safety decisions with confidence.
                </p>
              </div>
              <Button size="lg" asChild>
                <Link href="/dashboard">Explore the Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer (minimal) */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} Rockfall AI. All rights reserved.</span>
          <div className="hidden sm:flex items-center gap-4">
            <a href="#features" className="hover:text-slate-700">Features</a>
            <a href="#how-it-works" className="hover:text-slate-700">How It Works</a>
            <a href="#technology" className="hover:text-slate-700">Technology</a>
          </div>
        </div>
      </footer>
    </main>
  );
}