import { Suspense } from "react";
import type { Metadata } from "next";
import RoomGate from "@/components/RoomGate";

export const metadata: Metadata = { title: "ClassClash room", robots: { index: false } };

export default function Page() {
  return (
    <Suspense fallback={null}>
      <RoomGate />
    </Suspense>
  );
}
