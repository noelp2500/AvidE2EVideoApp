/**
 * WebRTC Group Call Client Module
 *
 * This module is responsible for setting up and managing group calls using the PeerJS library.
 *
 * Dependencies:
 * - `wssConnection`: Module that manages the WebSocket connection for signaling.
 * - `store`: Redux store where the application's state is managed.
 * - `callActions`: Redux actions related to updating the call's state.
 *
 * Variables:
 * - `myPeer`: Represents the PeerJS connection.
 * - `myPeerId`: The ID assigned by the PeerJS server.
 * - `groupCallRoomId`: The ID of the group call room.
 * - `groupCallHost`: A flag indicating if the current user is the host of the group call.
 *
 * Functions:
 * 1. `connectWithMyPeer`: Initializes the PeerJS connection and sets up event listeners.
 *
 * 2. `createNewGroupCall`: Initiates a new group call.
 *
 * 3. `joinGroupCall`: Joins an existing group call.
 *
 * 4. `connectToNewUser`: Connects to a new user in the group call.
 *
 * 5. `leaveGroupCall`: Leaves the current group call.
 *
 * 6. `clearGroupData`: Clears the group call data and resets the PeerJS connection.
 *
 * 7. `removeInactiveStream`: Removes a stream that has become inactive.
 *
 * 8. `addVideoStream`: Adds a new incoming video stream.
 *
 * 9. `checkActiveGroupCall`: Checks if there's an active group call and returns the room ID if there is.
 *
 * Usage:
 * This module is typically imported and used to manage group calls, including creating, joining, and leaving group calls, and handling video streams.
 */

import * as wss from "../wssConnection/wssConnection";
import store from "../../store/store";
import {
  setGroupCallActive,
  setCallState,
  callStates,
  setGroupCallIncomingStreams,
  clearGroupCallData,
} from "../../store/actions/callActions";

let myPeer;
let myPeerId;
let groupCallRoomId;
let groupCallHost = false;

export const connectWithMyPeer = () => {
  myPeer = new window.Peer(undefined, {
    path: "/peerjs",
    host: "/",
    port: "3000",
  });

  myPeer.on("open", (id) => {
    console.log("succesfully connected with peer server");
    myPeerId = id;
  });

  myPeer.on("call", (call) => {
    call.answer(store.getState().call.localStream);
    call.on("stream", (incomingStream) => {
      const streams = store.getState().call.groupCallStreams;
      const stream = streams.find((stream) => stream.id === incomingStream.id);

      if (!stream) {
        addVideoStream(incomingStream);
      }
    });
  });
};

export const createNewGroupCall = () => {
  groupCallHost = true;
  wss.registerGroupCall({
    username: store.getState().dashboard.username,
    peerId: myPeerId,
  });

  store.dispatch(setGroupCallActive(true));
  store.dispatch(setCallState(callStates.CALL_IN_PROGRESS));
};

export const joinGroupCall = (hostSocketId, roomId) => {
  const localStream = store.getState().call.localStream;
  groupCallRoomId = roomId;

  wss.userWantsToJoinGroupCall({
    peerId: myPeerId,
    hostSocketId,
    roomId,
    localStreamId: localStream.id,
  });

  store.dispatch(setGroupCallActive(true));
  store.dispatch(setCallState(callStates.CALL_IN_PROGRESS));
};

export const connectToNewUser = (data) => {
  const localStream = store.getState().call.localStream;

  const call = myPeer.call(data.peerId, localStream);

  call.on("stream", (incomingStream) => {
    const streams = store.getState().call.groupCallStreams;
    const stream = streams.find((stream) => stream.id === incomingStream.id);

    if (!stream) {
      addVideoStream(incomingStream);
    }
  });
};

export const leaveGroupCall = () => {
  if (groupCallHost) {
    wss.groupCallClosedByHost({
      peerId: myPeerId,
    });
  } else {
    wss.userLeftGroupCall({
      streamId: store.getState().call.localStream.id,
      roomId: groupCallRoomId,
    });
  }
  clearGroupData();
};

export const clearGroupData = () => {
  groupCallRoomId = null;
  groupCallHost = null;
  store.dispatch(clearGroupCallData());
  myPeer.destroy();
  connectWithMyPeer();

  const localStream = store.getState().call.localStream;
  localStream.getVideoTracks()[0].enabled = true;
  localStream.getAudioTracks()[0].enabled = true;
};

export const removeInactiveStream = (data) => {
  const groupCallStreams = store
    .getState()
    .call.groupCallStreams.filter((stream) => stream.id !== data.streamId);
  store.dispatch(setGroupCallIncomingStreams(groupCallStreams));
};

const addVideoStream = (incomingStream) => {
  const groupCallStreams = [
    ...store.getState().call.groupCallStreams,
    incomingStream,
  ];

  store.dispatch(setGroupCallIncomingStreams(groupCallStreams));
};

// if group call is active return roomId if not return false
export const checkActiveGroupCall = () => {
  if (store.getState().call.groupCallActive) {
    return groupCallRoomId;
  } else {
    return false;
  }
};
