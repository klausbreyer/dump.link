interface SelectProps {
  title: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ value: string; label: string; selected?: boolean }>;
  className?: string;
  errorMessage?: string;
}

const Select: React.FC<SelectProps> = ({
  title,
  name,
  value,
  onChange,
  options,
  className,
  errorMessage,
}) => {
  return (
    <div className="">
      <label htmlFor={name} className="block text-sm font-bold text-slate-700">
        {title}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={`relative  overflow-hidden bg-white border-b-2 rounded-sm shadow-md select-text focus:outline outline-2 outline-indigo-500 border-slate-500 hover:border-slate-600 focus:border-slate-600 ${className} ${errorMessage ? "border-rose-500" : ""}`}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            selected={option.selected}
          >
            {option.label}
          </option>
        ))}
      </select>
      {errorMessage && (
        <p className="mt-1 text-sm text-rose-500">{errorMessage}</p>
      )}
    </div>
  );
};

export default Select;
