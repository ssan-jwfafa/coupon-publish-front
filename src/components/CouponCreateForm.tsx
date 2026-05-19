import { Loader2, Plus } from 'lucide-react'
import type { FormEvent } from 'react'
import type { CouponFormState, RequestState, SetCouponForm } from '../types/coupon'
import { PanelTitle } from './PanelTitle'

type CouponCreateFormProps = {
  couponForm: CouponFormState
  createState: RequestState
  onChange: SetCouponForm
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export function CouponCreateForm({
  couponForm,
  createState,
  onChange,
  onSubmit,
}: CouponCreateFormProps) {
  return (
    <form className="panel form-panel" onSubmit={onSubmit}>
      <PanelTitle icon={<Plus size={18} />} title="쿠폰 생성" action="Create" />
      <label>
        쿠폰명
        <input value={couponForm.name} onChange={(event) => onChange({ ...couponForm, name: event.target.value })} />
      </label>
      <label>
        최대 발급 수량
        <input
          min={1}
          type="number"
          value={couponForm.maxCount}
          onChange={(event) => onChange({ ...couponForm, maxCount: Number(event.target.value) })}
        />
      </label>
      <div className="two-col">
        <label>
          시작 시간
          <input
            type="datetime-local"
            value={couponForm.startAt}
            onChange={(event) => onChange({ ...couponForm, startAt: event.target.value })}
          />
        </label>
        <label>
          종료 시간
          <input
            type="datetime-local"
            value={couponForm.endAt}
            onChange={(event) => onChange({ ...couponForm, endAt: event.target.value })}
          />
        </label>
      </div>
      <button className="primary-button" disabled={createState === 'loading'} type="submit">
        {createState === 'loading' ? <Loader2 className="spin" size={18} /> : <Plus size={18} />}
        쿠폰 생성
      </button>
    </form>
  )
}
