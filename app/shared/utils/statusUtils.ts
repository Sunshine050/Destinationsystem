// app/shared/utils/statusUtils.ts
import { cn } from "@lib/utils";

export const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  assigned: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  "in-progress": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export const severityColors: Record<number, string> = {
  1: "bg-green-500 hover:bg-green-500/80",
  2: "bg-yellow-500 hover:bg-yellow-500/80",
  3: "bg-orange-500 hover:bg-orange-500/80",
  4: "bg-red-500 hover:bg-red-500/80",
};

export const getStatusLabel = (status: string): string => {
  switch (status) {
    case "pending": return "รอการดำเนินการ";
    case "assigned": return "มอบหมายแล้ว";
    case "in-progress": return "กำลังดำเนินการ";
    case "completed": return "เสร็จสิ้น";
    case "cancelled": return "ยกเลิก";
    default: return status;
  }
};