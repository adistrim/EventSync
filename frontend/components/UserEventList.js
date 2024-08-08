import { useState, useEffect } from "react";
import { toast } from "react-toastify";

const UserEventList = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found in localStorage");
          toast.error("You are not logged in");
          setIsLoading(false);
          return;
        }

        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        if (!backendUrl) {
          console.error("Backend URL is not set");
          toast.error("Server configuration error");
          setIsLoading(false);
          return;
        }

        console.log("Fetching events from:", `${backendUrl}/user-events`);

        const response = await fetch(`${backendUrl}/user-events`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Response status:", response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("Fetched events:", data);
          setEvents(data);
        } else {
          const errorText = await response.text();
          console.error("Failed to fetch events:", errorText);
          toast.error(`Failed to fetch events: ${response.statusText}`);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
        toast.error("An error occurred while fetching events");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (isLoading) {
    return <div className="text-center text-white">Loading events...</div>;
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold text-white mb-4">
        Events You&apos;re part of.
      </h3>
      {events.length === 0 ? (
        <p className="text-white">You&apos;re not part of any events yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow-md p-4">
              <h4 className="text-lg font-semibold text-indigo-600">
                {event.name}
              </h4>
              <p className="text-gray-600 mt-2">{event.description}</p>
              <p className="text-sm text-gray-500 mt-2">
                {new Date(event.date).toLocaleString()}
              </p>
              <p className="text-gray-600 mt-2">{event.location}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserEventList;
