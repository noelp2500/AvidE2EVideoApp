/**
 * WebRTC Client Module for Direct Communication
 *
 * This module is responsible for setting up and managing a WebRTC connection for direct communication between users.
 *
 * Dependencies:
 * - `store`: Redux store where the application's state is managed.
 * - `callActions`: Redux actions related to updating the call's state.
 * - `wssConnection`: Module that manages the WebSocket connection for signaling.
 *
 * Constants:
 * - `preOfferAnswers`: An enumeration of possible answers to a pre-offer.
 * - `defaultConstrains`: Default constraints for user media access.
 * - `configuration`: Configuration for the RTCPeerConnection, including ICE servers.
 *
 * Variables:
 * - `connectedUserSocketId`: Socket ID of the user we're connected to.
 * - `peerConnection`: Represents the WebRTC connection.
 * - `dataChannel`: Represents the data channel for chat messages.
 *
 * Functions:
 * 1. `getLocalStream`: Accesses the user's webcam and microphone and sets up the peer connection.
 *
 * 2. `createPeerConnection`: Initializes the WebRTC peer connection, sets up necessary event listeners, and establishes the data channel for chat.
 *
 * 3. Direct Call Functions: Functions that manage the lifecycle of a direct call.
 *    - `callToOtherUser`: Initiates a call to another user.
 *    - `handlePreOffer`: Handles an incoming pre-offer.
 *    - `acceptIncomingCallRequest`: Accepts an incoming call request.
 *    - `rejectIncomingCallRequest`: Rejects an incoming call request.
 *    - `handlePreOfferAnswer`: Handles the answer to a pre-offer.
 *    - `sendOffer`: Sends the WebRTC offer.
 *    - `handleOffer`: Handles an incoming WebRTC offer.
 *    - `handleAnswer`: Handles an incoming WebRTC answer.
 *    - `handleCandidate`: Handles an incoming ICE candidate.
 *    - `checkIfCallIsPossible`: Checks if a call can be initiated or received.
 *    - `hangUp`: Ends the current call.
 *    - `handleUserHangedUp`: Handles the event when the other user hangs up.
 *
 * 4. Screen Sharing Functions:
 *    - `switchForScreenSharingStream`: Switches between regular video and screen sharing.
 *
 * 5. Chat Functions:
 *    - `sendMessageUsingDataChannel`: Sends a chat message over the data channel.
 *
 * Usage:
 * This module is typically imported and used to manage direct communication between users, including video calls, screen sharing, and chat.
 */

import store from "../../store/store";
import {
  setLocalStream,
  setCallState,
  callStates,
  setCallingDialogVisible,
  setCallerUsername,
  setCallRejected,
  setRemoteStream,
  setScreenSharingActive,
  resetCallDataState,
  setMessage,
} from "../../store/actions/callActions";
import * as wss from "../wssConnection/wssConnection";

const preOfferAnswers = {
  CALL_ACCEPTED: "CALL_ACCEPTED",
  CALL_REJECTED: "CALL_REJECTED",
  CALL_NOT_AVAILABLE: "CALL_NOT_AVAILABLE",
};

const defaultConstrains = {
  video: {
    width: 480,
    height: 360,
  },
  audio: true,
};

const configuration = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:13902",
    },
  ],
};

let connectedUserSocketId;
let peerConnection;
let dataChannel;

export const getLocalStream = () => {
  navigator.mediaDevices
    .getUserMedia(defaultConstrains)
    .then((stream) => {
      store.dispatch(setLocalStream(stream));
      store.dispatch(setCallState(callStates.CALL_AVAILABLE));
      createPeerConnection();
    })
    .catch((err) => {
      console.log(
        "error occured when trying to get an access to get local stream"
      );
      console.log(err);
    });
};

const createPeerConnection = () => {
  peerConnection = new RTCPeerConnection(configuration);

  const localStream = store.getState().call.localStream;

  for (const track of localStream.getTracks()) {
    peerConnection.addTrack(track, localStream);
  }

  peerConnection.ontrack = ({ streams: [stream] }) => {
    store.dispatch(setRemoteStream(stream));
  };

  // incoming data channel messages
  peerConnection.ondatachannel = (event) => {
    const dataChannel = event.channel;

    dataChannel.onopen = () => {
      console.log("peer connection is ready to receive data channel messages");
    };

    dataChannel.onmessage = (event) => {
      store.dispatch(setMessage(true, event.data));
    };
  };

  dataChannel = peerConnection.createDataChannel("chat");

  dataChannel.onopen = () => {
    console.log("chat data channel succesfully opened");
  };

  peerConnection.onicecandidate = (event) => {
    console.log("geeting candidates from stun server");
    if (event.candidate) {
      wss.sendWebRTCCandidate({
        candidate: event.candidate,
        connectedUserSocketId: connectedUserSocketId,
      });
    }
  };

  peerConnection.onconnectionstatechange = (event) => {
    if (peerConnection.connectionState === "connected") {
      console.log("succesfully connected with other peer");
    }
  };
};

