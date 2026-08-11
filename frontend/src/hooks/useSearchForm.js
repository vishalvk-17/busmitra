import { useState } from "react";
import { useNavigate } from "react-router-dom";

const useSearchForm = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    origin: "",
    destination: "",
    date: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const origin = form.origin.trim();
    const destination =
      form.destination.trim();

    if (!origin || !destination) {
      setError(
        "Please enter origin and destination"
      );
      return;
    }

    const params = new URLSearchParams({
      origin,
      destination,
    });

    if (form.date) {
      params.append("date", form.date);
    }

    navigate(
      `/search-bus?${params.toString()}`
    );
  };

  return {
    form,
    error,
    handleChange,
    handleSubmit,
  };
};

export default useSearchForm;