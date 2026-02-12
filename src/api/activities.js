const API = import.meta.env.VITE_API;

/**
 * Safely extract an error message from an API response.
 * Some endpoints return empty bodies (especially DELETE / 204),
 * and some errors might not return JSON.
 */
async function getErrorMessage(response) {
  const text = await response.text();

  // Empty response body
  if (!text) return `Request failed (${response.status})`;

  // Try JSON first
  try {
    const data = JSON.parse(text);
    return data.message || `Request failed (${response.status})`;
  } catch {
    // Not JSON, return raw text
    return text;
  }
}

/** Fetches an array of activities from the API. */
export async function getActivities() {
  try {
    const response = await fetch(API + "/activities");

    // Some APIs return { data: [...] }, some return [...]
    // Your existing code assumes it returns the array directly, so keep it.
    const result = await response.json();
    return result;
  } catch (e) {
    console.error(e);
    return [];
  }
}

/**
 * Sends a new activity to the API to be created.
 * A valid token is required.
 */
export async function createActivity(token, activity) {
  if (!token) {
    throw Error("You must be signed in to create an activity.");
  }

  const response = await fetch(API + "/activities", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(activity),
  });

  if (!response.ok) {
    const message = await getErrorMessage(response);
    throw Error(message);
  }

  // Some APIs return the created object, some return nothing.
  // We don't need to parse JSON here since the UI re-fetches.
}

/**
 * Deletes an activity by id.
 * A valid token is required.
 */
export async function deleteActivity(token, activityId) {
  if (!token) {
    throw Error("You must be signed in to delete an activity.");
  }

  const response = await fetch(API + `/activities/${activityId}`, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  if (!response.ok) {
    const message = await getErrorMessage(response);
    throw Error(message);
  }

  // If successful, many APIs respond 204 No Content (empty body).
  // Nothing to parse — that's expected.
}
