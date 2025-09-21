
import React, { useState, useLayoutEffect } from 'react';
import type { TourStep } from '../types';
import { useTranslation } from '../locales/i18n';

interface InteractiveTourProps {
  steps: TourStep[];
  isOpen: boolean;
  onClose: () => void;
  stepIndex: number;
  setStepIndex: (index: number) => void;
}

export const InteractiveTour: React.FC<InteractiveTourProps> = ({ steps, isOpen, onClose, stepIndex, setStepIndex }) => {
  const { t } = useTranslation();
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  const isLastStep = stepIndex === steps.length - 1;
  const currentStep = steps[stepIndex];

  useLayoutEffect(() => {
    if (!isOpen || !currentStep) return;

    const setupStep = () => {
      const element = document.querySelector(currentStep.target);
      if (element) {
        const rect = element.getBoundingClientRect();
        setHighlightRect(rect);
        element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      } else if (currentStep.target === 'body') {
        setHighlightRect(null); // For centered modal
      }
    };

    if (currentStep.action) {
      currentStep.action();
      // Wait for view changes to settle before measuring
      setTimeout(setupStep, 300);
    } else {
      setupStep();
    }
  }, [isOpen, stepIndex, steps]);

  if (!isOpen) {
    return null;
  }

  const handleNext = () => {
    if (!isLastStep) {
      setStepIndex(stepIndex + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    }
  };

  const getTooltipPosition = () => {
    if (!highlightRect) { // Centered
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }
    
    const top = highlightRect.bottom + 12;
    // Basic boundary detection
    if (top + 150 > window.innerHeight) { // 150 is an estimated tooltip height
        return { bottom: window.innerHeight - highlightRect.top + 12, left: highlightRect.left };
    }

    return { top, left: highlightRect.left };
  };

  return (
    <div className="fixed inset-0 z-50">
      <div 
        className="fixed inset-0 bg-black/60 animate-fade-in"
        style={{
            clipPath: highlightRect ? `path(evenodd, "M0 0 H ${window.innerWidth} V ${window.innerHeight} H 0 Z M ${highlightRect.x - 6} ${highlightRect.y - 6} H ${highlightRect.right + 6} V ${highlightRect.bottom + 6} H ${highlightRect.x - 6} Z")` : 'none'
        }}
        onClick={onClose}
      ></div>
      
      <div
        className="fixed bg-white rounded-lg shadow-2xl p-5 max-w-sm w-full animate-slide-up-fade z-[51] transition-all duration-300 ease-in-out"
        style={getTooltipPosition()}
      >
        <h3 className="text-lg font-bold text-slate-800 mb-2">{currentStep.title}</h3>
        <p className="text-slate-600 text-sm mb-4">{currentStep.content}</p>
        
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-slate-500">
            {stepIndex + 1} / {steps.length}
          </span>
          <div className="flex gap-2">
            {stepIndex > 0 && (
              <button onClick={handlePrev} className="bg-slate-200 text-slate-700 font-medium py-1 px-3 rounded-md text-sm hover:bg-slate-300 transition-colors">
                {t('tourPrevious')}
              </button>
            )}
            <button onClick={handleNext} className="bg-blue-600 text-white font-bold py-1 px-3 rounded-md text-sm hover:bg-blue-700 transition-colors">
              {isLastStep ? t('tourFinish') : t('tourNext')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};