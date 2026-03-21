import { OnboardingModal } from '../onboarding'

interface ModeSelectorProps {
  onComplete?: () => void
}

export function ModeSelector({ onComplete }: ModeSelectorProps) {
  return <OnboardingModal onComplete={onComplete} />
}
