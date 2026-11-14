import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "Category Association Discovery Across Clustered Transaction Segments",
  description:
    "Enterprise AI platform discovering hidden product-category relationships across customer and transaction segments using K-Means, DBSCAN, PCA, and FP-Growth/Apriori.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased text-slate-900 bg-slate-50">
        <AppProvider>
          <AppShell>{children}</AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
