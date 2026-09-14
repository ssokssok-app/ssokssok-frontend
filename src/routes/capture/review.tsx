import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/capture/review')({
  component: CaptureReviewPage,
})

function CaptureReviewPage() {
  return null
}
