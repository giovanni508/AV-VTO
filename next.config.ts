import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Gli upload immagine vanno direttamente browser -> Supabase Storage, quindi
   * le Server Action ricevono solo testo: nessun limite di body da alzare. */
};

export default nextConfig;
