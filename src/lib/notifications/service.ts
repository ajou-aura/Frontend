import Constants from "expo-constants";
import { Platform } from "react-native";
import { getAuthState } from "@/src/lib/auth/store";
import { getStoredValue, setStoredValue } from "@/src/lib/storage/kv";
import { getTypeMode, listDepartments } from "@/src/features/settings/api";
import { typeTopic, userTopic } from "@/src/lib/notifications/topics";

// Firebase Messaging for foreground notifications
let messagingModule: typeof import("@react-native-firebase/messaging") | null = null;

async function getMessaging() {
  if (messagingModule) return messagingModule;
  try {
    messagingModule = await import("@react-native-firebase/messaging");
    return messagingModule;
  } catch (e) {
    console.log("[FCM] Firebase messaging not available");
    return null;
  }
}

type PermissionState = "granted" | "denied" | "unavailable" | "unknown";

type NotificationState = {
  initialized: boolean;
  deviceToken: string | null;
  permission: PermissionState;
  subscribedTopics: string[];
};

export type NotificationRoutePayload = {
  link?: string;
  type?: string;
  title?: string;
};

type NotificationsModule = typeof import("expo-notifications");
type NotificationResponse = import("expo-notifications").NotificationResponse;
type NotificationSubscription = {
  remove: () => void;
};

const STORAGE_KEY = "aura.notifications.v1";
const isExpoGo =
  Constants.executionEnvironment === "storeClient" ||
  Constants.appOwnership === "expo";
const supportsRemotePush = Platform.OS !== "web" && !isExpoGo;

let state: NotificationState = {
  initialized: false,
  deviceToken: null,
  permission: "unknown",
  subscribedTopics: []
};

let responseSubscription: NotificationSubscription | null = null;
let notificationsModulePromise: Promise<NotificationsModule | null> | null = null;
let notificationHandlerConfigured = false;

async function getNotificationsModule() {
  if (!supportsRemotePush) {
    return null;
  }

  if (!notificationsModulePromise) {
    notificationsModulePromise = import("expo-notifications");
  }

  const Notifications = await notificationsModulePromise;

  if (!Notifications || notificationHandlerConfigured) {
    return Notifications;
  }

  console.log("[FCM] Setting notification handler...");
  Notifications.setNotificationHandler({
    handleNotification: async () => {
      return {
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false
      };
    }
  });
  notificationHandlerConfigured = true;
  console.log("[FCM] Notification handler configured");

  return Notifications;
}

async function persistState() {
  await setStoredValue(STORAGE_KEY, JSON.stringify(state));
}

async function hydrateState() {
  const stored = await getStoredValue(STORAGE_KEY);
  if (!stored) {
    return;
  }

  try {
    state = {
      ...state,
      ...(JSON.parse(stored) as Partial<NotificationState>)
    };
  } catch {
    state = {
      initialized: false,
      deviceToken: null,
      permission: "unknown",
      subscribedTopics: []
    };
  }
}

export async function initNotifications() {
  if (state.initialized) {
    return;
  }

  await hydrateState();

  if (!supportsRemotePush) {
    state.permission = "unavailable";
    state.initialized = true;
    if (__DEV__ && isExpoGo) {
      console.info(
        "[notifications] Expo Go detected. Remote push registration is disabled; use a development build."
      );
    }
    await persistState();
    return;
  }

  const Notifications = await getNotificationsModule();
  if (!Notifications) {
    console.log("[FCM] Notifications module not available");
    return;
  }

  console.log("[FCM] Initializing notifications...");

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C"
    });
    console.log("[FCM] Notification channel created");
  }

  // Foreground notification received listener (expo-notifications)
  console.log("[FCM] Registering foreground listener...");
  const subscription = Notifications.addNotificationReceivedListener((notification) => {
    console.log("[FCM] ⭐ NOTIFICATION RECEIVED IN FOREGROUND:", JSON.stringify(notification, null, 2));
  });
  console.log("[FCM] Foreground listener registered:", subscription);

  // Firebase Messaging foreground handler
  const messaging = await getMessaging();
  if (messaging) {
    console.log("[FCM] Setting up Firebase messaging...");
    messaging.default().setBackgroundMessageHandler(async remoteMessage => {
      console.log("[FCM] Background message:", remoteMessage);
    });
    messaging.default().onMessage(async remoteMessage => {
      console.log("[FCM] ⭐⭐⭐ FOREGROUND MESSAGE:", JSON.stringify(remoteMessage, null, 2));
      try {
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: remoteMessage.notification?.title || "AURA",
            body: remoteMessage.notification?.body || "",
            data: remoteMessage.data,
            sound: "default",
            priority: Notifications.AndroidNotificationPriority.HIGH
          },
          trigger: null
        });
        console.log("[FCM] Local notification scheduled with id:", notificationId);

        setTimeout(async () => {
          const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
          console.log("[FCM] Scheduled notifications:", scheduledNotifications.length);
        }, 1000);
      } catch (err) {
        console.error("[FCM] Failed to show notification:", err);
      }
    });
    console.log("[FCM] Firebase messaging configured");
  }

  state.initialized = true;
  await persistState();
}

