import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  className = "",
  children,
  onClick,
  ...rest
}) => {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-transparent bg-white/90 px-4 py-2.5 font-bold text-slate-700 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_35px_rgba(15,23,42,0.12)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-200 disabled:translate-y-0 disabled:opacity-60 disabled:shadow-none disabled:hover:shadow-none ${className}`}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
