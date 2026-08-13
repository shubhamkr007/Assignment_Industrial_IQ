import { Suspense } from "react";
import { getDataset } from "@/lib/data";
import { uniqueModels, uniqueSources } from "@/lib/metrics/filters";
import { AppShell } from "@/components/shell/AppShell";
import type { Metadata } from "next";
import { Geist, Instrument_Serif } from "next/font/google";
import Loading from "@/app/loading";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument",
});

export const metadata: Metadata = {
  title: "DealerPulse — Performance dashboard",
  description:
    "Sales performance, funnel analytics, and recommended actions for a five-branch Toyota group.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const dataset = getDataset();
  const managers = dataset.sales_reps.filter((rep) => rep.role === "branch_manager");

  return (
    <html lang="en">
      <body className={`${geist.variable} ${instrument.variable} antialiased`}>
        <Suspense
          fallback={
            <div className="min-h-screen bg-paper px-4 py-8 lg:px-8">
              <Loading />
            </div>
          }
        >
          <AppShell
            branches={dataset.branches}
            managers={managers}
            reps={dataset.sales_reps}
            sources={uniqueSources(dataset)}
            models={uniqueModels(dataset)}
          >
            {children}
          </AppShell>
        </Suspense>
      </body>
    </html>
  );
}
