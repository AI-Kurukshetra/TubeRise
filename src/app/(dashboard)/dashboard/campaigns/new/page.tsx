import CampaignForm from '@/components/dashboard/brand/CampaignForm'

export const metadata = { title: 'New Campaign | TubeRise' }

export default function NewCampaignPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Create Campaign</h2>
        <p className="text-sm text-gray-500 mt-1">Set the details for your new sponsorship.</p>
      </div>
      <CampaignForm />
    </div>
  )
}
