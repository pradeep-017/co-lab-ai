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
  max-width: 600px;
  background-color: #fff;
  padding: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
`;

const Title = styled.h1`
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
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

function App() {
  const [ref, setRef] = useState('');
  const [prompt, setPrompt] = useState('');
  const [solution, setSolution] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://127.0.0.1:5000/api/solve', { ref, prompt })
      .then(response => {
        setSolution(response.data.solution);
      })
      .catch(error => {
        console.error("There was an error!", error);
      });
  };

  return (
    <Container>
      <ChatBox>
        <Title>Chatbot</Title>
        <Form onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="Ref"
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
        </Form>
        {solution && (
          <SolutionBlock>
            <strong>Solution:</strong>
            <p>{solution}</p>
          </SolutionBlock>
        )}
      </ChatBox>
    </Container>
  );
}

export default App;
