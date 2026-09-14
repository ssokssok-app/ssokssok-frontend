import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/documents/')({
  component: DocumentsPage,
})

function DocumentsPage() {
  return null
}
