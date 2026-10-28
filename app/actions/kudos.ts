"use server";
import { revalidatePath } from "next/cache";
import { giveKudos, removeKudos } from "@/lib/kudos-service";
import { getCurrentViewer } from "@/lib/session";
export async function giveKudosAction(formData: FormData): Promise<void> { const viewer = await getCurrentViewer(); if (!viewer) throw new Error("unauthorized"); const activityId = String(formData.get("activityId") ?? ""); if (!activityId) throw new Error("invalid"); await giveKudos(viewer.id, activityId); revalidatePath("/"); }
export async function removeKudosAction(formData: FormData): Promise<void> { const viewer = await getCurrentViewer(); if (!viewer) throw new Error("unauthorized"); const activityId = String(formData.get("activityId") ?? ""); if (!activityId) throw new Error("invalid"); await removeKudos(viewer.id, activityId); revalidatePath("/"); }