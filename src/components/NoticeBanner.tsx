import { Activity, CheckCircle2 } from 'lucide-react'
import type { Notice } from '../types/coupon'

type NoticeBannerProps = {
  notice: Notice | null
}

export function NoticeBanner({ notice }: NoticeBannerProps) {
  if (!notice) return null

  return (
    <div className={`notice ${notice.tone}`}>
      {notice.tone === 'success' ? <CheckCircle2 size={18} /> : <Activity size={18} />}
      <span>{notice.message}</span>
    </div>
  )
}
