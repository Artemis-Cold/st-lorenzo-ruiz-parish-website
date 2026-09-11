import StepCircle from "./StepCircle";

interface Props {
  currentStep: number;
  steps: string[];
}

export default function BookingStepper({ currentStep, steps }: Props) {
  const activeLabel = steps[currentStep - 1] ?? steps[0];
  const progress = Math.min((currentStep / steps.length) * 100, 100);

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm xl:hidden">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Step {currentStep} of {steps.length}
            </p>
            <p className="mt-1 truncate font-semibold text-[#B22222]">
              {activeLabel}
            </p>
          </div>
          <span className="shrink-0 text-sm font-semibold text-gray-500">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-[#B22222] transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="hidden overflow-x-auto xl:block">
        <div className="my-8 flex min-w-max items-center">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center">
              <StepCircle
                number={index + 1}
                label={step}
                active={currentStep === index + 1}
                completed={currentStep > index + 1}
              />

              {index < steps.length - 1 && (
                <div
                  className={`mx-5 h-1 w-16 rounded-full

                ${currentStep > index + 1 ? "bg-[#B22222]" : "bg-gray-300"}
                `}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
