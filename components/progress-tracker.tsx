import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle, Loader2 } from 'lucide-react'

interface Step {
  title: string
  description: string
  status: 'pending' | 'loading' | 'completed'
}

interface ProgressTrackerProps {
  steps: Step[]
  currentProgress: number
}

export function ProgressTracker({ steps, currentProgress }: ProgressTrackerProps) {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <Progress value={currentProgress} className="h-2" />
      <div className="space-y-6">
        {steps.map((step, index) => (
          <div key={step.title} className="flex items-start gap-4">
            <div className="mt-1">
              {step.status === 'completed' && (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              )}
              {step.status === 'loading' && (
                <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
              )}
              {step.status === 'pending' && (
                <Circle className="h-5 w-5 text-gray-300" />
              )}
            </div>
            <div>
              <h3 className="font-medium">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

