require("dotenv").config();
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const axios = require("axios");
const bodyParser = require("body-parser");
const path = require("path");
const pdfParse = require("pdf-parse"); // ✅ Added for reading PDFs

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname))); // Serve static files (HTML, CSS, JS)

const upload = multer({ dest: "uploads/" });

app.post("/upload", upload.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    try {
        const dataBuffer = fs.readFileSync(req.file.path);
        const data = await pdfParse(dataBuffer); // ✅ Extract text from PDF
        const extractedText = data.text;

        const API_KEY = process.env.API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
        const requestData = {
            contents: [{ parts: [{ text: `Analyze this file for fraud detection:\n${extractedText}` }] }],
        };

        const response = await axios.post(url, requestData, {
            headers: { "Content-Type": "application/json" },
        });

        const aiResponse = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI";
        res.json({ message: aiResponse });

    } catch (error) {
        console.error("Error processing file or calling AI:", error);
        res.status(500).json({ error: "AI processing failed" });
    } finally {
        fs.unlinkSync(req.file.path); // ✅ Clean up file
    }
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
});
