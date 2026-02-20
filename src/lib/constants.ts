export const NICHE_VALUES = [
  'tech_gaming',
  'fitness_health',
  'beauty_fashion',
  'finance_business',
] as const

export type Niche = (typeof NICHE_VALUES)[number]

export const NICHE_LABELS: Record<Niche, string> = {
  tech_gaming: 'Tech & Gaming',
  fitness_health: 'Fitness & Health',
  beauty_fashion: 'Beauty & Fashion',
  finance_business: 'Finance & Business',
}

export const NICHE_OPTIONS = NICHE_VALUES.map((value) => ({
  value,
  label: NICHE_LABELS[value],
}))

export const CAMPAIGN_STATUSES = ['draft', 'active', 'completed'] as const
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number]

export const CAMPAIGN_STATUS_DRAFT: CampaignStatus = 'draft'
export const CAMPAIGN_STATUS_ACTIVE: CampaignStatus = 'active'
export const CAMPAIGN_STATUS_COMPLETED: CampaignStatus = 'completed'

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  completed: 'Completed',
}

export const CAMPAIGN_STATUS_BADGE_CLASSES: Record<CampaignStatus, string> = {
  draft: 'bg-yellow-50 text-yellow-700',
  active: 'bg-green-50 text-green-700',
  completed: 'bg-gray-100 text-gray-600',
}

export const INVITATION_STATUSES = ['pending', 'accepted', 'declined'] as const
export type InvitationStatus = (typeof INVITATION_STATUSES)[number]
export type InvitationResponseStatus = Exclude<InvitationStatus, 'pending'>

export const INVITATION_STATUS_PENDING: InvitationStatus = 'pending'
export const INVITATION_STATUS_ACCEPTED: InvitationStatus = 'accepted'
export const INVITATION_STATUS_DECLINED: InvitationStatus = 'declined'

export const INVITATION_STATUS_LABELS: Record<InvitationStatus, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  declined: 'Declined',
}

export const INVITATION_STATUS_BADGE_CLASSES: Record<InvitationStatus, string> = {
  pending: 'bg-yellow-50 text-yellow-700',
  accepted: 'bg-green-50 text-green-700',
  declined: 'bg-gray-100 text-gray-600',
}
