import { MeetingProvider } from "./MeetingProvider.interface.js";
import crypto from "crypto";

export class InternalMeetingProvider extends MeetingProvider {
  async createRoom(sessionData) {
    const roomId = `room-${crypto.randomBytes(8).toString("hex")}`;
    const baseUrl = process.env.APP_URL || "http://localhost:5000";
    const meetingUrl = `${baseUrl}/api/v1/interview-sessions/room/${roomId}`;

    return {
      meetingRoomId: roomId,
      meetingUrl,
      metadata: {
        provider: "INTERNAL",
        internalServerId: "hireplay-rtmp-node-1"
      }
    };
  }

  async startRoom(roomId) {
    return {
      status: "LIVE",
      startedAt: new Date()
    };
  }

  async endRoom(roomId) {
    return {
      status: "COMPLETED",
      endedAt: new Date()
    };
  }
}
