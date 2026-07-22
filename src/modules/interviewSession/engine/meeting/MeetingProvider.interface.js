/**
 * Interface for Meeting Providers (Provider Pattern / Dependency Injection).
 * Decouples meeting engine from specific video conferencing vendors (Zoom, Meet, Teams, Internal).
 */
export class MeetingProvider {
  /**
   * Creates a meeting room
   * @param {Object} sessionData 
   * @returns {Promise<{ meetingRoomId: string, meetingUrl: string, metadata?: Object }>}
   */
  async createRoom(sessionData) {
    throw new Error("Method createRoom() must be implemented.");
  }

  /**
   * Starts a meeting room
   * @param {string} roomId 
   * @returns {Promise<{ status: string, startedAt: Date }>}
   */
  async startRoom(roomId) {
    throw new Error("Method startRoom() must be implemented.");
  }

  /**
   * Ends a meeting room
   * @param {string} roomId 
   * @returns {Promise<{ status: string, endedAt: Date }>}
   */
  async endRoom(roomId) {
    throw new Error("Method endRoom() must be implemented.");
  }
}
