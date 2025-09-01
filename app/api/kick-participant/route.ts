// app/api/kick-participant/route.ts
import { RoomServiceClient } from "livekit-server-sdk";
import { NextRequest } from "next/server";

const roomService = new RoomServiceClient(
  process.env.LIVEKIT_URL!,
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!
);

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { roomName, participantIdentity } = body;

  try {
    await roomService.removeParticipant(roomName, participantIdentity);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Failed to remove participant:", err);
    return new Response(
      JSON.stringify({ error: "Failed to remove participant" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
