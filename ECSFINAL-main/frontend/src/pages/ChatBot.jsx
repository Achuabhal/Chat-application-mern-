import { useState, useEffect, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import './css/chat.css';
import { marked } from 'marked';

const Chatbot = () => {
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const API_KEY = "AIzaSyCT6j3_5KWpHyQ6XDL4FbpdPVTyjdx67Cs";

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  const handleSendMessage = async () => {
    if (!userInput) return;

    const newMessage = { role: "user", content: userInput };
    setMessages((prev) => [...prev, newMessage]);
    setLoading(true);

    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Only respond with study-related information reply like to a study companion. User: ${userInput}`;
      const result = await model.generateContent(prompt);

      const botMessage = {
        role: "assistant",
        content: result.response.text(),
      };
      botMessage.content = await marked(botMessage.content);
      setMessages((prev) => [...prev, botMessage]);
      setUserInput("");
    } catch (error) {
      console.error("Error fetching response from Gemini:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "An error occurred while generating content." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="spot-container">
      <header className="spot-header">
        <h1>chatty</h1>
        <p>Your CHATTY  Companion</p>
      </header>

      <div className="spot-chat">
        <div className="spot-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.role}`}>
              <strong>{msg.role === "user" ? "You" : "chatty"}:</strong>
              {msg.role === "assistant" ? (
                <div dangerouslySetInnerHTML={{ __html: marked(msg.content) }} />
              ) : (
                msg.content
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="spot-input">
        <input
          type="text"
          placeholder="Ask anything on chatty"
          value={userInput}
          onChange={handleInputChange}
        />
        <button onClick={handleSendMessage} disabled={loading}>
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
