"use client";

import { redirect } from "next/navigation";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const pathname = usePathname();

  const menuItems = [
    { label: "Patient Registration", path: "/patientRegistration" },
    { label: "Patient Record", path: "/patientRecord" },
    { label: "Patient Summary", path: "/patientSummary" },
    { label: "Patient Verification", path: "/patientVerification" },
  ];

  return (
    <div className="backdrop-blur-md bg-black/80 text-white m-4 p-4 rounded-2xl border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.15)]">
      <div className="flex justify-between items-center">

        {/* Logo */}
        <h1 className="bg-purple-600 text-white text-3xl font-bold px-4 py-2 rounded-xl shadow-xl
          hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 cursor-pointer"
        >
          Alflah Lab
        </h1>

        {/* Menu */}
        <ul className="flex justify-around items-center gap-6 mx-4 text-lg">
          {menuItems.map((item, index) => {
            const isActive = pathname === item.path;

            return (
              <li key={index}>
                <button
                  onClick={() => redirect(item.path)}
                  className={`
                    relative cursor-pointer transition-all duration-300 px-1 
                    ${isActive ? "text-purple-400" : "text-white hover:text-purple-400"}

                    after:content-[''] after:absolute after:left-0 after:-bottom-1 
                    after:h-0.5 after:bg-purple-600 after:transition-all after:duration-200 
                    ${isActive ? "after:w-full" : "after:w-0 hover:after:w-full"}
                  `}
                >
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>

      </div>
    </div>
  );
};

export default Navbar;
