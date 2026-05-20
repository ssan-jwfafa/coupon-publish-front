# Coupon Publish Front

React, TypeScript, Vite 기반 쿠폰 발급 및 실시간 주문 관리 운영 화면입니다.

백엔드 프로젝트 `C:\workspace\coupon-publish`와 함께 실행합니다.

## 화면 구성

- 쿠폰 발급 현황
  - 쿠폰 생성, 조회, 삭제
  - userId 기반 쿠폰 발급
  - Redis 남은 수량 조회
  - Flink가 Redis에 반영한 발급 집계 조회
- 실시간 주문 관리
  - 주문 생성
  - 주문 목록 검색 및 상태 필터
  - 주문 상세 조회
  - 주문 상태 변경 및 완료 처리
  - 상태별 대시보드 카운트
  - 최신 주문 이벤트 5개 조회
- Kafka UI, Redis UI 바로가기

## 실행 순서

백엔드 프로젝트에서 인프라와 API 서버를 먼저 실행합니다.

```powershell
cd C:\workspace\coupon-publish
docker compose up -d
.\gradlew.bat bootRun
```

발급/주문 집계까지 확인하려면 별도 터미널에서 Flink job도 실행합니다.

```powershell
cd C:\workspace\coupon-publish
.\gradlew.bat runCouponStatisticsFlinkJob
.\gradlew.bat runOrderStatisticsFlinkJob
```

프론트 실행:

```powershell
cd C:\workspace\coupon-publish-front
npm install
npm run dev
```

기본 접속 주소:

```text
http://localhost:5173
```

## 환경 변수

개발 환경 변수는 `.env.dev`에 둡니다. `npm run dev`는 `vite --mode dev`로 실행되어 이 파일을 읽습니다.

```text
VITE_API_BASE_URL=
VITE_API_PROXY_TARGET=http://localhost:8080
VITE_KAFKA_UI_URL=http://localhost:8081
VITE_REDIS_UI_URL=http://localhost:8082
```

개발 서버에서는 `/api` 요청을 Vite proxy가 백엔드로 전달하므로 브라우저 CORS가 발생하지 않습니다.

백엔드를 `18080`으로 실행했다면:

```text
VITE_API_PROXY_TARGET=http://localhost:18080
```

배포 환경에서 API가 다른 도메인에 있다면 `VITE_API_BASE_URL`에 실제 API origin을 지정하고,
백엔드 CORS 허용 origin을 프론트 배포 주소로 설정하세요.

## 백엔드 API 연결

쿠폰 화면은 다음 API를 사용합니다.

- `GET /api/coupons`
- `POST /api/coupons`
- `GET /api/coupons/{couponId}`
- `DELETE /api/coupons/{couponId}`
- `POST /api/coupons/{couponId}/issues`
- `GET /api/coupons/{couponId}/remaining`
- `GET /api/coupons/{couponId}/statistics`

주문 화면은 다음 API를 사용합니다.

- `POST /api/orders`
- `GET /api/orders?status=&query=&page=&size=`
- `GET /api/orders/{orderId}`
- `PATCH /api/orders/{orderId}/status`
- `GET /api/orders/events?limit=5`

주문 상태 값:

- `PAYMENT_CONFIRMED`: 결제확인
- `PREPARING`: 상품준비
- `SHIPPING`: 배송중
- `COMPLETED`: 완료
- `ON_HOLD`: 보류

결제 수단 값:

- `CARD`: 카드
- `EASY_PAY`: 간편결제
- `BANK_TRANSFER`: 계좌이체

## 화면 유지

왼쪽 메뉴 선택은 URL hash에 저장됩니다.

- `#coupons`: 쿠폰 발급 현황
- `#orders`: 실시간 주문 관리

실시간 주문 관리 화면에서 새로고침해도 `#orders`가 유지되면 같은 화면으로 다시 열립니다.

## 검증

```powershell
npm run lint
npm run build
```
