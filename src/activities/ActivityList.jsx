import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { deleteActivity } from "../api/activities";

export default function ActivityList({ activities, syncActivities }) {
  const { token } = useAuth();
  const [error, setError] = useState(null);

  const tryDelete = async (activityId) => {
    setError(null);

    try {
      await deleteActivity(token, activityId);
      await syncActivities(); // ✅ refresh list after delete
    } catch (e) {
      setError(e.message); // ✅ shows unauthorized error, etc.
    }
  };

  return (
    <>
      {error && <p role="alert">{error}</p>}

      <ul>
        {activities.map((activity) => (
          <li key={activity.id}>
            {activity.name}
            {token && (
              <button
                type="button"
                onClick={() => tryDelete(activity.id)}
                style={{ marginLeft: "0.5rem" }}
              >
                Delete
              </button>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
