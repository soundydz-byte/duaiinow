import { PrescriptionDetailClient } from "./client"

export default async function PrescriptionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const id = resolvedParams.id

  return <PrescriptionDetailClient prescriptionId={id} />
}

