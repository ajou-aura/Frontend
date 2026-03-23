import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function exists(file) {
  return fs.existsSync(path.join(root, file));
}

const files = {
  routes: read("src/lib/api/routes.ts"),
  authApi: read("src/features/auth/api.ts"),
  authService: read("src/lib/auth/service.ts"),
  apiClient: read("src/lib/api/client.ts"),
  env: read("src/config/env.ts"),
  notifications: read("src/lib/notifications/service.ts"),
  tabsLayout: read("app/(tabs)/_layout.tsx")
};

const checks = [
  {
    name: "google auth route",
    pass: /google:\s*"\/auth\/google"/.test(files.routes)
  },
  {
    name: "app exchange route",
    pass: /appExchange:\s*"\/auth\/app\/exchange"/.test(files.routes)
  },
  {
    name: "refresh route",
    pass: /refresh:\s*"\/auth\/refresh"/.test(files.routes)
  },
  {
    name: "logout route",
    pass: /logout:\s*"\/auth\/logout"/.test(files.routes)
  },
  {
    name: "native auth url mode=app",
    pass: /openAuthSessionAsync\(\s*getGoogleAuthUrl\("app"\),\s*"aura:\/\/oauth-callback"/s.test(
      files.authService
    )
  },
  {
    name: "web auth url mode=web",
    pass: /window\.location\.assign\(getGoogleAuthUrl\("web"\)\)/.test(
      files.authService
    )
  },
  {
    name: "app exchange request body",
    pass: /requestApi<AppExchangeResponse,\s*\{\s*code:\s*string\s*\}>\(AUTH_ROUTES\.appExchange/s.test(
      files.authApi
    )
  },
  {
    name: "signUp onboarding route split",
    pass: /return exchanged\.signUp \? "\/select-department" : "\/notice";/.test(
      files.authService
    )
  },
  {
    name: "refresh uses refreshToken",
    pass: /refreshAuthTokens\(current\.session\.refreshToken\)/.test(
      files.authService
    )
  },
  {
    name: "401 retry guard",
    pass: /response\.status === 401[\s\S]*!attemptedRefresh[\s\S]*refreshHandler/.test(
      files.apiClient
    )
  },
  {
    name: "logout uses backend refreshToken contract",
    pass: /logoutFromBackend\(refreshToken\)/.test(files.authService)
  },
  {
    name: "android emulator host strategy",
    pass: /"10\.0\.2\.2"/.test(files.env)
  },
  {
    name: "ios simulator host strategy",
    pass: /EXPO_PUBLIC_API_IOS_SIMULATOR_HOST/.test(files.env)
  },
  {
    name: "physical device host strategy",
    pass: /EXPO_PUBLIC_API_DEVICE_HOST/.test(files.env)
  },
  {
    name: "dev API base URL logging",
    pass: /\[env\] Resolved API base URL:/.test(files.env)
  },
  {
    name: "notification init function",
    pass: /export async function initNotifications\(\)/.test(files.notifications)
  },
  {
    name: "notification permission function",
    pass: /export async function requestPermission\(\)/.test(files.notifications)
  },
  {
    name: "notification token registration function",
    pass: /export async function registerForPushToken\(\)/.test(
      files.notifications
    )
  },
  {
    name: "notification subscribe function",
    pass: /export async function subscribeUserTopics\(topics: string\[\]\)/.test(
      files.notifications
    )
  },
  {
    name: "notification unsubscribe function",
    pass: /export async function unsubscribeUserTopics\(topics: string\[\]\)/.test(
      files.notifications
    )
  },
  {
    name: "notification open listener",
    pass: /export function listenForNotificationOpen\(/.test(files.notifications)
  },
  {
    name: "notice tab route exists",
    pass: /name="notice"/.test(files.tabsLayout)
  },
  {
    name: "bookmark tab route exists",
    pass: /name="bookmark"/.test(files.tabsLayout)
  },
  {
    name: "settings tab route exists",
    pass: /name="settings"/.test(files.tabsLayout)
  }
];

const requiredFiles = [
  "app/login.tsx",
  "app/oauth-callback.tsx",
  "app/select-department.tsx",
  "app/(tabs)/notice.tsx",
  "app/(tabs)/bookmark.tsx",
  "app/(tabs)/settings.tsx",
  "src/config/env.ts",
  "src/lib/api/client.ts",
  "src/lib/auth/service.ts",
  "src/lib/notifications/service.ts"
];

let failed = 0;

console.log("AURA RN contract check");

for (const file of requiredFiles) {
  const ok = exists(file);
  console.log(`${ok ? "PASS" : "FAIL"} file ${file}`);
  if (!ok) {
    failed += 1;
  }
}

for (const check of checks) {
  console.log(`${check.pass ? "PASS" : "FAIL"} ${check.name}`);
  if (!check.pass) {
    failed += 1;
  }
}

if (failed > 0) {
  console.error(`\n${failed} contract check(s) failed.`);
  process.exit(1);
}

console.log("\nAll contract checks passed.");
