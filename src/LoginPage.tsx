// src/LoginPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";

function LoginPage() {
  const [inputPhoneNumber, setInputPhoneNumber] = useState("");
  const navigate = useNavigate();

  const handlePhoneNumberSubmit = async () => {
    // Fetch participant's name
    const { data: participantData, error: participantError } = await supabase
      .from("spacebar_registration")
      .select("name")
      .eq("phone_number", inputPhoneNumber)
      .single();

    if (participantError || !participantData) {
      alert("Participant not found.");
      return;
    } else {
      // Pass phone number and participant name via navigation state
      navigate("/drinks", {
        state: {
          phoneNumber: inputPhoneNumber,
          participantName: participantData.name,
        },
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-screen bg-gray-900 p-4">
      <div className="w-full max-w-2xl p-5 bg-gray-800 shadow-lg rounded mx-auto">
        <h1 className="text-2xl font-bold mb-5 text-center pp-fragment text-yellow-400 tracking-tight">
          Space Bar Cocktail Voucher
        </h1>
        <input
          type="text"
          placeholder="Enter your phone number"
          value={inputPhoneNumber}
          onChange={(e) => setInputPhoneNumber(e.target.value)}
          className="w-full p-2 border border-gray-600 rounded mb-3 bg-gray-700 text-white placeholder-gray-400 pp-fragment"
        />
        <button
          onClick={handlePhoneNumberSubmit}
          className="w-full p-2 bg-teal-300 hover:bg-teal-400 rounded transition-all duration-300 pp-fragment"
        >
          Submit
        </button>
      </div>
    </div>
  );
}

export default LoginPage;
