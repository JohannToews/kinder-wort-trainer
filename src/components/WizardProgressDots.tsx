interface WizardProgressDotsProps {
  currentStep: number;
  totalSteps: number;
}

const WizardProgressDots = ({ currentStep, totalSteps }: WizardProgressDotsProps) => {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1;
        const isActive = step === currentStep;
        const isPast = step < currentStep;

        return (
          <div
            key={step}
            className={`
              rounded-full transition-all duration-200
              ${isActive
                ? "w-2.5 h-2.5 bg-[#E8863A]"
                : isPast
                  ? "w-2 h-2 bg-[#E8863A]/40 border border-[#E8863A]"
                  : "w-2 h-2 bg-gray-200"
              }
            `}
          />
        );
      })}
    </div>
  );
};

export default WizardProgressDots;
