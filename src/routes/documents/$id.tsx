import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/documents/$id')({
  component: DocumentDetailPage,
})

function DocumentDetailPage() {
  return null
}
