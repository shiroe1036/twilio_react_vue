import { useEffect, useState } from "react";
import "../css/conversation.css";

export function Conversations({ active_conversation_prop, name_prop }) {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  //   const [isSignedInUser, setIsSignedInUser] = useState(false);

  useEffect(() => {
    active_conversation_prop.getMessages().then((newMessages) => {
      setMessages((prevState) => [...prevState, ...newMessages.items]);
    });

  }, [active_conversation_prop]);

  useEffect(() => {
    active_conversation_prop.on("messageAdded", (message) => {
      setMessages([...messages, message]);
    });
  }, [active_conversation_prop, messages]);

  const sendMessage = () => {
    active_conversation_prop.sendMessage(messageText).then(() => {
      setMessageText("");
    });
  };

  const handleValueInput = (e) => {
    setMessageText(e.target.value);
  };

  return (
    <div id="conversation">
      <div className="conversation-container">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`bubble-container ${
              message?.state?.author === name_prop ? "myMessage" : ""
            }`}
          >
            <div className="bubble">
              <div className="name">{message?.state?.author}:</div>
              <div className="message">{message?.state?.body}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="input-container">
        <input
          type="text"
          onChange={handleValueInput}
          value={messageText}
          placeholder="Enter your message"
        />
        <button onClick={sendMessage}>Send message</button>
      </div>
    </div>
  );
}
