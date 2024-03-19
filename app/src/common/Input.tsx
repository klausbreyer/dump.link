import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  title: string;
  errorMessage?: string;
}

const Input: React.FC<InputProps> = ({
  name,
  title,
  errorMessage,
  className,
  ...props
}) => {
  return (
    <div className="">
      <label htmlFor={name} className="block text-sm font-bold text-slate-700">
        {title}
      </label>
      <input
        id={name}
        name={name}
        className={`${className} relative overflow-hidden bg-white border-b-2 rounded-sm shadow-md select-text focus:outline outline-2 outline-indigo-500 border-slate-500 hover:border-slate-600 focus:border-slate-600  ${errorMessage ? "border-rose-500" : ""}`}
        {...props}
      />
      {errorMessage && (
        <p className="mt-1 text-sm text-rose-500">{errorMessage}</p>
      )}
    </div>
  );
};

export default Input;
