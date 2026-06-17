import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Le Server Action ricevono upload di immagini fino a 10 MB: alziamo il
    // limite di default (1 MB), altrimenti il form di generazione fallirebbe.
    serverActions: {
      bodySizeLimit: "15mb",
    },
  },
};

export default nextConfig;
