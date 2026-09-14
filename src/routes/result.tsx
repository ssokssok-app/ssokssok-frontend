import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/result')({
  component: ResultPage,
})

function ResultPage() {
  return null
}
