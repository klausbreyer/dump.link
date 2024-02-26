interface ExplanationProps {
  children: React.ReactNode;
}
const Explanation: React.FC<ExplanationProps> = ({ children }) => {
  return <p className="mt-1 text-sm italic text-slate-500">{children}</p>;
};

export default Explanation;
