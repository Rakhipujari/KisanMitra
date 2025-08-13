/* global google */
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [pestInfo, setPestInfo] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setPestInfo(null); // Reset pest info on new file selection
    setError(""); // Clear previous errors

    // Generate a preview of the selected image
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result); // Set image preview URL
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select an image to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
    const response = await axios.post("http://127.0.0.1:5000/api/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });


      if (response.data.success) {
        setPestInfo(response.data.pest_info);
      } else {
        setError(response.data.message || "Error processing the image.");
      }
    } catch (err) {
      setError("Failed to upload the image. Please try again.");
    }
  };

  // Dynamically load the Google Translate script
  useEffect(() => {
    const addGoogleTranslateScript = () => {
      if (!document.getElementById("google-translate-script")) {
        const script = document.createElement("script");
        script.id = "google-translate-script";
        script.type = "text/javascript";
        script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        document.body.appendChild(script);
      }
    };

    window.googleTranslateElementInit = () => {
      new google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,es,hi,kn,mr,te,ta",
          layout: google.translate.TranslateElement.InlineLayout.SIMPLE
        },
        "google_translate_element"
      );
    };

    addGoogleTranslateScript();
  }, []);

  return (
    <div className="App">
      {/* Google Translate Button */}
      <div id="google_translate_element" className="translate-button"></div>
      <p>Upload an image of a pest to get details about it.</p>

      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload Image</button>

      {error && <p className="error">{error}</p>}

      {imagePreview && (
        <div className="image-preview">
          <h3>Uploaded Image:</h3>
          <img src={imagePreview} alt="Uploaded preview" style={{ maxWidth: "300px", maxHeight: "300px" }} />
        </div>
      )}

      {pestInfo && (
  <div className="pest-info">
    <h2>{pestInfo.name}</h2>
    <p>{pestInfo.description}</p>
    <p><strong>Life Cycle:</strong> {pestInfo.life_cycle}</p>
    <h3>Solutions:</h3>
    <ul>
      {pestInfo.solutions.traditional && (
        <>
          <h4>Traditional Solutions:</h4>
          {pestInfo.solutions.traditional.map((solution, index) => (
            <li key={`traditional-${index}`}>{solution}</li>
          ))}
        </>
      )}
      {pestInfo.solutions.organic && (
        <>
          <h4>Organic Solutions:</h4>
          {pestInfo.solutions.organic.map((solution, index) => (
            <li key={`organic-${index}`}>{solution}</li>
          ))}
        </>
      )}
      {pestInfo.solutions.chemical && (
        <>
          <h4>Chemical Solutions:</h4>
          {pestInfo.solutions.chemical.map((solution, index) => (
            <li key={`chemical-${index}`}>{solution}</li>
          ))}
        </>
      )}
    </ul>
  </div>
)}
    </div>
  );
}

export default App;