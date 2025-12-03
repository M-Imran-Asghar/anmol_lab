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
      className={`border-2  rounded-md font-bold  ${className}`}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
