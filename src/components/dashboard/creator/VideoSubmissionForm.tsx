'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/Toaster'
import { submitVideo } from '@/app/(dashboard)/dashboard/invitations/actions'

interface VideoSubmissionFormProps {
  invitationId: string
  campaignId: string
}

export default function VideoSubmissionForm({ invitationId, campaignId }: VideoSubmissionFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [title, setTitle] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [views, setViews] = useState('')
  const [likes, setLikes] = useState('')
  const [comments, setComments] = useState('')

  const validate = () => {
    if (!youtubeUrl.trim()) return 'YouTube URL is required.'
    const regex = /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+|^https?:\/\/youtu\.be\/[\w-]+/
    if (!regex.test(youtubeUrl.trim())) {
      return 'Invalid YouTube URL. Use youtube.com/watch?v= or youtu.be/ format.'
    }
    if (!title.trim()) return 'Video title is required.'
    if (views && Number(views) < 0) return 'Views cannot be negative.'
    if (likes && Number(likes) < 0) return 'Likes cannot be negative.'
    if (comments && Number(comments) < 0) return 'Comments cannot be negative.'
    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const error = validate()
    if (error) {
      toast(error, 'error')
      return
    }

    const formData = new FormData()
    formData.set('invitationId', invitationId)
    formData.set('campaignId', campaignId)
    formData.set('youtubeUrl', youtubeUrl.trim())
    formData.set('title', title.trim())
    formData.set('thumbnailUrl', thumbnailUrl.trim())
    formData.set('views', views || '0')
    formData.set('likes', likes || '0')
    formData.set('comments', comments || '0')

    startTransition(async () => {
      const result = await submitVideo(formData)
      if (result?.error) {
        toast(result.error, 'error')
        return
      }
      toast('Video submitted successfully', 'success')
      router.push('/dashboard/invitations')
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 space-y-5 max-w-2xl">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">YouTube URL</label>
        <input
          type="url"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="https://www.youtube.com/watch?v=..."
          required
        />
        <p className="text-xs text-gray-400 mt-1">Accepts youtube.com/watch?v= or youtu.be/ links</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Video Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="My Campaign Video Review"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL (optional)</label>
        <input
          type="url"
          value={thumbnailUrl}
          onChange={(e) => setThumbnailUrl(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="https://img.youtube.com/vi/.../hqdefault.jpg"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Views</label>
          <input
            type="number"
            value={views}
            onChange={(e) => setViews(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0"
            min={0}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Likes</label>
          <input
            type="number"
            value={likes}
            onChange={(e) => setLikes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0"
            min={0}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
          <input
            type="number"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0"
            min={0}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-emerald-500/25"
        >
          {isPending ? 'Submitting...' : 'Submit Video'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/dashboard/invitations')}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
