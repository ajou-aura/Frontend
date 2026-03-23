# AURA RN Migration Notes

## 기준 소스

- 프론트 기준: `Frontend main` 웹 구현
- 백엔드 기준: `Backend test/RN`
- 참조 보존: `legacy-web-src/`, `legacy-web-public/`

## 구조 매핑

| 기존 웹 기준 | RN 재구성 위치 |
| --- | --- |
| `pages/LoginPage` | `src/screens/LoginScreen.tsx` |
| `pages/NoticePage` | `src/screens/NoticeScreen.tsx` |
| `pages/BookMarkPage` | `src/screens/BookmarkScreen.tsx` |
| `pages/SettingsPage` | `src/screens/SettingsScreen.tsx` |
| `pages/SelectDepartmentPage` | `src/screens/SelectDepartmentScreen.tsx` |
| `components/NoticeCard` | `src/components/notice/NoticeCard.tsx` |
| `components/ChipCollapse`, `CollapsibleTabs`, `Switch` | `src/components/common/*` |
| `services/*` | `src/features/*/api.ts`, `src/lib/api/*`, `src/lib/auth/*` |

## 라우팅 재구성

- `app/_layout.tsx`
  앱 전체 초기화, 인증 hydrate, 알림 오픈 라우팅 처리
- `app/(tabs)/_layout.tsx`
  공지 / 북마크 / 설정 탭
- `app/login.tsx`
- `app/oauth-callback.tsx`
- `app/select-department.tsx`
- `app/auth/error.tsx`

## 웹 전용 구현 대체

- `window.ReactNativeWebView`, `window.AURA`, `aura:*` 이벤트 의존 제거
- 브라우저 overlay WebView 공지 열기
  RN에서는 `expo-web-browser`, web에서는 새 탭으로 대체
- 웹 `select`
  RN modal 기반 선택 UI로 대체
- CSS collapse animation
  RN collapsible card/tab 컴포넌트로 대체
- absolute footer/search overlay
  RN AppBar와 ScrollView 구조로 재배치

기능과 정보 구조는 유지했고, UI 표현만 플랫폼에 맞춰 교체했습니다.

## 인증 계약 정렬 포인트

- `GET /auth/google?mode=app|web`
- `POST /auth/app/exchange`
- `POST /auth/refresh`
- `POST /auth/logout`
- `signUp` 값 기준 온보딩 분기
- `Authorization: Bearer <accessToken>` 사용
- 401 발생 시 refresh 1회 후 원요청 재시도
- logout 시 refreshToken 전달

## Base URL 정렬 포인트

- 실제 계산 위치: `src/config/env.ts`
- Expo extra 주입 위치: `app.config.ts`
- 최종 fetch 사용 위치: `src/lib/api/client.ts`
- Android emulator: `10.0.2.2`
- iOS simulator: `localhost`
- web preview: 브라우저 접근 가능한 host
- physical device: `EXPO_PUBLIC_API_DEVICE_HOST` 권장
- fallback: Expo host manifest

## 알림 구조 정리

- topic naming은 backend RN 브랜치와 맞춰 `user-*`, `type-*`
- 로그인/로그아웃/설정 저장 후 `syncNotificationSubscriptions()` 호출
- 알림 오픈 payload의 `link`를 받아 공지 화면으로 라우팅
- require cycle 방지를 위해 `lib/notifications/service.ts`에 단일 진입점 구성

## 남은 TODO

- 실제 FCM native SDK 연동
- push token 서버 등록 API가 확정되면 프론트 저장 흐름 추가
- 팀 개발 환경별 `.env` preset 정리
- 기기별 deep link QA