export const callToOtherUser = (calleeDetails) => {
  connectedUserSocketId = calleeDetails.socketId;
  store.dispatch(setCallState(callStates.CALL_IN_PROGRESS));
  store.dispatch(setCallingDialogVisible(true));
  wss.sendPreOffer({
    callee: calleeDetails,
    caller: {
      username: store.getState().dashboard.username,
    },
  });
};

export const handlePreOffer = (data) => {
  if (checkIfCallIsPossible()) {
    connectedUserSocketId = data.callerSocketId;
    store.dispatch(setCallerUsername(data.callerUsername));
    store.dispatch(setCallState(callStates.CALL_REQUESTED));
  } else {
    wss.sendPreOfferAnswer({
      callerSocketId: data.callerSocketId,
      answer: preOfferAnswers.CALL_NOT_AVAILABLE,
    });
  }
};

export const acceptIncomingCallRequest = () => {
  wss.sendPreOfferAnswer({
    callerSocketId: connectedUserSocketId,
    answer: preOfferAnswers.CALL_ACCEPTED,
  });

  store.dispatch(setCallState(callStates.CALL_IN_PROGRESS));
};

export const rejectIncomingCallRequest = () => {
  wss.sendPreOfferAnswer({
    callerSocketId: connectedUserSocketId,
    answer: preOfferAnswers.CALL_REJECTED,
  });
  resetCallData();
};

export const handlePreOfferAnswer = (data) => {
  store.dispatch(setCallingDialogVisible(false));

  if (data.answer === preOfferAnswers.CALL_ACCEPTED) {
    sendOffer();
  } else {
    let rejectionReason;
    if (data.answer === preOfferAnswers.CALL_NOT_AVAILABLE) {
      rejectionReason = "Callee is not able to pick up the call right now";
    } else {
      rejectionReason = "Call rejected by the callee";
    }
    store.dispatch(
      setCallRejected({
        rejected: true,
        reason: rejectionReason,
      })
    );

    resetCallData();
  }
};

const sendOffer = async () => {
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  wss.sendWebRTCOffer({
    calleeSocketId: connectedUserSocketId,
    offer: offer,
  });
};

export const handleOffer = async (data) => {
  await peerConnection.setRemoteDescription(data.offer);
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  wss.sendWebRTCAnswer({
    callerSocketId: connectedUserSocketId,
    answer: answer,
  });
};

export const handleAnswer = async (data) => {
  await peerConnection.setRemoteDescription(data.answer);
};

export const handleCandidate = async (data) => {
  try {
    console.log("adding ice candidates");
    await peerConnection.addIceCandidate(data.candidate);
  } catch (err) {
    console.error(
      "error occured when trying to add received ice candidate",
      err
    );
  }
};

export const checkIfCallIsPossible = () => {
  if (
    store.getState().call.localStream === null ||
    store.getState().call.callState !== callStates.CALL_AVAILABLE
  ) {
    return false;
  } else {
    return true;
  }
};

let screenSharingStream;

export const switchForScreenSharingStream = async () => {
  if (!store.getState().call.screenSharingActive) {
    try {
      screenSharingStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      store.dispatch(setScreenSharingActive(true));
      const senders = peerConnection.getSenders();
      const sender = senders.find(
        (sender) =>
          sender.track.kind == screenSharingStream.getVideoTracks()[0].kind
      );
      sender.replaceTrack(screenSharingStream.getVideoTracks()[0]);
    } catch (err) {
      console.error(
        "error occured when trying to get screen sharing stream",
        err
      );
    }
  } else {
    const localStream = store.getState().call.localStream;
    const senders = peerConnection.getSenders();
    const sender = senders.find(
      (sender) => sender.track.kind == localStream.getVideoTracks()[0].kind
    );
    sender.replaceTrack(localStream.getVideoTracks()[0]);
    store.dispatch(setScreenSharingActive(false));
    screenSharingStream.getTracks().forEach((track) => track.stop());
  }
};

export const handleUserHangedUp = () => {
  resetCallDataAfterHangUp();
};

export const hangUp = () => {
  wss.sendUserHangedUp({
    connectedUserSocketId: connectedUserSocketId,
  });

  resetCallDataAfterHangUp();
};

const resetCallDataAfterHangUp = () => {
  peerConnection.close();
  peerConnection = null;
  createPeerConnection();
  resetCallData();

  const localStream = store.getState().call.localStream;
  localStream.getVideoTracks()[0].enabled = true;
  localStream.getAudioTracks()[0].enabled = true;

  if (store.getState().call.screenSharingActive) {
    screenSharingStream.getTracks().forEach((track) => {
      track.stop();
    });
  }

  store.dispatch(resetCallDataState());
};

export const resetCallData = () => {
  connectedUserSocketId = null;
  store.dispatch(setCallState(callStates.CALL_AVAILABLE));
};

export const sendMessageUsingDataChannel = (message) => {
  dataChannel.send(message);
};
