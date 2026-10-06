import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  async redirects() {
    return [{ source: "/travel", destination: "/", permanent: true }];
  },
  images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
  env: {
    NEXT_PUBLIC_SUPABASE_URL:
      process.env["NEXT_PUBLIC_SUPABASE_URL"] ?? process.env["SUPABASE_URL"],
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"] ??
      process.env["SUPABASE_PUBLISHABLE_KEY"],
  },
};

export default nextConfig;
