"use client";
import { useEffect, useState } from "react";
import axios from "axios";

const HomePage = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use the environment variable for the backend URL
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/users`,
        );
        setUsers(response.data);
      } catch (err) {
        setError("Failed to fetch data");
      }
    };
    fetchData();
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>User List</h1>
      {users.length > 0 ? (
        <ul>
          {users.map((user) => (
            <li key={user.id}>
              {user.name} - {user.email}
            </li>
          ))}
        </ul>
      ) : (
        <p>No users found</p>
      )}
    </div>
  );
};

export default HomePage;
