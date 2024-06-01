import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f5f5f5;
`;

const ChatBox = styled.div`
  width: 60%;
  max-width: 800px;
  background-color: #fff;
  padding: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow-y: auto;
  max-height: 80vh;
`;

const Title = styled.h1`
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
`;

const Message = styled.div`
  margin: 10px 0;
`;

const Input = styled.input`
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: calc(100% - 22px);
`;

const Button = styled.button`
  padding: 10px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #0056b3;
  }
`;

const SolutionBlock = styled.div`
  margin-top: 20px;
  padding: 10px;
  background-color: #e9ecef;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [ref, setRef] = useState('');
  const [prompt, setPrompt] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ref || !prompt) return;

    const userMessage = { ref, prompt };
    setMessages([...messages, userMessage]);
    setRef('');
    setPrompt('');

    try {
      const response = await axios.post('http://127.0.0.1:5000/api/solve', { ref, prompt });
      const solution = { solution: response.data.solution };
      setMessages([...messages, userMessage, solution]);
    } catch (error) {
      console.error("There was an error!", error);
    }
  };

  return (
    <Container>
      <ChatBox>
        <Title>Chatbot</Title>
        {messages.map((msg, index) => (
          <Message key={index}>
            {msg.ref && <p><strong>Ref:</strong> {msg.ref}</p>}
            {msg.prompt && <p><strong>Prompt:</strong> {msg.prompt}</p>}
            {msg.solution && <SolutionBlock><strong>Solution:</strong> {msg.solution}</SolutionBlock>}
          </Message>
        ))}
        <form onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="Reference"
            value={ref}
            onChange={(e) => setRef(e.target.value)}
          />
          <Input
            type="text"
            placeholder="Prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <Button type="submit">Submit</Button>
        </form>
      </ChatBox>
    </Container>
  );
};

const App = () => (
  <Chat />
);

export default App;
