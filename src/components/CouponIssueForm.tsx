import { Loader2, Send, UserRound } from 'lucide-react'
import type { FormEvent } from 'react'
import type { CouponIssue, RequestState } from '../types/coupon'
import { formatDateTime } from '../utils/date'
import { PanelTitle } from './PanelTitle'

type CouponIssueFormProps = {
  issueState: RequestState
  lastIssue: CouponIssue | null
  userId: string
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onUserIdChange: (userId: string) => void
}

export function CouponIssueForm({
  issueState,
  lastIssue,
  userId,
  onSubmit,
  onUserIdChange,
}: CouponIssueFormProps) {
  return (
    <form className="panel form-panel" onSubmit={onSubmit}>
      <PanelTitle icon={<Send size={18} />} title="쿠폰 발급" action="Issue" />
      <label>
        사용자 ID
        <div className="input-with-icon">
          <UserRound size={18} />
          <input value={userId} onChange={(event) => onUserIdChange(event.target.value)} />
        </div>
      </label>
      <button className="primary-button" disabled={issueState === 'loading'} type="submit">
        {issueState === 'loading' ? <Loader2 className="spin" size={18} /> : <Send size={18} />}
        발급 요청
      </button>

      <div className="last-issue">
        <span className="eyebrow">Last Issue</span>
        {lastIssue ? (
          <>
            <strong>{lastIssue.userId}</strong>
            <span>
              #{lastIssue.couponIssueId} · {formatDateTime(lastIssue.issuedAt)}
            </span>
          </>
        ) : (
          <span>아직 발급 이력이 없습니다.</span>
        )}
      </div>
    </form>
  )
}
