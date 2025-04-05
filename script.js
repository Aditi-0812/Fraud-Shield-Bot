const API_KEY = "AIzaSyDZaly6ZdvxDhdXOB1RKp4KGolP13dSi6Q"; 

async function getResponse(userInput) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
    const requestData = { contents: [{ parts: [{ text: userInput }] }] };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestData)
        });

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't understand that.";
    } catch (error) {
        console.error("Error fetching response:", error);
        return "Error connecting to AI service.";
    }
}

function appendMessage(text, isUser) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add(isUser ? "userMessage" : "botMessage");
    messageDiv.textContent = isUser ? `You: ${text}` : `FraudShield: ${text}`;

    document.getElementById("chatbox").appendChild(messageDiv);
    
    // Auto-scroll to latest message
    setTimeout(() => {
        document.getElementById("chatbox").scrollTop = document.getElementById("chatbox").scrollHeight;
    }, 100);
}

// Send button event listener
document.getElementById("sendButton").addEventListener("click", async function() {
    const userInput = document.getElementById("userInput").value.trim();
    if (!userInput) return;

    appendMessage(userInput, true);
    document.getElementById("userInput").value = "";

    const botResponse = await getResponse(userInput);
    appendMessage(botResponse, false);
});

// Handle File Upload with Backend API
document.getElementById("fileUpload").addEventListener("change", async function(event) {
    const file = event.target.files[0];

    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    appendMessage(`📁 File uploaded: ${file.name}`, true);

    try {
        const response = await fetch("https://fraud-shield-bot-1.onrender.com", {
            method: "POST",
            body: formData
        });

        const data = await response.json();
        appendMessage(`FraudShield: ${data.message}`, false);
    } catch (error) {
        appendMessage("Error checking file!", false);
    }
});

// Alert on page load
document.addEventListener("DOMContentLoaded", function() {
    alert("Hello! How can I assist you?");
});
