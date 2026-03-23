# AURA Frontend RN

`Frontend main` 웹 코드를 기준으로 기능과 정보 구조를 유지하면서 `Expo + React Native + expo-router`로 재구성한 프론트입니다. `legacy-web-src/`, `legacy-web-public/`는 이식 기준 확인용으로 남겨두었고, 실제 앱 코드는 `app/`, `src/` 아래에 있습니다.

## Stack

- Expo 55
- React Native 0.83
- expo-router
- Android / iOS / web preview 동시 지원
- 백엔드 인증 계약 기준: `Backend test/RN`

## 실행

1. `npm install`
2. `.env.example`을 참고해서 실제 값은 `.env`에 작성
3. 개발 서버 실행

```bash
npm run start
npm run android
npm run ios
npm run web
```

## Android 네이티브 로그인 검증

`Expo Go`는 이 프로젝트의 `aura://oauth-callback` 커스텀 스킴 검증에 적합하지 않습니다. 네이티브 OAuth는 development build로 확인해야 합니다.

최초 1회:

```bash
npm run android:dev
```

이 명령은 Android 네이티브 개발용 앱을 에뮬레이터에 설치합니다.

설치 후 평소 실행:

```bash
npm run start:dev
```

기본값은 Android emulator에서 안정적으로 붙도록 `LAN/IPv4` 기준입니다.

필요하면 다른 터미널에서 앱 열기:

```bash
npm run android:connect
```

`localhost` 모드가 꼭 필요할 때만 아래를 사용합니다.

```bash
npm run start:dev:localhost
```

로컬 백엔드 + Android emulator 조합에서는 아래도 함께 필요합니다.

```bash
adb reverse tcp:8080 tcp:8080
```

주의:

- development build 화면에서 `Fetch development servers`가 비어 있어도 이상이 아닙니다.
- 입력창에 `exp://127.0.0.1:8081`를 직접 넣으면 Expo Go가 가로채는 경우가 있으니 권장하지 않습니다.
- Android emulator에서는 `npm run start:dev` 후 `npm run android:connect` 순서가 가장 안정적입니다.

그리고 backend OAuth redirect URI는 `http://localhost:8080/api/auth/callback` 이어야 합니다. `10.0.2.2`를 Google OAuth redirect URI로 넣으면 안 됩니다.

에뮬레이터에 예전 AURA 앱이 남아 있으면 `aura://oauth-callback` 처리 앱 선택창이 뜰 수 있습니다. 이 경우 기존 패키지를 제거하고 dev build 하나만 남겨야 합니다.

## 환경 변수

`.env.example`은 샘플입니다. 실제 반영 파일은 `.env`입니다.

```dotenv
EXPO_PUBLIC_API_BASE_URL=
EXPO_PUBLIC_API_SCHEME=http
EXPO_PUBLIC_API_PORT=8080
EXPO_PUBLIC_API_ANDROID_EMULATOR_HOST=10.0.2.2
EXPO_PUBLIC_API_IOS_SIMULATOR_HOST=localhost
EXPO_PUBLIC_API_WEB_HOST=localhost
EXPO_PUBLIC_API_DEVICE_HOST=192.168.0.10
EXPO_PUBLIC_ABOUT_PAGE_URL=
```

- `EXPO_PUBLIC_API_BASE_URL`
  최우선 강제 override입니다. 지정하면 플랫폼 분기 없이 이 값을 사용합니다.
- `EXPO_PUBLIC_API_SCHEME`, `EXPO_PUBLIC_API_PORT`
  resolver가 플랫폼별 host를 조합할 때 사용합니다.
- `EXPO_PUBLIC_API_ANDROID_EMULATOR_HOST`
  기본값은 `10.0.2.2`입니다.
- `EXPO_PUBLIC_API_IOS_SIMULATOR_HOST`
  기본값은 `localhost`입니다.
- `EXPO_PUBLIC_API_WEB_HOST`
  web preview 기본값입니다. 지정하지 않으면 현재 호스트 또는 `localhost`를 사용합니다.
- `EXPO_PUBLIC_API_DEVICE_HOST`
  실제 기기에서 사용할 LAN IP입니다. 가장 권장되는 실기기 설정입니다.
