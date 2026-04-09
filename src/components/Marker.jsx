export const Marker = ({
  children,
  color = 'bg-[#EAB308]',
  className = ''
}) => (
  <span className={`relative inline-block ${className}`}>
    <span className="relative z-10">{children}</span>
    {/* The highlight line: thick, rounded, slightly tilted and offset for a hand-drawn feel */}
    <span className={`absolute bottom-0.5 -left-0.5 right-[-9px] ${color} h-2 md:h-2.5 z-0 opacity-70 rounded-full -rotate-[0.5deg] animate-fade-in`}></span>
  </span>
);
