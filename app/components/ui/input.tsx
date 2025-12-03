interface InputProps {
  type: string;
  placeholder: string;
  value?: string;
  name?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

const Input: React.FC<InputProps> = ({
  type,
  placeholder,
  value,
  name,
  onChange,
  className,
}) => {
  return (
    <div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        name={name}
        onChange={onChange}
        className={`border-2 p-2 rounded-md outline-none ${className}`}
      />
    </div>
  );
};

export default Input;