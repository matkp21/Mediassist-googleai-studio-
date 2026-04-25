import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

/**
 * FEATURE 47: Proactive Heartbeat (FCM)
 * Logic to initiate recurring check-ins and review reminders.
 */

export async function sendHeartbeatNotification(userId: string, title: string, body: string) {
  const db = getFirestore();
  const userDoc = await db.collection("users").doc(userId).get();
  const fcmToken = userDoc.data()?.fcmToken;

  if (!fcmToken) {
    console.log(`User ${userId} has no FCM token. Skipping notification.`);
    return { success: false, reason: "no_token" };
  }

  const message = {
    notification: {
      title,
      body,
    },
    token: fcmToken,
    webpush: {
      headers: {
        Urgency: "high",
      },
      notification: {
        icon: "/logo.png",
        click_action: "https://mediassistant-clinical.web.app/chat",
      },
    },
  };

  try {
    const response = await getMessaging().send(message);
    console.log(`Heartbeat sent successfully to ${userId}: ${response}`);
    return { success: true, messageId: response };
  } catch (error) {
    console.error(`Error sending heartbeat to ${userId}:`, error);
    return { success: false, error };
  }
}

/**
 * Scheduled task simulator
 */
export async function runStudyReminders() {
  const db = getFirestore();
  const now = Date.now();
  
  // Find users who haven't studied in 24 hours
  const staleUsers = await db.collection("users")
    .where("lastStudyTime", "<", now - 24 * 60 * 60 * 1000)
    .limit(10)
    .get();

  for (const doc of staleUsers.docs) {
    await sendHeartbeatNotification(
      doc.id, 
      "Dr. Mat is waiting for you", 
      "You have an unread summary on Clinical Reasoning. Let's review it now?"
    );
  }
}
