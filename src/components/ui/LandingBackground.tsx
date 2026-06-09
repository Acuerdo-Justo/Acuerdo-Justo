export function LandingBackground() {
  const orbs = [
    '-left-48 top-[4%] bg-brand-light/70',
    '-right-44 top-[17%] bg-accent-light/65',
    'left-[12%] top-[31%] bg-accent-light/55',
    'right-[8%] top-[43%] bg-brand-light/65',
    '-left-40 top-[57%] bg-brand-light/60',
    '-right-36 top-[69%] bg-accent-light/60',
    'left-[16%] top-[81%] bg-accent-light/55',
    'right-[12%] top-[91%] bg-brand-light/65',
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-white" aria-hidden="true">
      {orbs.map((position) => (
        <span key={position} className={`absolute h-72 w-72 rounded-full blur-3xl sm:h-96 sm:w-96 lg:h-[30rem] lg:w-[30rem] ${position}`} />
      ))}
    </div>
  );
}
