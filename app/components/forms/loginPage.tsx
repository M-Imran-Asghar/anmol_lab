import { useState } from "react";
import Button from "../ui/button";
import Input from "../ui/input";
import { redirect } from "next/navigation";

type formData = {
  name: string;
  password: string;
};

type Errors = {
  name: string;
  password: string;
};

const LoginPage = () => {
  const [formData, setFormData] = useState<formData>({
    name: "",
    password: "",
  });

  const [errors, setErrors] = useState<Errors>({
    name: "",
    password: "",
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Errors = {
      name: "",
      password: "",
    };

    if (formData.name.trim() === "") {
      newErrors.name = "Name is required";
    }

    if (formData.password.trim() === "") {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);

    if (newErrors.name || newErrors.password) {
      return;
    }

    // Proceed with submission (e.g., API call or mock login)
    console.log("Submitted Data:", formData);
    // For a real app, you could add navigation or auth logic here

    setFormData(formData)
    redirect("/dashboard")
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error on input change
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
          <label className="font-medium text-gray-700">Name</label>
          <Input
            value={formData.name}
            name="name"
            onChange={handleInput}
            type="text"
            placeholder="Enter your name"
            className="w-full bg-white border-gray-300 focus:border-purple-500 focus:ring-purple-500"
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
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