import React, { useState } from "react";

function App() {
    const [input, setInput] = useState("");
    const [response, setResponse] = useState("");

    const generateText = async () => {
        try {
            const res = await fetch("http://localhost:5002/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: input }),
            });
            const data = await res.json();
            if (data.error) {
                setResponse(`Error: ${data.error}`);
            } else {
                setResponse(data.response);
            }
        } catch (error) {
            setResponse(`Error: ${error.message}`);
        }
    };

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h2>AI Text Generator</h2>
            <textarea
                placeholder="Enter prompt..."
                onChange={(e) => setInput(e.target.value)}
                rows="4"
                cols="50"
            />
            <br />
            <button onClick={generateText}>Generate</button>
            <p><strong>Response:</strong> {response}</p>
        </div>
    );
}

export default App;