export async function requestPermission() {
  if (!supportsRemotePush) {
    state.permission = "unavailable";
    await persistState();
    return state.permission;
  }

  const Notifications = await getNotificationsModule();
  if (!Notifications) {
    state.permission = "unavailable";
    await persistState();
    return state.permission;
  }

  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) {
    state.permission = "granted";
    await persistState();
    return state.permission;
  }

  const requested = await Notifications.requestPermissionsAsync();
  state.permission = requested.granted ? "granted" : "denied";
  await persistState();
  return state.permission;
}

export async function registerForPushToken() {
  if (!supportsRemotePush) {
    state.deviceToken = null;
    await persistState();
    return null;
  }

  const Notifications = await getNotificationsModule();
  if (!Notifications) {
    return null;
  }

  try {
    const token = await Notifications.getDevicePushTokenAsync();
    state.deviceToken =
      typeof token.data === "string" ? token.data : JSON.stringify(token.data);
    await persistState();
    return state.deviceToken;
  } catch {
    return state.deviceToken;
  }
}

export function getPushToken() {
  return state.deviceToken;
}

export async function subscribeUserTopics(topics: string[]) {
  if (topics.length === 0) {
    return;
  }

  state.subscribedTopics = Array.from(new Set([...state.subscribedTopics, ...topics]));
  console.info(
    "[notifications] subscribeUserTopics queued for native FCM bridge:",
    topics
  );
  await persistState();
}

export async function unsubscribeUserTopics(topics: string[]) {
  if (topics.length === 0) {
    return;
  }

  const removal = new Set(topics);
  state.subscribedTopics = state.subscribedTopics.filter(
    (topic) => !removal.has(topic)
  );
  console.info(
    "[notifications] unsubscribeUserTopics queued for native FCM bridge:",
    topics
  );
  await persistState();
}

export async function syncNotificationSubscriptions() {
  await initNotifications();
  await requestPermission();
  await registerForPushToken();

  const auth = getAuthState();
  if (!auth.session?.user.email) {
    await unsubscribeUserTopics([...state.subscribedTopics]);
    return {
      deviceToken: state.deviceToken,
      topics: []
    };
  }

  const departments = await listDepartments().catch(() => []);
  const types = ["general", "scholarship", "dormitory", ...departments];
  const modes = await Promise.all(
    types.map((type) => getTypeMode(type).catch(() => null))
  );

  const desiredTopics = new Set<string>([userTopic(auth.session.user.email)]);
  types.forEach((type, index) => {
    if (modes[index] === "ALL") {
      desiredTopics.add(typeTopic(type));
    }
  });

  const currentTopics = new Set(state.subscribedTopics);
  const topicsToSubscribe = Array.from(desiredTopics).filter(
    (topic) => !currentTopics.has(topic)
  );
  const topicsToUnsubscribe = Array.from(currentTopics).filter(
    (topic) => !desiredTopics.has(topic)
  );

  await subscribeUserTopics(topicsToSubscribe);
  await unsubscribeUserTopics(topicsToUnsubscribe);

  return {
    deviceToken: state.deviceToken,
    topics: Array.from(desiredTopics)
  };
}

export async function clearNotificationSubscriptions() {
  await unsubscribeUserTopics([...state.subscribedTopics]);
}

function toRoutePayload(
  response: NotificationResponse | null
): NotificationRoutePayload | null {
  if (!response) {
    return null;
  }

  const data = response.notification.request.content.data as Record<
    string,
    string | undefined
  >;

  return {
    link: data.link,
    type: data.type,
    title: data.title
  };
}

export async function getInitialNotificationRoutePayload() {
  const Notifications = await getNotificationsModule();
  if (!Notifications) {
    return null;
  }

  const response = await Notifications.getLastNotificationResponseAsync();
  return toRoutePayload(response);
}

export function listenForNotificationOpen(
  listener: (payload: NotificationRoutePayload) => void
) {
  if (!supportsRemotePush) {
    return () => undefined;
  }

  let cancelled = false;

  responseSubscription?.remove();
  void getNotificationsModule().then((Notifications) => {
    if (!Notifications || cancelled) {
      return;
    }

    responseSubscription?.remove();
    responseSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const payload = toRoutePayload(response);
        if (payload) {
          listener(payload);
        }
      }
    );
  });

  return () => {
    cancelled = true;
    responseSubscription?.remove();
    responseSubscription = null;
  };
}
