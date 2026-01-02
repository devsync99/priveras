"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, CheckCircle, Circle } from "lucide-react";

export interface PIAStep {
  label: string;
  value: string;
  isAccepted: boolean;
}

interface PIAStepsAccordionProps {
  projectId: string;
  steps: PIAStep[];
  onStepClick: (label: string, value: string) => void;
  isExpanded: boolean;
  isCompleted?: boolean;
}

export function PIAStepsAccordion({
  projectId,
  steps,
  onStepClick,
  isExpanded,
  isCompleted = false,
}: PIAStepsAccordionProps) {
  const [isOpen, setIsOpen] = useState(true);

  const handleStepClick = (step: PIAStep) => {
    if (!isCompleted) {
      onStepClick(step.label, step.value);
    }
  };

  // Count accepted steps
  const acceptedCount = steps.filter((step) => step.isAccepted).length;
  const totalCount = steps.length;

  return (
    <div className="border-t border-gray-200">
      {/* Accordion Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-100 transition-colors text-left group"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            PIA Steps
          </span>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            {acceptedCount}/{totalCount}
          </span>
        </div>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-gray-500 transition-transform" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-500 transition-transform" />
        )}
      </button>

      {/* Accordion Content */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "max-h-150 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="pb-2 space-y-0.5">
          {steps.map((step, index) => (
            <button
              key={step.value}
              onClick={() => handleStepClick(step)}
              disabled={isCompleted}
              className={`
                w-full flex items-start gap-2 px-3 py-2 
                transition-all duration-200 text-left group
                ${
                  isCompleted
                    ? "cursor-not-allowed opacity-60"
                    : "hover:bg-blue-50 hover:pl-4"
                }
                ${step.isAccepted ? "bg-green-50/50" : ""}
              `}
            >
              {/* Status Indicator */}
              <div className="mt-0.5 shrink-0">
                {step.isAccepted ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <Circle className="w-4 h-4 text-gray-300 group-hover:text-blue-400 transition-colors" />
                )}
              </div>

              {/* Step Label */}
              <span
                className={`
                  text-xs flex-1 leading-relaxed
                  ${
                    step.isAccepted
                      ? "text-gray-700 font-medium"
                      : isCompleted
                      ? "text-gray-500"
                      : "text-gray-600 group-hover:text-blue-700"
                  }
                  transition-colors
                `}
              >
                {step.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
