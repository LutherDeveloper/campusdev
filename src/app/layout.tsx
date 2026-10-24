import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'CAMPUSDEV — Build together',
  description: 'Temukan partner proyek, bangun portofolio, dan tumbuh bersama komunitas developer mahasiswa.',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}
