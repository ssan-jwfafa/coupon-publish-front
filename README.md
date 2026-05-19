# Coupon Publish Front

React, TypeScript, Vite 기반 쿠폰 발급 운영 화면입니다.

## 실행 순서

백엔드 프로젝트에서 인프라와 API 서버를 먼저 실행합니다.

```powershell
cd C:\workspace\coupon-publish
docker compose up -d
.\gradlew.bat bootRun
```

발급 집계까지 확인하려면 별도 터미널에서 Flink job도 실행합니다.

```powershell
cd C:\workspace\coupon-publish
.\gradlew.bat runCouponStatisticsFlinkJob
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

`.env.example`을 참고해 필요하면 `.env`를 만듭니다.

```text
VITE_API_BASE_URL=
VITE_API_PROXY_TARGET=http://localhost:8080
VITE_KAFKA_UI_URL=http://localhost:8081
VITE_REDIS_UI_URL=http://localhost:8082
```

백엔드를 `18080`으로 실행했다면:

```text
VITE_API_PROXY_TARGET=http://localhost:18080
```

개발 서버에서는 `/api` 요청을 Vite proxy가 백엔드로 전달하므로 브라우저 CORS가 발생하지 않습니다.
배포 환경에서 API가 다른 도메인에 있다면 `VITE_API_BASE_URL`에 실제 API origin을 지정하고,
백엔드 CORS 허용 origin을 프론트 배포 주소로 설정하세요.

## 화면 기능

- 쿠폰 생성
- couponId 기반 쿠폰 조회
- couponId 기반 쿠폰 삭제
- userId 기반 쿠폰 발급
- Redis 남은 수량 조회
- Flink가 Redis에 반영한 발급 집계 조회
- Kafka UI, Redis UI 바로가기

## 검증

```powershell
npm run lint
npm run build
```
