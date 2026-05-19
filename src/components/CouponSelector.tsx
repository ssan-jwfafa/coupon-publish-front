import { Loader2, RefreshCcw, Trash2 } from 'lucide-react'
import type { Coupon, RequestState } from '../types/coupon'
import { PanelTitle } from './PanelTitle'

type CouponSelectorProps = {
  coupons: Coupon[]
  deletingCouponId: number | null
  refreshState: RequestState
  selectedCouponId: string
  selectedId: number
  onDeleteCoupon: (couponId: number) => void
  onLoadCoupon: () => void
  onSelectCoupon: (coupon: Coupon) => void
  onSelectedCouponIdChange: (couponId: string) => void
}

export function CouponSelector({
  coupons,
  deletingCouponId,
  refreshState,
  selectedCouponId,
  selectedId,
  onDeleteCoupon,
  onLoadCoupon,
  onSelectCoupon,
  onSelectedCouponIdChange,
}: CouponSelectorProps) {
  return (
    <section className="panel">
      <PanelTitle icon={<RefreshCcw size={18} />} title="쿠폰 선택" action="Load" />
      <div className="load-row">
        <label>
          Coupon ID
          <input
            inputMode="numeric"
            value={selectedCouponId}
            onChange={(event) => onSelectedCouponIdChange(event.target.value)}
            placeholder="1"
          />
        </label>
        <button className="icon-button" disabled={refreshState === 'loading'} onClick={onLoadCoupon} type="button">
          {refreshState === 'loading' ? <Loader2 className="spin" size={18} /> : <RefreshCcw size={18} />}
        </button>
      </div>

      <div className="coupon-list">
        {coupons.length === 0 ? (
          <p className="empty-text">생성하거나 조회한 쿠폰이 여기에 표시됩니다.</p>
        ) : (
          coupons.map((coupon) => {
            const isDeleting = deletingCouponId === coupon.couponId

            return (
              <div
                className={coupon.couponId === selectedId ? 'coupon-item active' : 'coupon-item'}
                key={coupon.couponId}
              >
                <button
                  className="coupon-select-button"
                  disabled={isDeleting}
                  onClick={() => onSelectCoupon(coupon)}
                  type="button"
                >
                  <span>#{coupon.couponId}</span>
                  <strong>{coupon.name}</strong>
                  <small>{coupon.maxCount.toLocaleString()} max</small>
                </button>
                <button
                  aria-label={`쿠폰 #${coupon.couponId} 삭제`}
                  className="coupon-delete-button"
                  disabled={isDeleting}
                  onClick={() => onDeleteCoupon(coupon.couponId)}
                  type="button"
                >
                  {isDeleting ? <Loader2 className="spin" size={16} /> : <Trash2 size={16} />}
                </button>
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}