- `EXPO_PUBLIC_ABOUT_PAGE_URL`
  설정 화면의 `앱 소개` 링크입니다.

## Base URL 정책

코드 적용 지점:

- `app.config.ts`
- `src/config/env.ts`
- `src/lib/api/client.ts`

해석 순서:

1. `EXPO_PUBLIC_API_BASE_URL`이 있으면 그대로 사용
2. Android emulator면 `10.0.2.2`
3. iOS simulator면 `localhost`
4. web preview면 `EXPO_PUBLIC_API_WEB_HOST` 또는 현재 호스트
5. physical device면 `EXPO_PUBLIC_API_DEVICE_HOST`
6. physical device에서 위 값이 없으면 Expo manifest host를 fallback으로 사용

환경별 권장값:

- Android emulator: `EXPO_PUBLIC_API_DEVICE_HOST` 없이 기본값 사용 가능
- iOS simulator: 같은 머신에서 백엔드를 띄우면 기본 `localhost` 사용 가능
- web preview: 브라우저가 접근 가능한 호스트를 `EXPO_PUBLIC_API_WEB_HOST` 또는 `EXPO_PUBLIC_API_BASE_URL`로 지정
- physical device: 반드시 같은 LAN에서 접근 가능한 IP를 `EXPO_PUBLIC_API_DEVICE_HOST`에 명시

개발 모드에서는 최종 해석된 API base URL이 콘솔에 `[env] Resolved API base URL: ...` 형태로 출력됩니다.

## 인증 흐름

네이티브 인증은 `Backend test/RN` 계약에 맞춥니다.

1. `GET /api/auth/google?mode=app`
2. 백엔드 redirect: `aura://oauth-callback?code=...`
3. 앱에서 `POST /api/auth/app/exchange { code }`
4. `accessToken`, `refreshToken`, `signUp`, `user` 저장
5. `signUp=true`면 `select-department`, 아니면 `notice`
6. API `401`이면 `POST /api/auth/refresh { refreshToken }` 1회 재시도
7. 로그아웃 시 `POST /api/auth/logout { refreshToken }`

web preview는 개발용 검수 흐름으로 유지합니다.

1. `GET /api/auth/google?mode=web`
2. 백엔드 cookie 세션 완료
3. 프론트가 `POST /api/auth/refresh`를 cookie 기반으로 호출해 bearer 토큰 부트스트랩
4. 이후 요청은 동일하게 bearer 토큰 사용

## 라우트

- `/login`
- `/oauth-callback`
- `/select-department`
- `/notice`
- `/bookmark`
- `/settings`
- `/auth/error`

초기 분기는 `session`, `profile`, `needsOnboarding`, bootstrapping 상태를 기준으로 처리합니다.

## 주요 화면 이식 범위

- 로그인 화면 문구/구성 유지
- 공지 탭, 학과 선택, 키워드 칩, 검색, 북마크 토글, 페이지네이션
- 북마크 목록과 공지 이동
- 설정의 계정 정보, 학과, 키워드, 알림 설정, 로그아웃
- 신규 사용자 온보딩용 학과 선택 및 기본 알림 설정
- WebView bridge 제거 후 외부 링크는 시스템 브라우저 또는 web 새 탭으로 대체

## 알림/푸시 준비

- `initNotifications`
- `requestPermission`
- `registerForPushToken`
- `subscribeUserTopics`
- `unsubscribeUserTopics`
- `syncNotificationSubscriptions`
- 알림 열기 시 공지 화면 라우팅

현재 FCM topic subscribe/unsubscribe 자체는 구조와 호출 지점만 정리되어 있고, 실제 네이티브 전송 브리지는 후속 작업입니다.

## 검증

```bash
npm run typecheck
npm run contract:check
npx expo export --platform android
npx expo export --platform ios
npx expo export --platform web
```

## 참고 문서

- `docs/migration.md`

## TODO

- 실제 dev build에서 Google 로그인 완료 후 기기별 deep link 동작 확인
- 네이티브 FCM SDK 연동 후 topic subscribe/unsubscribe를 서버 등록 흐름까지 연결
- 백엔드 실서버 또는 팀 공용 개발 서버 기준 `.env` 템플릿 추가 정리
