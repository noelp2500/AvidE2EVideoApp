/**
 * Dashboard Actions for Redux Store
 *
 * This module defines the action types and action creators related to dashboard functionalities in the application.
 *
 * Constants:
 * - `DASHBOARD_SET_USERNAME`: Action type to set the username in the dashboard state.
 * - `DASHBOARD_SET_ACTIVE_USERS`: Action type to set the list of active users in the dashboard state.
 * - `DASHBOARD_SET_GROUP_CALL_ROOMS`: Action type to set the list of group call rooms in the dashboard state.
 *
 * Action Creators:
 * Each of the exported functions below is an action creator. An action creator is a function that returns an action.
 * An action is a plain JavaScript object that represents an intention to change the state.
 *
 * 1. `setUsername`: Sets the username for the current user in the dashboard state.
 * 2. `setActiveUsers`: Sets the list of active users in the dashboard state. This list represents users who are currently online and available for communication.
 * 3. `setGroupCalls`: Sets the list of group call rooms in the dashboard state. This list represents the active group calls that a user can join.
 *
 * Usage:
 * These action creators are typically dispatched to the Redux store to update the state related to the dashboard. The updated state can then be used to reflect changes in the UI, such as displaying the current user's username, showing a list of active users, or listing available group calls.
 */

export const DASHBOARD_SET_USERNAME = "DASHBOARD.SET_USERNAME";
export const DASHBOARD_SET_ACTIVE_USERS = "DASHBOARD.SET_ACTIVE_USERS";
export const DASHBOARD_SET_GROUP_CALL_ROOMS = "DASHBOARD.SET_GROUP_CALL_ROOMS";

export const setUsername = (username) => {
  return {
    type: DASHBOARD_SET_USERNAME,
    username,
  };
};

export const setActiveUsers = (activeUsers) => {
  return {
    type: DASHBOARD_SET_ACTIVE_USERS,
    activeUsers,
  };
};

export const setGroupCalls = (groupCallRooms) => {
  return {
    type: DASHBOARD_SET_GROUP_CALL_ROOMS,
    groupCallRooms,
  };
};
