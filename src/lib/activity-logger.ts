const API = "/api/activity/log"

type ActivityType =
  | "cycle_logged" | "cycle_removed"
  | "water_drank"
  | "plant_planted" | "plant_watered" | "plant_removed" | "coins_earned"
  | "hug_sent"
  | "mood_logged"
  | "memory_added" | "memory_removed"
  | "gratitude_added" | "gratitude_removed"
  | "wish_made" | "wish_removed"
  | "milestone_added" | "milestone_removed"
  | "care_task_done"
  | "sticker_earned"
  | "surprise_opened"
  | "breath_session"
  | "reason_revealed"
  | "gallery_favorited"
  | "message_read"
  | "anniversary_set"
  | "affirmation_saved"
  | "quote_saved"
  | "bear_patted"
  | "sound_toggled"
  | "accessory_equipped"
  | "incoming_hug"

export function logActivity(type: ActivityType, detail?: string) {
  fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, detail: detail || null, ts: Date.now() }),
  }).catch(() => {})
}
