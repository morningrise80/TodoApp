import React, { useState } from 'react';
import { TextField, Button, List, ListItem, ListItemText, Checkbox } from '@mui/material';
import Axios from 'axios'
import './App.css';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newTodo.trim() !== '') {
      const todoObj = { text: newTodo, completed: false };
      setTodos([...todos, todoObj]);
      setNewTodo('');
    }
  };

  const markAsComplete = (index) => {
    const updatedTodos = [...todos];
    updatedTodos[index].completed = !updatedTodos[index].completed;
    setTodos(updatedTodos);
  };

  return (
    <div className="app-container">
      <h1>Todo List</h1>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Type a Todo Item"
          variant="outlined"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
        />
        <Button variant="contained" color="primary" type="submit">
          Add Todo
        </Button>
      </form>

      <List>
        {todos.map((todo, index) => (
          <ListItem key={index} className={todo.completed ? 'completed' : ''}>
            <Checkbox
              checked={todo.completed}
              onChange={() => markAsComplete(index)}
            />
            <ListItemText primary={todo.text} />
          </ListItem>
        ))}
      </List>
    </div>
  );
}

export default App;
