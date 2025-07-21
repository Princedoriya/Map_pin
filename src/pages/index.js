import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Sidebar from "../components/Sidebar";

const Map = dynamic(() => import("../components/Map"), { ssr: false });

export default function Home() {
  const [pins, setPins] = useState([]);
  const [selectedPinId, setSelectedPinId] = useState(null);

  // Fetch pins from backend API 
  useEffect(() => {
    const fetchPins = async () => {
      try {
        const response = await fetch("/api/pins");
        if (!response.ok) {
          throw new Error("Failed to fetch pins");
        }
        const data = await response.json();
        console.log("Fetched pins:", data);
        setPins(data);
        // Also save to localStorage
        localStorage.setItem("pins", JSON.stringify(data));
      } catch (error) {
        console.error("Error fetching pins:", error);
        // Fallback to localStorage if API fails
        const storedPins = JSON.parse(localStorage.getItem("pins") || "[]");
        setPins(storedPins);
      }
    };
    fetchPins();
  }, []);

  // Save pins to localStorage whenever pins change
  useEffect(() => {
    console.log("Pins updated:", pins);
    localStorage.setItem("pins", JSON.stringify(pins));
  }, [pins]);

  const handleAddPin = (pin) => {
    console.log("Adding pin:", pin);
    setPins((prevPins) => [...prevPins, pin]);
    setSelectedPinId(pin._id || pin.id);
  };

  const handleSelectPin = (pinId) => {
    console.log("Selecting pin:", pinId);
    setSelectedPinId(pinId);
  };


  const handleDeletePin = async (pinId) => {
    console.log("Deleting pin with id:", pinId);
    try {
      const response = await fetch(`/api/pins/${pinId}`, {
        method: "DELETE",
      });
      console.log("Delete response status:", response.status);
      if (!response.ok) {
        throw new Error("Failed to delete pin");
      }
      // Remove pin from state
      setPins((prevPins) =>
        prevPins.filter((pin) => (pin._id || pin.id) !== pinId)
      );
      
      const storedPins = JSON.parse(localStorage.getItem("pins") || "[]");
      const updatedPins = storedPins.filter(
        (pin) => (pin._id || pin.id) !== pinId
      );
      localStorage.setItem("pins", JSON.stringify(updatedPins));
      
      if (selectedPinId === pinId) {
        setSelectedPinId(null);
      }
    } catch (error) {
      console.error("Error deleting pin:", error);
    }
  };

  return (
    <div className="sm:flex-row-3 h-[100vh] bg-gradient-to-r from-[#1a202c] to-[#2d3748]">
      <header className="text-[24px] ml-[280px] text-shadow-transparent flex items-center justify-center mb-[48px] max-md:ml-0 max-md:px-4">
        <img
          src="./loc.png"
          className="h-[65px] w-[62px] hover:rotate-12 mr-[6px]"
        />
        <p className="flex justify-center items-center font-bold py-[24px] mt-[20px] text-[35px] text-[#dce2e9]">
          PinPoint Mapper
        </p>
      </header>
      <div className="max-w-full flex sm:flex-row justify-between items-center md:flex-row h-[500px]">
        <Sidebar
          pins={pins}
          onSelectPin={handleSelectPin}
          onDeletePin={handleDeletePin}
          className="w-full md:w-[350px]"
        />
        <div className="rounded-lg max-md:w-full w-[1005px] h-[500px] max-md:mt-4 mr-[90px]">
          <Map
            pins={pins}
            onAddPin={handleAddPin}
            onSelectPin={handleSelectPin}
            selectedPinId={selectedPinId}
          />
        </div>
      </div>
    </div>
  );
}
