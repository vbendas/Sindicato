"use client";

type Step = "details" | "timeline" | "review";

const STEPS: { id: Step; label: string; number: number }[] = [
  { id: "details", label: "Your Case", number: 1 },
  { id: "timeline", label: "Timeline", number: 2 },
  { id: "review", label: "Review", number: 3 },
];

const STEP_ORDER: Step[] = ["details", "timeline", "review"];

interface StepIndicatorProps {
  currentStep: Step;
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  const currentIndex = STEP_ORDER.indexOf(currentStep);

  return (
    <div className="mb-8 flex justify-center">
      <div className="flex items-center justify-center gap-0">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;
          const isUpcoming = index > currentIndex;

          return (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                  <div
                    className={`w-7 h-7 flex items-center justify-center text-xs font-bold font-[family-name:var(--font-barlow)] transition-colors ${
                      isCompleted || isActive
                        ? "bg-sindicato-warm-white text-sindicato-charcoal"
                        : "bg-white/10 text-sindicato-warm-white/50"
                    }`}
                  >
                  {isCompleted ? (
                    <svg
                      className="w-3.5 h-3.5"
                      viewBox="0 0 14 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M2.5 7L5.5 10L11.5 4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="square"
                      />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>
                <span
                    className={`text-xs uppercase tracking-wider font-[family-name:var(--font-barlow)] font-bold transition-colors hidden sm:block ${
                      isUpcoming
                        ? "text-sindicato-warm-white/40"
                        : "text-sindicato-warm-white/70"
                    }`}
                  >
                  {step.label}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                  <div
                    className={`h-px w-12 sm:w-20 mx-3 transition-colors ${
                      index < currentIndex
                        ? "bg-sindicato-warm-white/60"
                        : "bg-white/10"
                    }`}
                  />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
