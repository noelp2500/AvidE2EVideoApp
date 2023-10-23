/**
 * Dashboard Reducer for Redux Store
 *
 * This module is responsible for managing the state related to the dashboard functionalities in the application.
 *
 * Initial State (`initState`):
 * - `username`: Represents the username of the currently logged-in user. Initially, it's an empty string.
 * - `activeUsers`: An array that lists all active users currently online. Initially, it's an empty array.
 * - `groupCallRooms`: An array that lists all the active group call rooms. Initially, it's an empty array.
 *
 * Reducer Function (`reducer`):
 * The reducer function takes the current state and an action as arguments and returns the new state. It uses a switch statement to determine which action is being dispatched and updates the state accordingly.
 *
 * For example:
 * - If the dispatched action is `DASHBOARD_SET_USERNAME`, it updates the `username` in the state with the provided username from the action.
 * - If the dispatched action is `DASHBOARD_SET_ACTIVE_USERS`, it updates the `activeUsers` in the state with the provided list of active users from the action.
 * - If the dispatched action is `DASHBOARD_SET_GROUP_CALL_ROOMS`, it updates the `groupCallRooms` in the state with the provided list of group call rooms from the action.
 *
 * The `default` case in the switch statement returns the current state, ensuring that if an action is dispatched that the reducer does not understand, the state remains unchanged.
 *
 * Usage:
 * This reducer is typically used by the Redux store to determine how the state should change in response to different actions related to the dashboard. The updated state can then be used to reflect changes in the UI, such as displaying the username, showing the list of active users, or listing the active group call rooms.
 */

import * as dashboardActions from "../actions/dashboardActions";

const initState = {
  username: "",
  activeUsers: [],
  groupCallRooms: [],
};

const reducer = (state = initState, action) => {
  switch (action.type) {
    case dashboardActions.DASHBOARD_SET_USERNAME:
      return {
        ...state,
        username: action.username,
      };
    case dashboardActions.DASHBOARD_SET_ACTIVE_USERS:
      return {
        ...state,
        activeUsers: action.activeUsers,
      };
    case dashboardActions.DASHBOARD_SET_GROUP_CALL_ROOMS:
      return {
        ...state,
        groupCallRooms: action.groupCallRooms,
      };
    default:
      return state;
  }
};
export default reducer;
