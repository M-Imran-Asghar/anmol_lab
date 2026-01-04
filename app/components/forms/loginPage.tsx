"use client";
import { useState } from "react";
import Button from "../ui/button";
import Input from "../ui/input";
import { useRouter } from "next/navigation";



type formData = {
  email: string;
  password: string;
};

type Errors = {
  email: string;
  password: string;
};

const LoginPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<formData>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<Errors>({
    email: "",
    password: "",
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Errors = {
      email: "",
      password: "",
    };

    if (formData.email.trim() === "") {
      newErrors.email = "Name is required";
    }

    if (formData.password.trim() === "") {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);

    if (newErrors.email || newErrors.password) {
      return;
    }

    try {

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
        password: formData.password,
        }),
      })

      const data =await  response.json()
      console.log(data)

      if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

 
    if (data.token) {
      localStorage.setItem("token", data.token);
    }

    
    router.push("/todayPage");
      
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;

  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));

  setErrors((prev) => ({
    ...prev,
    [name]: "",
  }));
};


  return (
    <div className="flex justify-center items-center bg-linear-to-br
 from-purple-200 to-purple-400 px-4 py-4 ">
      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-6 bg-white/70 backdrop-blur-md w-full max-w-md py-10 px-8 rounded-2xl shadow-xl shadow-purple-600/20 border border-white/30"
      >
        {/* Header */}
        <div className="bg-purple-600 rounded-xl py-4 shadow-md shadow-purple-800/30">
          <h1 className="font-bold text-2xl text-center text-white tracking-wide">
            Alflah Laboratory
          </h1>
        </div>

        {/* Name Input */}
        <div className="flex flex-col gap-1">
          <label className="font-medium text-gray-700">Email</label>
          <Input
            value={formData.email}
            name="email"
            onChange={handleInput}
            type="email"
            placeholder="Enter your name"
            className="w-full bg-white border-gray-300 focus:border-purple-500 focus:ring-purple-500"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
        </div>

        {/* Password Input */}
        <div className="flex flex-col gap-1">
          <label className="font-medium text-gray-700">Password</label>
          <Input
            value={formData.password}
            name="password"
            onChange={handleInput}
            type="password"
            placeholder="Enter your password"
            className="w-full bg-white border-gray-300 focus:border-purple-500 focus:ring-purple-500"
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
        </div>

        {/* Button */}
        <Button
          type="submit"
          className="w-full border-gray-400 text-purple-700 font-semibold hover:bg-purple-600 hover:text-white py-3 transition-all duration-200 shadow-sm hover:shadow-md rounded-lg"
        >
          Login
        </Button>

        {/* Footer */}
        <p className="text-center text-gray-600 text-sm">
          Forgot your password?{" "}
          <span className="text-purple-700 font-medium hover:underline cursor-pointer">
            Click here
          </span>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;