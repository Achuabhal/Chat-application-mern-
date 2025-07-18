import express from "express";
import axios from "axios";


const router = express.Router();




router.post("/translate", async (req, res) => {
    const { text, target } = req.body;
  
    // Validate required fields
    if (!text || !target) {
      return res.status(400).json({ error: "Missing text or target language" });
    }
  
    try {
      // Construct the MyMemory Translation API URL
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
        text
      )}&langpair=en|${target}`;
  
      // Log the URL to ensure it's correctly formed
      console.log("Calling MyMemory API with URL:", url);
  
      // Call the MyMemory Translation API
      const response = await axios.get(url);
  
      // Log the entire response from MyMemory for debugging
      console.log("MyMemory API response data:", response.data);
  
      // Check if response data is in the expected structure
      if (!response.data || !response.data.responseData) {
        return res.status(500).json({
          error: "Invalid response structure from translation API",
        });
      }
  
      const translatedText = response.data.responseData.translatedText;
      res.json({ translatedText });
    } catch (error) {
      // Log full error details for debugging
      console.error(
        "Translation error:",
        error.response ? error.response.data : error.message
      );
      res.status(500).json({
        error: "Translation failed",
        details: error.response ? error.response.data : error.message,
      });
    }
  });
  



export default router;
