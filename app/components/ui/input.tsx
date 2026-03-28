import React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input: React.FC<InputProps> = ({ className = "", type = "text", ...rest }) => {
  return (
    <input
      type={type}
      className={`soft-input w-full px-4 py-3 text-slate-800 placeholder:text-slate-400 ${className}`}
      {...rest}
    />
  );
};

export default Input;
