import React, { Component } from "react";
import "./App.css";
import TodoForm from "./components/TodoForm";
import TodoList from "./components/TodoList";

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const grid = 8;

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: "none",
  padding: grid * 2,
  margin: `0 0 ${grid}px 0`,

  // change background colour if dragging
  background: isDragging ? "lightgreen" : "grey",

  // styles we need to apply on draggables
  ...draggableStyle
});

const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? "lightblue" : "lightgrey",
  padding: grid,
  width: 200
});

class App extends Component {
  state = {
    todoItems:{
      item1610171688408: {
          isCompleted: false,
          todo: "test",
          children: [
              {
                todoChild: "test",
                status: false
              },
              {
                todoChild: "test",
                status: true
              },
              {
                todoChild: "Nixon",
                status: true
              },
              {
                todoChild: "Nancy",
                status: true
              }
          ]
      },
      item1610171688407: {
            isCompleted: false,
            todo: "test"
      }
    }
  };

  addToDoItems = item => {
    const items = { ...this.state.todoItems };
    items[`item${Date.now()}`] = item;
    this.setState({
      todoItems: items
    });
  };

  addTodoChildItems = item => {
    const items = { ...this.state.todoItems };
    
    this.setState({
      todoItems: items
    });
  }

  addTodoChildStatus = item => {
    const items = { ...this.state.todoItems };
    
    this.setState({
      todoItems: items
    });
  }

  removeToDoItem = item => {
    const todos = { ...this.state.todoItems };
    delete todos[item];
    this.setState({ todoItems: todos });
  };

  updateTodos = (key, updatedTodo) => {
    const todos = { ...this.state.todoItems };
    todos[key] = updatedTodo;
    this.setState({ todoItems: todos });
  };

  render() {
    return (
      <div className="App">
        <TodoForm addToDoItems={this.addToDoItems} />
        <div>
              {Object.keys(this.state.todoItems).map(key => (
                <TodoList
                  key={key}
                  index={key}
                  todoItems={this.state.todoItems[key]}
                  removeToDoItem={this.removeToDoItem}
                  updateTodos={this.updateTodos}
                  addTodoChildItems={this.addTodoChildItems}
                />
              ))}
            </div>
        </div>
    );
  }
}

export default App;