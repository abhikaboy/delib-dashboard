import { createFileRoute } from '@tanstack/react-router'
import { ApplicantDetailPage } from '../components/ApplicantDetailPage'

export const Route = createFileRoute('/applicant/$name')({
  component: ApplicantDetailPage,
})

