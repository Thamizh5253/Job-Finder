import React, { useEffect } from 'react';
import { Widget, addResponseMessage } from 'react-chat-widget';
import 'react-chat-widget/lib/styles.css';

const FAQChatbot = () => {
  useEffect(() => {
    // Add a welcome message when the chatbot loads
    addResponseMessage('Hi! I’m your FAQ assistant. How can I help you today?');
  }, []);

  const handleNewUserMessage = (newMessage) => {
    // Convert user message to lowercase for easier matching
    const message = newMessage.toLowerCase();

    // Predefined FAQ responses
    // Cost/Price-Related Questions
  if (message.includes('cost') || message.includes('price') || message.includes('quote')) {
    addResponseMessage('Our billboard spaces are available at competitive prices. Contact us for a quote!');
  }
  // Location/Land-Related Questions
  else if (message.includes('location') || message.includes('land') || message.includes('map')) {
    addResponseMessage('We have premium billboard locations across the city. Let us know your preferred area!');
  }
  // Communication-Related Questions
  else if (message.includes('communication') || message.includes('contact') || message.includes('chat')) {
    addResponseMessage('You can communicate with landowners and advertisers in real-time through our platform.');
  }
  // Registration/Sign-Up-Related Questions
  else if (message.includes('register') || message.includes('sign up') || message.includes('account')) {
    addResponseMessage('Click the "Register" button at the top right to create an account.');
  }
  // Login/Sign-In-Related Questions
  else if (message.includes('login') || message.includes('sign in')) {
    addResponseMessage('Click the "Login" button at the top right to access your account.');
  }
  // General/Other Questions
  else {
    addResponseMessage('Sorry, I didn’t understand that. Can you rephrase your question?');
  }
  };

  return (
    <div>
      <Widget
        handleNewUserMessage={handleNewUserMessage}
        title="FAQ Chatbot"
        subtitle="Ask me anything about billboard management!"
        emojis // Enable emoji support
      />
    </div>
  );
};

export default FAQChatbot;