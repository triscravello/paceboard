"use server";
import { revalidatePath } from "next/cache";
import { createActivity, deleteActivity, updateActivity } from "@/lib/activity-service";
import { getCurrentViewer } from "@/lib/session";
function activityInput(formData: FormData) {
  return { title: formData.get("title"), activityType: formData.get("activityType"), distanceMiles: formData.get("distanceMiles"), durationSeconds: formData.get("durationSeconds"), elevationGainFeet: formData.get("elevationGainFeet"), recordedAt: formData.get("recordedAt") };
}
export async function createActivityAction(formData: FormData): Promise<void> {
  const result = await createActivity((await getCurrentViewer())?.id ?? null, activityInput(formData));
  if (!result.ok) throw new Error(result.reason);
  revalidatePath("/");
}
export async function updateActivityAction(formData: FormData): Promise<void> {
  const result = await updateActivity((await getCurrentViewer())?.id ?? null, String(formData.get("activityId") ?? ""), activityInput(formData));
  if (!result.ok) throw new Error(result.reason);
  revalidatePath("/");
}
export async function deleteActivityAction(formData: FormData): Promise<void> {
  const result = await deleteActivity((await getCurrentViewer())?.id ?? null, String(formData.get("activityId") ?? ""));
  if (!result.ok) throw new Error(result.reason);
  revalidatePath("/");
}