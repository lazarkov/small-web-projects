import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle, Loader2 } from "lucide-react"

interface Step {
  title: string
  description: string
  status: "pending" | "loading" | "completed"
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
        {steps.map((step, index) => {
          // Skip "Fetch Videos" step if it comes right after "Connect Facebook"
          if (index > 0 && step.title === "Fetch Videos" && steps[index - 1].title === "Connect Facebook") {
            return null
          }

          // For "Connect Facebook" step, combine its description with "Fetch Videos"
          const description =
            step.title === "Connect Facebook" && index + 1 < steps.length && steps[index + 1].title === "Fetch Videos"
              ? `${step.description} and automatically fetch your YouTube videos`
              : step.description

          // Determine status for combined step
          const status =
            step.title === "Connect Facebook" && index + 1 < steps.length && steps[index + 1].title === "Fetch Videos"
              ? steps[index + 1].status === "loading"
                ? "loading"
                : step.status === "completed" && steps[index + 1].status === "completed"
                  ? "completed"
                  : step.status
              : step.status

          return (
            <div key={step.title} className="flex items-start gap-4">
              <div className="mt-1">
                {status === "completed" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                {status === "loading" && <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />}
                {status === "pending" && <Circle className="h-5 w-5 text-gray-300" />}
              </div>
              <div>
                <h3 className="font-medium">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
