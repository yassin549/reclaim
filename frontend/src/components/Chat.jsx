import { useState, useRef, useEffect } from "react";
import axios from "axios";
import TypingIndicator from './TypingIndicator';

const API_BASE_URL = "http://localhost:8000/api";

export default function Chat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load or create a session
  useEffect(() => {
    const loadOrCreateSession = async () => {
      try {
        // Try to get the most recent session
        const res = await axios.get(`${API_BASE_URL}/sessions/`, {
          params: { user_id: "test-user-123" }
        });

        if (res.data.length > 0) {
          // Use the most recent session
          setCurrentSession(res.data[0]);
          // Load its messages
          const messages = res.data[0].messages.map(msg => ({
            user: msg.role === 'user' ? msg.content : null,
            bot: msg.role === 'assistant' ? msg.content : null
          }));
          setMessages(messages);
        } else {
          // Create a new session
          const newSession = await axios.post(`${API_BASE_URL}/sessions/`, {
            user_id: "test-user-123"
          });
          setCurrentSession(newSession.data);
        }
      } catch (error) {
        console.error('Error loading/creating session:', error);
      }
    };

    loadOrCreateSession();
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !currentSession) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { user: userMessage, bot: null }]);
    setIsLoading(true);

    try {
      // Send message to current session
      const res = await axios.post(
        `${API_BASE_URL}/sessions/${currentSession.id}/message/`,
        { message: userMessage }
      );

      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].bot = res.data.ai_message.content;
        return newMessages;
      });
    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].bot = "I apologize, but I'm having trouble processing your request right now. Please try again.";
        return newMessages;
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 h-[calc(100vh-4rem)]">
      <div className="h-full flex flex-col space-y-4">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto rounded-2xl bg-white p-6 shadow-lg space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4-4-4z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">Welcome to your AI Therapy Session</h2>
                <p className="text-gray-600">How are you feeling today?</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((msg, i) => (
                <div key={i} className="space-y-4">
                  {/* User message */}
                  {msg.user && (
                    <div className="flex justify-end">
                      <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm py-3 px-4 max-w-[80%] shadow-md">
                        {msg.user}
                      </div>
                    </div>
                  )}
                  {/* Bot message */}
                  {(msg.bot !== undefined) && (
                    <div className="flex justify-start">
                      {msg.bot === null ? (
                        <div className="bg-gray-100 rounded-2xl rounded-tl-sm py-3 px-4 shadow-md">
                          <TypingIndicator />
                        </div>
                      ) : (
                        <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-tl-sm py-3 px-4 max-w-[80%] shadow-md">
                          {msg.bot}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={sendMessage} className="bg-white p-4 rounded-2xl shadow-lg">
          <div className="flex space-x-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 bg-gray-100 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              disabled={isLoading || !currentSession}
            />
            <button
              type="submit"
              disabled={isLoading || !currentSession}
              className={`px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors flex items-center space-x-2 ${(isLoading || !currentSession) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span>Send</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
