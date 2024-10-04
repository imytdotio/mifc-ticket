// src/DrinksPage.tsx
import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { useNavigate, useLocation } from "react-router-dom";

function DrinksPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [participantName, setParticipantName] = useState<string | null>(null);
  const [alcoholic, setAlcoholic] = useState(false);
  const [cocktailAssigned, setCocktailAssigned] = useState("");
  const [firstDrinkClaimed, setFirstDrinkClaimed] = useState(false);
  const [secondDrinkClaimed, setSecondDrinkClaimed] = useState(false);
  const [thirdDrinkClaimed, setThirdDrinkClaimed] = useState(false);
  const [cocktailSelected, setCocktailSelected] = useState(false);

  useEffect(() => {
    // Retrieve phone number and participant name from navigation state
    const state = location.state as {
      phoneNumber: string;
      participantName: string;
    };

    if (!state || !state.phoneNumber || !state.participantName) {
      navigate("/");
      return;
    }

    setPhoneNumber(state.phoneNumber);
    setParticipantName(state.participantName);

    const fetchData = async () => {
      // Fetch existing drink record
      const { data: drinkData, error: drinkError } = await supabase
        .from("drinks")
        .select(
          "alcoholic, cocktail_id, first_drink_claimed, second_drink_claimed, third_drink_claimed"
        )
        .eq("phone_number", state.phoneNumber)
        .single();

      if (drinkError && drinkError.code !== "PGRST116") {
        alert("Error fetching drink data.");
        return;
      }

      if (drinkData) {
        // User has a record in drinks table
        setAlcoholic(drinkData.alcoholic);
        setFirstDrinkClaimed(drinkData.first_drink_claimed);
        setSecondDrinkClaimed(drinkData.second_drink_claimed);
        setThirdDrinkClaimed(drinkData.third_drink_claimed);

        if (drinkData.cocktail_id) {
          setCocktailSelected(true);

          // Fetch cocktail name from cocktail_total
          const { data: cocktailData, error: cocktailError } = await supabase
            .from("cocktail_total")
            .select("name")
            .eq("drink_id", drinkData.cocktail_id)
            .single();

          if (cocktailError || !cocktailData) {
            alert("Error fetching cocktail data.");
            return;
          }

          setCocktailAssigned(`Your assigned cocktail: ${cocktailData.name}`);
        }
      }
    };

    fetchData();
  }, [navigate, location.state]);

  const handleGetVoucher = async () => {
    if (!phoneNumber) return;

    // Check if user already has a cocktail assigned
    if (cocktailAssigned) {
      alert("You have already been assigned a cocktail.");
      return;
    }

    // Convert boolean to integer for the query
    const alcoholicValue = alcoholic ? 1 : 0;

    // Fetch available cocktails based on alcoholic preference
    const { data: availableCocktails, error: fetchError } = await supabase
      .from("cocktail_total")
      .select("drink_id, name, quantity")
      .eq("alcoholic", alcoholicValue);

    if (fetchError) {
      console.error("Error fetching cocktails:", fetchError);
      alert("Error fetching cocktails.");
      return;
    }

    if (!availableCocktails || availableCocktails.length === 0) {
      alert("No cocktails available for your selection.");
      return;
    }

    // Randomly select a cocktail from the available ones
    const selectedCocktail =
      availableCocktails[
        Math.floor(Math.random() * availableCocktails.length)
      ];

    // Check if a record exists for the user
    const { data: existingDrink, error: existingDrinkError } = await supabase
      .from("drinks")
      .select("*")
      .eq("phone_number", phoneNumber)
      .single();

    if (existingDrinkError && existingDrinkError.code !== "PGRST116") {
      alert("Error checking existing drink data.");
      return;
    }

    if (existingDrink) {
      // Update existing record with cocktail details
      const { error: updateError } = await supabase
        .from("drinks")
        .update({
          alcoholic,
          cocktail_id: selectedCocktail.drink_id,
        })
        .eq("phone_number", phoneNumber);

      if (updateError) {
        console.error("Error updating cocktail:", updateError);
        alert("Error assigning cocktail.");
      } else {
        setCocktailAssigned(`Your assigned cocktail: ${selectedCocktail.name}`);
        setCocktailSelected(true);
      }
    } else {
      // Insert new record
      const { error: insertError } = await supabase.from("drinks").insert([
        {
          phone_number: phoneNumber,
          alcoholic,
          cocktail_id: selectedCocktail.drink_id,
          first_drink_claimed: false,
          second_drink_claimed: false,
          third_drink_claimed: false,
        },
      ]);

      if (insertError) {
        console.error("Error assigning cocktail:", insertError);
        alert("Error assigning cocktail.");
      } else {
        setCocktailAssigned(`Your assigned cocktail: ${selectedCocktail.name}`);
        setCocktailSelected(true);
      }
    }
  };

  const handleFirstDrink = async () => {
    if (!phoneNumber) return;

    if (firstDrinkClaimed) {
      alert("You have already claimed your first drink.");
      return;
    }

    // Update the `first_drink_claimed` field to true
    const { error } = await supabase
      .from("drinks")
      .update({ first_drink_claimed: true })
      .eq("phone_number", phoneNumber);

    if (error) {
      alert("Error updating first drink.");
    } else {
      setFirstDrinkClaimed(true);
    }
  };

  const handleSecondDrink = async () => {
    if (!phoneNumber) return;

    if (!cocktailSelected) {
      alert("Please get your cocktail voucher first.");
      return;
    }

    if (secondDrinkClaimed) {
      alert("You have already claimed your second drink.");
      return;
    }

    // Update the existing record
    const { error } = await supabase
      .from("drinks")
      .update({ second_drink_claimed: true })
      .eq("phone_number", phoneNumber);

    if (error) {
      alert("Error updating second drink.");
    } else {
      setSecondDrinkClaimed(true);
    }
  };

  const handleThirdDrink = async () => {
    if (!phoneNumber) return;

    if (!cocktailSelected) {
      alert("Please get your cocktail voucher first.");
      return;
    }

    if (thirdDrinkClaimed) {
      alert("You have already claimed your third drink.");
      return;
    }

    // Update the existing record
    const { error } = await supabase
      .from("drinks")
      .update({ third_drink_claimed: true })
      .eq("phone_number", phoneNumber);

    if (error) {
      alert("Error updating third drink.");
    } else {
      setThirdDrinkClaimed(true);
    }
  };

  const handleLogout = () => {
    // Clear state variables
    setPhoneNumber(null);
    setParticipantName(null);
    navigate("/");
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-screen bg-gray-900">
      <div className="max-w-md w-full p-5 bg-gray-800 shadow-lg rounded">
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-2xl font-bold text-white">
            Cocktail Party Voucher
          </h1>
        </div>
        {participantName && (
          <p className="mb-3 text-white">Welcome, {participantName}!</p>
        )}
        {!cocktailSelected ? (
          <>
            <label className="block mb-3">
              <span className="text-gray-300">Choose your cocktail type:</span>
              <select
                value={alcoholic ? "alcoholic" : "non-alcoholic"}
                onChange={(e) => setAlcoholic(e.target.value === "alcoholic")}
                className="block w-full mt-1 p-2 border border-gray-600 rounded bg-gray-700 text-white"
              >
                <option value="non-alcoholic">Non-Alcoholic</option>
                <option value="alcoholic">Alcoholic</option>
              </select>
            </label>
            <button
              onClick={handleGetVoucher}
              className="w-full p-2 bg-green-600 hover:bg-green-700 text-white rounded"
            >
              Get Cocktail Voucher
            </button>
          </>
        ) : (
          <>
            <p className="mb-3 text-white">{cocktailAssigned}</p>

            <div className="mt-5">
              <button
                onClick={handleFirstDrink}
                disabled={firstDrinkClaimed}
                className={`w-full p-2 ${
                  firstDrinkClaimed
                    ? "bg-gray-600"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white rounded mb-3`}
              >
                {firstDrinkClaimed ? "First Drink Claimed" : "Claim First Drink"}
              </button>
              <button
                onClick={handleSecondDrink}
                disabled={secondDrinkClaimed}
                className={`w-full p-2 ${
                  secondDrinkClaimed
                    ? "bg-gray-600"
                    : "bg-yellow-600 hover:bg-yellow-700"
                } text-white rounded mb-3`}
              >
                {secondDrinkClaimed ? "Second Drink Claimed" : "Claim Second Drink"}
              </button>
              <button
                onClick={handleThirdDrink}
                disabled={thirdDrinkClaimed}
                className={`w-full p-2 ${
                  thirdDrinkClaimed
                    ? "bg-gray-600"
                    : "bg-red-600 hover:bg-red-700"
                } text-white rounded`}
              >
                {thirdDrinkClaimed ? "Third Drink Claimed" : "Claim Third Drink"}
              </button>
            </div>
          </>
        )}

        <div className="mt-5">
          <button
            onClick={handleLogout}
            className="text-sm text-blue-400 hover:underline w-full bg-gray-700"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default DrinksPage;
