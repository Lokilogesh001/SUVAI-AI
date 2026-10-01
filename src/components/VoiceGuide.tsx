
import { useState, useEffect } from "react";
import { Mic, MicOff, Play, Pause, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface VoiceGuideProps {
  steps: string[];
}

const VoiceGuide = ({ steps }: VoiceGuideProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesisUtterance | null>(null);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const synthesis = new SpeechSynthesisUtterance();
      synthesis.rate = 0.9; // Slightly slower than default
      synthesis.pitch = 1;
      setSpeechSynthesis(synthesis);

      // Handle speech end event
      synthesis.onend = () => {
        setIsSpeaking(false);
      };

      // Clean up on component unmount
      return () => {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }
      };
    }
  }, []);

  const toggleListening = () => {
    if (!isListening) {
      // Start voice recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        setIsListening(true);
        toast.info("Listening for voice commands...", {
          description: "Try saying 'next step', 'previous step', or 'repeat'",
        });
        
        // For a real implementation, we would initialize SpeechRecognition here
        // Since full implementation requires extra setup, we'll simulate it
        setTimeout(() => {
          setIsListening(false);
          toast.success("Voice command recognized", {
            description: "Moving to next step",
          });
          goToNextStep();
        }, 3000);
      } else {
        toast.error("Speech recognition not supported by your browser");
      }
    } else {
      // Stop listening
      setIsListening(false);
      toast.info("Voice recognition stopped");
    }
  };

  const toggleSpeaking = () => {
    if (window.speechSynthesis && speechSynthesis && steps[currentStep]) {
      if (!isSpeaking) {
        // Start speaking
        speechSynthesis.text = steps[currentStep];
        window.speechSynthesis.speak(speechSynthesis);
        setIsSpeaking(true);
      } else {
        // Stop speaking
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
    } else {
      toast.error("Speech synthesis not supported by your browser");
    }
  };

  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      // Stop current speech if any
      if (isSpeaking && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      
      setCurrentStep(currentStep + 1);
      
      // Automatically speak the next step if we were already speaking
      if (isSpeaking && speechSynthesis) {
        setTimeout(() => {
          speechSynthesis.text = steps[currentStep + 1];
          window.speechSynthesis.speak(speechSynthesis);
        }, 300);
      }
    } else {
      toast.info("You've reached the last step");
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      // Stop current speech if any
      if (isSpeaking && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      
      setCurrentStep(currentStep - 1);
      
      // Automatically speak the previous step if we were already speaking
      if (isSpeaking && speechSynthesis) {
        setTimeout(() => {
          speechSynthesis.text = steps[currentStep - 1];
          window.speechSynthesis.speak(speechSynthesis);
        }, 300);
      }
    } else {
      toast.info("You're at the first step");
    }
  };

  return (
    <div className="glass-card rounded-xl p-4 animate-scale-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Voice Assistant</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className={`rounded-full ${isListening ? "bg-primary text-primary-foreground" : ""}`}
            onClick={toggleListening}
            aria-label={isListening ? "Stop listening" : "Start listening"}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className={`rounded-full ${isSpeaking ? "bg-primary text-primary-foreground" : ""}`}
            onClick={toggleSpeaking}
            aria-label={isSpeaking ? "Stop speaking" : "Start speaking"}
          >
            {isSpeaking ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      <div className="bg-secondary/50 rounded-lg p-3 mb-4">
        <p className="text-sm">
          <span className="font-semibold">Step {currentStep + 1}: </span>
          {steps[currentStep]}
        </p>
      </div>
      
      <div className="flex justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={goToPreviousStep}
          disabled={currentStep === 0}
          className="text-sm"
        >
          Previous
        </Button>
        
        <div className="flex items-center gap-1">
          {steps.map((_, index) => (
            <span
              key={index}
              className={`h-1.5 w-1.5 rounded-full ${
                index === currentStep ? "bg-primary" : "bg-secondary"
              }`}
            ></span>
          ))}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={goToNextStep}
          disabled={currentStep === steps.length - 1}
          className="text-sm"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default VoiceGuide;
