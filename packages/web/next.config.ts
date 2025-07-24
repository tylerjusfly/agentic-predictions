import type { NextConfig } from "next";

const nextConfig = {
  env: {
    NEXT_PUBLIC_API_ENDPOINT: 'http://localhost:3000' ,
    NEXT_PUBLIC_POSTHOG_HOST: 'https://us.i.posthog.com',
  },
} satisfies NextConfig;

export default nextConfig;
