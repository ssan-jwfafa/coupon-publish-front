import { useEffect, useMemo, useState } from 'react'
import type { SubmitEventHandler } from 'react'
import {
  createCoupon,
  deleteCoupon,
  getCoupon,
  getCoupons,
  getRemaining,
  getStatistics,
  isAlreadyIssuedError,
  issueCoupon,
} from './api/coupons'
import './App.css'
import { CouponCreateForm } from './components/CouponCreateForm'
import { CouponIssueForm } from './components/CouponIssueForm'
import { CouponMetrics } from './components/CouponMetrics'
import { CouponSelector } from './components/CouponSelector'
import { CouponStatusPanel } from './components/CouponStatusPanel'
import { NoticeBanner } from './components/NoticeBanner'
import { Sidebar } from './components/Sidebar'
import { OrderManagement } from './components/OrderManagement'
import type { AppView } from './components/Sidebar'
import type { Coupon, CouponIssue, Notice, Remaining, RequestState, Statistics } from './types/coupon'
import { createInitialCouponForm } from './utils/couponForm'
import { toApiDateTime } from './utils/date'

function getViewFromHash(): AppView {
  return window.location.hash === '#orders' ? 'orders' : 'coupons'
}

function App() {
  const [activeView, setActiveView] = useState<AppView>(getViewFromHash)
  const [couponForm, setCouponForm] = useState(createInitialCouponForm)
  const [selectedCouponId, setSelectedCouponId] = useState('')
  const [userId, setUserId] = useState('user-1')
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [currentCoupon, setCurrentCoupon] = useState<Coupon | null>(null)
  const [lastIssue, setLastIssue] = useState<CouponIssue | null>(null)
  const [remaining, setRemaining] = useState<Remaining | null>(null)
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [notice, setNotice] = useState<Notice | null>({
    tone: 'info',
    message: '인프라와 API 서버를 실행한 뒤 쿠폰을 생성하세요.',
  })
  const [createState, setCreateState] = useState<RequestState>('idle')
  const [issueState, setIssueState] = useState<RequestState>('idle')
  const [refreshState, setRefreshState] = useState<RequestState>('idle')
  const [deletingCouponId, setDeletingCouponId] = useState<number | null>(null)

  const issuedPercent = useMemo(() => {
    if (!currentCoupon || !remaining) return 0
    const issued = currentCoupon.maxCount - remaining.remainingCount
    return Math.max(0, Math.min(100, Math.round((issued / currentCoupon.maxCount) * 100)))
  }, [currentCoupon, remaining])

  const selectedId = Number(selectedCouponId || currentCoupon?.couponId)

  useEffect(() => {
    function handleHashChange() {
      setActiveView(getViewFromHash())
    }

    window.addEventListener('hashchange', handleHashChange)

    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [])

  useEffect(() => {
    if (!notice) return

    const timerId = window.setTimeout(() => {
      setNotice(null)
    }, 10_000)

    return () => {
      window.clearTimeout(timerId)
    }
  }, [notice])

  useEffect(() => {
    let ignore = false

    async function loadInitialCoupons() {
      setRefreshState('loading')
      try {
        const couponList = await getCoupons()

        if (ignore) return

        setCoupons(couponList)
        setCouponForm(createInitialCouponForm(couponList))

        const firstCoupon = couponList[0]
        if (!firstCoupon) {
          setNotice({ tone: 'info', message: '등록된 쿠폰이 없습니다. 새 쿠폰을 생성하세요.' })
          return
        }

        setCurrentCoupon(firstCoupon)
        setSelectedCouponId(String(firstCoupon.couponId))

        const [remainingResult, statisticsResult] = await Promise.all([
          getRemaining(firstCoupon.couponId),
          getStatistics(firstCoupon.couponId),
        ])

        if (ignore) return

        setRemaining(remainingResult)
        setStatistics(statisticsResult)
        setNotice({ tone: 'success', message: `쿠폰 ${couponList.length}개를 불러왔습니다.` })
      } catch (error) {
        if (!ignore) {
          setNotice({ tone: 'error', message: error instanceof Error ? error.message : '쿠폰 목록 조회 실패' })
        }
      } finally {
        if (!ignore) {
          setRefreshState('idle')
        }
      }
    }

    loadInitialCoupons()

    return () => {
      ignore = true
    }
  }, [])

  async function refreshDashboard(couponId = selectedId) {
    if (!couponId) return
    setRefreshState('loading')
    try {
      const [remainingResult, statisticsResult] = await Promise.all([
        getRemaining(couponId),
        getStatistics(couponId),
      ])
      setRemaining(remainingResult)
      setStatistics(statisticsResult)
    } catch (error) {
      setNotice({ tone: 'error', message: error instanceof Error ? error.message : '현황 조회 실패' })
    } finally {
      setRefreshState('idle')
    }
  }

  const handleCreateCoupon: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()
    setCreateState('loading')
    try {
      const coupon = await createCoupon({
        name: couponForm.name,
        maxCount: Number(couponForm.maxCount),
        startAt: toApiDateTime(couponForm.startAt),
        endAt: toApiDateTime(couponForm.endAt),
      })
      const nextCoupons = [coupon, ...coupons.filter((item) => item.couponId !== coupon.couponId)]
      setCoupons(nextCoupons)
      setCurrentCoupon(coupon)
      setSelectedCouponId(String(coupon.couponId))
      setLastIssue(null)
      setCouponForm(createInitialCouponForm(nextCoupons))
      setNotice({ tone: 'success', message: `쿠폰 #${coupon.couponId}이 생성되었습니다.` })
      await refreshDashboard(coupon.couponId)
    } catch (error) {
      setNotice({ tone: 'error', message: error instanceof Error ? error.message : '쿠폰 생성 실패' })
    } finally {
      setCreateState('idle')
    }
  }

  async function handleLoadCoupon() {
    if (!selectedId) {
      setNotice({ tone: 'error', message: '조회할 couponId를 입력하세요.' })
      return
    }
    setRefreshState('loading')
    try {
      const coupon = await getCoupon(selectedId)
      const nextCoupons = [coupon, ...coupons.filter((item) => item.couponId !== coupon.couponId)]
      setCurrentCoupon(coupon)
      setCoupons(nextCoupons)
      setCouponForm(createInitialCouponForm(nextCoupons))
      setNotice({ tone: 'success', message: `쿠폰 #${coupon.couponId}을 불러왔습니다.` })
      await refreshDashboard(coupon.couponId)
    } catch (error) {
      setNotice({ tone: 'error', message: error instanceof Error ? error.message : '쿠폰 조회 실패' })
    } finally {
      setRefreshState('idle')
    }
  }

  const handleIssueCoupon: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()
    if (!selectedId) {
      setNotice({ tone: 'error', message: '먼저 쿠폰을 생성하거나 couponId를 입력하세요.' })
      return
    }
    setIssueState('loading')
    try {
      const issue = await issueCoupon(selectedId, userId)
      setLastIssue(issue)
      setNotice({ tone: 'success', message: `${issue.userId}에게 쿠폰이 발급되었습니다.` })
      window.setTimeout(() => refreshDashboard(selectedId), 450)
      await refreshDashboard(selectedId)
    } catch (error) {
      if (isAlreadyIssuedError(error)) {
        setNotice({ tone: 'error', message: `${userId}님은 이미 이 쿠폰을 발급받았습니다.` })
      } else {
        setNotice({ tone: 'error', message: error instanceof Error ? error.message : '쿠폰 발급 실패' })
      }
    } finally {
      setIssueState('idle')
    }
  }

  async function handleDeleteCoupon(couponId: number) {
    setDeletingCouponId(couponId)
    try {
      await deleteCoupon(couponId)
      const nextCoupons = coupons.filter((item) => item.couponId !== couponId)
      setCoupons(nextCoupons)
      setCouponForm(createInitialCouponForm(nextCoupons))
      if (currentCoupon?.couponId === couponId) {
        setCurrentCoupon(null)
        setSelectedCouponId('')
        setLastIssue(null)
        setRemaining(null)
        setStatistics(null)
      }
      setNotice({ tone: 'success', message: `쿠폰 #${couponId}이 삭제되었습니다.` })
    } catch (error) {
      setNotice({ tone: 'error', message: error instanceof Error ? error.message : '쿠폰 삭제 실패' })
    } finally {
      setDeletingCouponId(null)
    }
  }

  function handleSelectCoupon(coupon: Coupon) {
    setSelectedCouponId(String(coupon.couponId))
    setCurrentCoupon(coupon)
    refreshDashboard(coupon.couponId)
  }

  function handleViewChange(view: AppView) {
    setActiveView(view)
    window.history.replaceState(null, '', `#${view}`)
  }

  return (
    <main className="app-shell">
      <Sidebar activeView={activeView} onViewChange={handleViewChange} />

      <section className="workspace">
        <header className="topbar">
          <div>
            <span className="eyebrow">Operations Console</span>
            <h1>{activeView === 'coupons' ? '쿠폰 발급 현황' : '실시간 주문 관리'}</h1>
          </div>
          {activeView === 'coupons' ? (
            <NoticeBanner notice={notice} />
          ) : (
            <div className="notice success">주문 접수, 결제 확인, 배송 상태를 실시간 운영 흐름으로 확인합니다.</div>
          )}
        </header>

        {activeView === 'coupons' ? (
          <>
            <CouponMetrics currentCoupon={currentCoupon} remaining={remaining} statistics={statistics} />

            <section className="content-grid">
              <CouponCreateForm
                couponForm={couponForm}
                createState={createState}
                onChange={setCouponForm}
                onSubmit={handleCreateCoupon}
              />

              <CouponSelector
                coupons={coupons}
                deletingCouponId={deletingCouponId}
                refreshState={refreshState}
                selectedCouponId={selectedCouponId}
                selectedId={selectedId}
                onDeleteCoupon={handleDeleteCoupon}
                onLoadCoupon={handleLoadCoupon}
                onSelectCoupon={handleSelectCoupon}
                onSelectedCouponIdChange={setSelectedCouponId}
              />

              <CouponIssueForm
                issueState={issueState}
                lastIssue={lastIssue}
                userId={userId}
                onSubmit={handleIssueCoupon}
                onUserIdChange={setUserId}
              />

              <CouponStatusPanel
                currentCoupon={currentCoupon}
                issuedPercent={issuedPercent}
                refreshState={refreshState}
                selectedId={selectedId}
                onRefresh={() => refreshDashboard()}
              />
            </section>
          </>
        ) : (
          <OrderManagement />
        )}
      </section>
    </main>
  )
}

export default App
