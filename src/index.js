const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  
  const user = users.find((user) => user.username == username);

  if(!user){
    return response.status(404).json({error : "User not found!"});
  }

  request.todos = user.todos;
  
  return next();
}

app.post('/users', (request, response) => {
  const {name, username} = request.body;

  const checkIfUsernameAlreadyExists = users.some(
    (user) => user.username === username
  );

  if(checkIfUsernameAlreadyExists){
    return response.status(400).json({error: "Username already exists!"});
  }

  users.push({
    id: uuidv4(),
    name,
    username,
    todos: []
  })

  return response.status(201).json(users.find((user) => user.username === username));
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { todos } = request;

  return response.status(200).json(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body;
  const { todos } = request;

  todos.push({
    id: uuidv4(),
    title : title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  });

  return response.status(201).json(todos.find((todo) => todo.title === title));

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { todos } = request;
  const { id } = request.params;

  const todo = todos.find((todo) => todo.id === id);

  if(!todo){
    return response.status(404).json({error: "toDo not found!"});
  }
  
  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.status(201).json(todo);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { todos } = request;
  const { id } = request.params;

  const todo = todos.find((todo) => todo.id === id);
  
  if(!todo){
    return response.status(404).json({error: "toDo not found!"});
  }

  todo.done = true

  return response.status(201).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { todos } = request;
  const { id } = request.params;

  const todo = todos.find((todo) => todo.id === id);

  if(!todo){
    return response.status(404).json({error: "toDo not found!"});
  }
  
  todos.splice(todo,1);

  return response.status(204).json(todos);
});

module.exports = app;