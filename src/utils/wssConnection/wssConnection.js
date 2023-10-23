/**
 * WebSocket Client Module for Real-time Communication
 *
 * This module is responsible for establishing and managing a WebSocket connection to a server using the `socket.io-client` library.
 *
 * Dependencies:
 * - `socket.io-client`: Enables real-time, bidirectional communication between the server and client.
 * - `store`: Redux store where the application's state is managed.
 * - `dashboardActions`: Redux actions related to updating the dashboard's state.
 * - `webRTCHandler` & `webRTCGroupCallHandler`: Modules that handle specific WebRTC functionalities for direct and group calls respectively.
 *
 * Constants:
 * - `SERVER`: The address of the WebSocket server.
 * - `broadcastEventTypes`: An enumeration of types of broadcast events the client can receive.
 *
 * Variables:
 * - `socket`: Represents the WebSocket connection.
 *
 * Functions:
 * 1. `connectWithWebSocket`: Initializes the WebSocket connection and sets up event listeners.
 *    - Listens for a successful connection and logs the socket ID.
 *    - Listens for broadcast events and delegates handling to `handleBroadcastEvents`.
 *    - Sets up listeners for direct call events like pre-offers, offers, answers, and ICE candidates.
 *    - Sets up listeners for group call events like join requests and user disconnections.
 *
 * 2. `registerNewUser`: Emits an event to register a new user with their username and socket ID.
 *
 * 3. Direct Call Event Emitters: Functions that emit events related to the different stages of a direct call.
 *    - `sendPreOffer`
 *    - `sendPreOfferAnswer`
 *    - `sendWebRTCOffer`
 *    - `sendWebRTCAnswer`
 *    - `sendWebRTCCandidate`
 *    - `sendUserHangedUp`
 *
 * 4. Group Call Event Emitters: Functions that emit events related to group calls.
 *    - `registerGroupCall`
 *    - `userWantsToJoinGroupCall`
 *    - `userLeftGroupCall`
 *    - `groupCallClosedByHost`
 *
 * 5. `handleBroadcastEvents`: Handles broadcast events received from the server.
 *    - For `ACTIVE_USERS`, it updates the list of active users in the Redux store, excluding the current user.
 *    - For `GROUP_CALL_ROOMS`, it updates the list of active group call rooms in the Redux store and checks if the current user's active group call is still valid.
 *
 * Usage:
 * This module is typically imported and used to initiate the WebSocket connection and to emit events related to direct and group calls.
 */

import socketClient from "socket.io-client";
import store from "../../store/store";
import * as dashboardActions from "../../store/actions/dashboardActions";
import * as webRTCHandler from "../webRTC/webRTCHandler";
import * as webRTCGroupCallHandler from "../webRTC/webRTCGroupCallHandler";

const SERVER = "http://localhost:3000";

const broadcastEventTypes = {
  ACTIVE_USERS: "ACTIVE_USERS",
  GROUP_CALL_ROOMS: "GROUP_CALL_ROOMS",
};

let socket;

export const connectWithWebSocket = () => {
  socket = socketClient(SERVER);

  socket.on("connection", () => {
    console.log("succesfully connected with wss server");
    console.log(socket.id);
  });

  socket.on("broadcast", (data) => {
    handleBroadcastEvents(data);
  });

  // listeners related with direct call
  socket.on("pre-offer", (data) => {
    webRTCHandler.handlePreOffer(data);
  });

  socket.on("pre-offer-answer", (data) => {
    webRTCHandler.handlePreOfferAnswer(data);
  });

  socket.on("webRTC-offer", (data) => {
    webRTCHandler.handleOffer(data);
  });

  socket.on("webRTC-answer", (data) => {
    webRTCHandler.handleAnswer(data);
  });

  socket.on("webRTC-candidate", (data) => {
    webRTCHandler.handleCandidate(data);
  });

  socket.on("user-hanged-up", () => {
    webRTCHandler.handleUserHangedUp();
  });

  // listeners related with group calls

  socket.on("group-call-join-request", (data) => {
    webRTCGroupCallHandler.connectToNewUser(data);
  });

  socket.on("group-call-user-left", (data) => {
    webRTCGroupCallHandler.removeInactiveStream(data);
  });
};

export const registerNewUser = (username) => {
  socket.emit("register-new-user", {
    username: username,
    socketId: socket.id,
  });
};

// emitting events to server related with direct call

export const sendPreOffer = (data) => {
  socket.emit("pre-offer", data);
};

export const sendPreOfferAnswer = (data) => {
  socket.emit("pre-offer-answer", data);
};

export const sendWebRTCOffer = (data) => {
  socket.emit("webRTC-offer", data);
};

export const sendWebRTCAnswer = (data) => {
  socket.emit("webRTC-answer", data);
};

export const sendWebRTCCandidate = (data) => {
  socket.emit("webRTC-candidate", data);
};

export const sendUserHangedUp = (data) => {
  socket.emit("user-hanged-up", data);
};

// emitting events related with group calls

export const registerGroupCall = (data) => {
  socket.emit("group-call-register", data);
};

export const userWantsToJoinGroupCall = (data) => {
  socket.emit("group-call-join-request", data);
};

export const userLeftGroupCall = (data) => {
  socket.emit("group-call-user-left", data);
};

export const groupCallClosedByHost = (data) => {
  socket.emit("group-call-closed-by-host", data);
};

const handleBroadcastEvents = (data) => {
  switch (data.event) {
    case broadcastEventTypes.ACTIVE_USERS:
      const activeUsers = data.activeUsers.filter(
        (activeUser) => activeUser.socketId !== socket.id
      );
      store.dispatch(dashboardActions.setActiveUsers(activeUsers));
      break;
    case broadcastEventTypes.GROUP_CALL_ROOMS:
      const groupCallRooms = data.groupCallRooms.filter(
        (room) => room.socketId !== socket.id
      );
      const activeGroupCallRoomId =
        webRTCGroupCallHandler.checkActiveGroupCall();

      if (activeGroupCallRoomId) {
        const room = groupCallRooms.find(
          (room) => room.roomId === activeGroupCallRoomId
        );
        if (!room) {
          webRTCGroupCallHandler.clearGroupData();
        }
      }
      store.dispatch(dashboardActions.setGroupCalls(groupCallRooms));
      break;
    default:
      break;
  }
};
