"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import LoadingSpinner from "@/components/LoadingSpinner";
import AddEventPopup from "@/components/AddEventPopup";
import "react-toastify/dist/ReactToastify.css";
import EventList from "@/components/EventList";
import UserEventList from "@/components/UserEventList";

const HomePage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [, setToken] = useState("");
  const [name, setName] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const router = useRouter();

  const handleEventCreated = (newEvent) => {
    toast.success(
      <div className="font-sans">
        <h3 className="font-bold text-indigo-900">
          Event Created Successfully!
        </h3>
        <p className="text-indigo-700">
          Event Name: {newEvent.name || "Not available"}
        </p>
        <p className="text-indigo-700">
          Date:{" "}
          {newEvent.date
            ? new Date(newEvent.date).toLocaleString()
            : "Not available"}
        </p>
      </div>,
      {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        className:
          "bg-gradient-to-r from-purple-100 to-blue-100 border-l-4 border-indigo-500 rounded",
        bodyClassName: "text-indigo-800",
        progressClassName: "bg-indigo-500",
      },
    );
  };

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        router.push("/login");
        return;
      }
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/verify-token`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (response.ok) {
          setIsLoggedIn(true);
          fetchUserDetails(token);
        } else {
          localStorage.removeItem("token");
          router.push("/login");
        }
      } catch (error) {
        console.error("Error verifying token:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };
    verifyToken();
  }, [router]);

  const fetchUserDetails = async (token) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user-details`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (response.ok) {
        const data = await response.json();
        setName(data.name);
      } else {
        console.error("Failed to fetch user details");
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
    setIsLoggedIn(false);
    router.push("/login");
  };

  const handleOpenPopup = () => {
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex justify-between items-center py-6">
          <h1 className="text-3xl font-bold text-white">Event Sync</h1>
          <button
            onClick={handleLogout}
            className="bg-white text-indigo-600 px-4 py-2 rounded-md font-medium hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Logout
          </button>
        </nav>
        <main className="mt-10">
          <div className="bg-white p-8 rounded-lg shadow-xl">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Hi {name}, Welcome to Your Dashboard
            </h2>
            <p className="text-gray-600">You&apos;re successfully logged in!</p>
            <button
              onClick={handleOpenPopup}
              className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Add Event
            </button>
          </div>
          <EventList />
          <UserEventList />
        </main>
        {isPopupOpen && (
          <AddEventPopup
            onClose={handleClosePopup}
            onEventCreated={handleEventCreated}
          />
        )}
      </div>
    </div>
  );
};

export default HomePage;
