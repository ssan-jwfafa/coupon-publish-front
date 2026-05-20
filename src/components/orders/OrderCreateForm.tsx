import { PlusCircle } from 'lucide-react'
import type { Dispatch, SetStateAction, SubmitEventHandler } from 'react'
import type { RequestState } from '../../types/coupon'
import type { OrderCreatePayload, PaymentMethod } from '../../types/order'
import { PanelTitle } from '../PanelTitle'

type OrderCreateFormProps = {
  amountInput: string
  createState: RequestState
  orderForm: OrderCreatePayload
  onAmountInputChange: (value: string) => void
  onFormChange: Dispatch<SetStateAction<OrderCreatePayload>>
  onSubmit: SubmitEventHandler<HTMLFormElement>
}

export function OrderCreateForm({
  amountInput,
  createState,
  orderForm,
  onAmountInputChange,
  onFormChange,
  onSubmit,
}: OrderCreateFormProps) {
  return (
    <form className="panel order-create-form" onSubmit={onSubmit}>
      <PanelTitle icon={<PlusCircle size={18} />} title="주문 생성" action="POST" />
      <label>
        고객명
        <input
          required
          value={orderForm.customerName}
          onChange={(event) => onFormChange((form) => ({ ...form, customerName: event.target.value }))}
        />
      </label>
      <label>
        상품명
        <input
          required
          value={orderForm.productName}
          onChange={(event) => onFormChange((form) => ({ ...form, productName: event.target.value }))}
        />
      </label>
      <div className="two-col">
        <label>
          결제
          <select
            value={orderForm.paymentMethod}
            onChange={(event) => onFormChange((form) => ({ ...form, paymentMethod: event.target.value as PaymentMethod }))}
          >
            <option value="CARD">카드</option>
            <option value="EASY_PAY">간편결제</option>
            <option value="BANK_TRANSFER">계좌이체</option>
          </select>
        </label>
        <label>
          금액
          <input
            min={1}
            required
            type="number"
            value={amountInput}
            onChange={(event) => onAmountInputChange(event.target.value)}
          />
        </label>
      </div>
      <label>
        쿠폰 코드
        <input
          value={orderForm.couponCode}
          onChange={(event) => onFormChange((form) => ({ ...form, couponCode: event.target.value }))}
        />
      </label>
      <label>
        주소
        <input
          required
          value={orderForm.address}
          onChange={(event) => onFormChange((form) => ({ ...form, address: event.target.value }))}
        />
      </label>
      <button className="primary-button" disabled={createState === 'loading'} type="submit">
        <PlusCircle size={16} />
        {createState === 'loading' ? '생성 중' : '주문 생성'}
      </button>
    </form>
  )
}
