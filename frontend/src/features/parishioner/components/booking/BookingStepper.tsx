import StepCircle from "./StepCircle";

interface Props {
  currentStep: number;
  steps: string[];
}

export default function BookingStepper({ currentStep, steps }: Props) {
  return (
    <div className="overflow-x-auto">
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
  );
}
