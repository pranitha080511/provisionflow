import "./globals.css";

export const metadata = {
  title: "Workflow System",
  description: "Provision Flow Engine"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900">
        {children}
      </body>
    </html>
  );
}