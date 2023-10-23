/**
 * Call Reducer for Redux Store
 *
 * This module defines the initial state and the reducer function related to call functionalities in the application.
 *
 * Initial State (`initState`):
 * - `localStream`: Represents the local video and audio stream of the user.
 * - `callState`: Represents the current state of the call. It uses the `callStates` enumeration from the `callActions`.
 * - `callingDialogVisible`: A boolean indicating if the calling dialog is visible.
 * - `callerUsername`: The username of the caller.
 * - `callRejected`: An object containing information if the call was rejected and the reason for rejection.
 * - `remoteStream`: Represents the remote video and audio stream of the other user.
 * - `localCameraEnabled`: A boolean indicating if the local camera is enabled.
 * - `localMicrophoneEnabled`: A boolean indicating if the local microphone is enabled.
 * - `screenSharingActive`: A boolean indicating if screen sharing is active.
 * - `groupCallActive`: A boolean indicating if a group call is active.
 * - `groupCallStreams`: An array containing streams of all users in a group call.
 * - `message`: An object representing a chat message, with a flag indicating if it was received and its content.
 *
 * Reducer Function (`reducer`):
 * The reducer function takes the current state and an action as arguments and returns the new state. It uses a switch statement to determine which action is being dispatched and updates the state accordingly.
 *
 * For example:
 * - If the dispatched action is `CALL_SET_LOCAL_STREAM`, it updates the `localStream` in the state with the provided stream from the action.
 * - If the dispatched action is `CALL_SET_CALL_STATE`, it updates the `callState` in the state with the provided call state from the action.
 *
 * ... and so on for other actions.
 *
 * The `default` case in the switch statement returns the current state, ensuring that if an action is dispatched that the reducer does not understand, the state remains unchanged.
 *
 * Usage:
 * This reducer is typically used by the Redux store to determine how the state should change in response to different actions related to calls. The updated state can then be used to reflect changes in the UI, such as updating the video stream, showing/hiding dialogs, or displaying messages.
 */

import * as callActions from "../actions/callActions";

const initState = {
  localStream: null,
  callState: callActions.callStates.CALL_UNAVAILABLE,
  callingDialogVisible: false,
  callerUsername: "",
  callRejected: {
    rejected: false,
    reason: "",
  },
  remoteStream: null,
  localCameraEnabled: true,
  localMicrophoneEnabled: true,
  screenSharingActive: false,
  groupCallActive: false,
  groupCallStreams: [],
  message: {
    received: false,
    content: "",
  },
};

const reducer = (state = initState, action) => {
  switch (action.type) {
    case callActions.CALL_SET_LOCAL_STREAM:
      return {
        ...state,
        localStream: action.localStream,
      };
    case callActions.CALL_SET_CALL_STATE:
      return {
        ...state,
        callState: action.callState,
      };
    case callActions.CALL_SET_CALLING_DIALOG_VISIBLE:
      return {
        ...state,
        callingDialogVisible: action.visible,
      };
    case callActions.CALL_SET_CALLER_USERNAME:
      return {
        ...state,
        callerUsername: action.callerUsername,
      };
    case callActions.CALL_SET_CALL_REJECTED:
      return {
        ...state,
        callRejected: action.callRejected,
      };
    case callActions.CALL_SET_REMOTE_STREAM:
      return {
        ...state,
        remoteStream: action.remoteStream,
      };
    case callActions.CALL_SET_LOCAL_CAMERA_ENABLED:
      return {
        ...state,
        localCameraEnabled: action.enabled,
      };
    case callActions.CALL_SET_LOCAL_MICROPHONE_ENABLED:
      return {
        ...state,
        localMicrophoneEnabled: action.enabled,
      };
    case callActions.CALL_SET_SCREEN_SHARING_ACTIVE:
      return {
        ...state,
        screenSharingActive: action.active,
      };
    case callActions.CALL_RESET_CALL_STATE:
      return {
        ...state,
        remoteStream: null,
        screenSharingActive: false,
        callerUsername: "",
        localMicrophoneEnabled: true,
        localCameraEnabled: true,
        callingDialogVisible: false,
      };
    case callActions.CALL_SET_GROUP_CALL_ACTIVE:
      return {
        ...state,
        groupCallActive: action.active,
      };
    case callActions.CALL_SET_GROUP_CALL_STREAMS:
      return {
        ...state,
        groupCallStreams: action.groupCallStreams,
      };
    case callActions.CALL_CLEAR_GROUP_CALL_DATA:
      return {
        ...state,
        groupCallActive: false,
        groupCallStreams: [],
        callState: callActions.callStates.CALL_AVAILABLE,
        localMicrophoneEnabled: true,
        localCameraEnabled: true,
      };
    case callActions.CALL_SET_CHAT_MESSAGE:
      return {
        ...state,
        message: action.message,
      };
    default:
      return state;
  }
};
export default reducer;
