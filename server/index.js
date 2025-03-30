const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");
const cors = require("cors");
const dbConnect = require("./config/database");

dotenv.config();
dbConnect();

const app = express();
app.use(express.json());
app.use(cors());

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const MODEL_NAME = process.env.MODEL_NAME;

// ✅ API Endpoint to Generate Text from the Model
app.post("/generate", async (req, res) => {
  console.log("Received request:", req.body);
  try {
      const { text } = req.body;
      if (!text) {
          return res.status(400).json({ error: "Text input is required" });
      }
      console.log("Sending text to Hugging Face:", text);

      const response = await axios.post(
          `https://api-inference.huggingface.co/models/${MODEL_NAME}`,
          {
              inputs: text
          },
          {
              headers: { 
                  Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
                  "Content-Type": "application/json"
              },
          }
      );

      console.log("Response from Hugging Face:", response.data);
      if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
          throw new Error("Invalid response from Hugging Face API");
      }
      
      const generatedText = response.data[0].generated_text || text;
      res.json({ response: generatedText });
  } catch (error) {
      console.error("Error details:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
      });
      
      // Handle specific API errors
      if (error.response?.status === 401) {
          return res.status(401).json({ error: "Invalid API key or unauthorized access" });
      } else if (error.response?.status === 503) {
          return res.status(503).json({ error: "Model is currently loading. Please try again in a few seconds." });
      } else if (error.response?.data?.error) {
          return res.status(500).json({ error: error.response.data.error });
      }
      
      res.status(500).json({ error: "Failed to generate response. Please try again." });
  }
});


// // Mount the todo routes
// app.use("/api/v1", todoRoutes);

// ✅ Start Server
const PORT = 5002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
