import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddEventPopup = ({ onClose, onEventCreated }) => {
  const [step, setStep] = useState(1);
  const [eventDetails, setEventDetails] = useState({
    name: "",
    description: "",
    location: "",
    date: "",
    category: "",
  });
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/users`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        toast.error("Failed to fetch users");
      }
    } catch (error) {
      toast.error("Error fetching users");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserSelect = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!eventDetails.name || !eventDetails.date) {
      toast.error("Please fill in all required fields");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("No authentication token found. Please log in again.");
      return;
    }

    const formattedEventDetails = {
      ...eventDetails,
      date: new Date(eventDetails.date).toISOString(),
    };

    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/events`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formattedEventDetails),
        },
      );

      if (response.ok) {
        const data = await response.json();
        const eventId = data.id;
        if (eventId) {
          await addParticipants(eventId);
          if (typeof onEventCreated === "function") {
            onEventCreated({
              id: data.id,
              name: eventDetails.name,
              date: eventDetails.date,
            });
          }
          onClose();
        } else {
          toast.error("Event created but there was an issue with the response");
        }
      } else {
        const errorText = await response.text();
        toast.error(`Failed to create event: ${errorText}`);
      }
    } catch (error) {
      toast.error(`Error creating event: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const addParticipants = async (eventId) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/participants`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(
            selectedUsers.map((userId) => ({
              user_id: userId,
              event_id: eventId,
              role: "participant",
            })),
          ),
        },
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to add participants: ${errorText}`);
      }
    } catch (error) {
      toast.error(`Error adding participants: ${error.message}`);
    }
  };

  const inputClass =
    "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";

  const renderStep1 = () => (
    <>
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Event Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={eventDetails.name}
          onChange={handleChange}
          required
          className={inputClass}
          placeholder="Enter event name"
        />
      </div>
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={eventDetails.description}
          onChange={handleChange}
          rows={3}
          className={inputClass}
          placeholder="Enter event description"
        />
      </div>
    </>
  );

  const renderStep2 = () => (
    <>
      <div>
        <label
          htmlFor="location"
          className="block text-sm font-medium text-gray-700"
        >
          Location
        </label>
        <input
          type="text"
          id="location"
          name="location"
          value={eventDetails.location}
          onChange={handleChange}
          className={inputClass}
          placeholder="Enter event location"
        />
      </div>
      <div>
        <label
          htmlFor="date"
          className="block text-sm font-medium text-gray-700"
        >
          Date and Time
        </label>
        <input
          type="datetime-local"
          id="date"
          name="date"
          value={eventDetails.date}
          onChange={handleChange}
          required
          className={inputClass}
        />
      </div>
      <div>
        <label
          htmlFor="category"
          className="block text-sm font-medium text-gray-700"
        >
          Category
        </label>
        <input
          type="text"
          id="category"
          name="category"
          value={eventDetails.category}
          onChange={handleChange}
          className={inputClass}
          placeholder="Enter event category"
        />
      </div>
    </>
  );

  const renderStep3 = () => (
    <div>
      <h3 className="text-lg font-semibold mb-2">Select Participants</h3>
      <div className="max-h-60 overflow-y-auto">
        {users.map((user) => (
          <div key={user.id} className="flex items-center mb-2">
            <input
              type="checkbox"
              id={`user-${user.id}`}
              checked={selectedUsers.includes(user.id)}
              onChange={() => handleUserSelect(user.id)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label
              htmlFor={`user-${user.id}`}
              className="ml-2 block text-sm text-gray-900"
            >
              {user.name}
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  const handleNextStep = (e) => {
    e.preventDefault();
    setStep((prev) => Math.min(prev + 1, 3));
  };

  const handlePrevStep = (e) => {
    e.preventDefault();
    setStep((prev) => Math.max(prev - 1, 1));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <h2 className="text-2xl font-semibold mb-4">
          Add New Event - Step {step} of 3
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}

          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={handlePrevStep}
              className={`px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                step === 1 ? "invisible" : ""
              }`}
            >
              Previous
            </button>
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? "Creating..." : "Create Event"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEventPopup;
