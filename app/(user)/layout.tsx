// import type { Metadata } from "next";

import Navbar from "@/app/components/navbar/navbar";




// export const metadata: Metadata = {
//   title: "AlFalah Lab & Blood Bank",
//   description: "A Laboratory where 100% Accuracy of your blood test and We also provide All Group of blood in emergancy",
// };

export default function DashbordLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    
      <div>
        <Navbar />
        {children}
      </div>
  
  );
}
