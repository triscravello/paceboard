import "./globals.css";

export const metadata = {
  title: "Paceboard",
  description: "A typed and tested social running feed",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}