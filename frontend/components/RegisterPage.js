"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, username, email, password }),
      },
    );

    if (response.ok) {
      router.push("/login");
    } else {
      alert("Failed to register");
    }
  };

  return (
    <div>
      <h1>Register Page</h1>
      <form onSubmit={handleSubmit}>
        <label>
          name:
          <input
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label>
          username:
          <input
            type="text"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
        <label>
          email:
          <input
            type="text"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          password:
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default RegisterPage;
