import React, { Fragment } from "react";
import 'antd/dist/antd.css';
import { Modal, Button, Progress, Checkbox, Icon } from 'antd';
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
  width: 630
});

class TodoList extends React.Component {
  todoChild = React.createRef()
  constructor(props) {
    super(props);
    this.state = {
      visibleModal: false,
      progressBar: 0
    };
    this.onDragEnd = this.onDragEnd.bind(this);
  }
  state = {
      visibleModal: false,
      progressBar: 0
  }
  componentDidMount(){
      this.counterSubTask()
  }

  onDragEnd(result) {
    // dropped outside the list
    console.log(result);
    console.log("innner drag");
    if (!result.destination) {
      return;
    }
    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;
    if (result.type === "droppableItem") {
      const items = reorder(this.state.items, sourceIndex, destIndex);

      this.setState({
        items
      });
    } else if (result.type === "droppableSubItem") {
      const itemSubItemMap = this.state.items.reduce((acc, item) => {
        acc[item.id] = item.subItems;
        return acc;
      }, {});

      const sourceParentId = parseInt(result.source.droppableId);
      const destParentId = parseInt(result.destination.droppableId);

      const sourceSubItems = itemSubItemMap[sourceParentId];
      const destSubItems = itemSubItemMap[destParentId];

      let newItems = [...this.state.items];

      /** In this case subItems are reOrdered inside same Parent */
      if (sourceParentId === destParentId) {
        const reorderedSubItems = reorder(
          sourceSubItems,
          sourceIndex,
          destIndex
        );
        newItems = newItems.map(item => {
          if (item.id === sourceParentId) {
            item.subItems = reorderedSubItems;
          }
          return item;
        });
        this.setState({
          items: newItems
        });
      } else {
        let newSourceSubItems = [...sourceSubItems];
        const [draggedItem] = newSourceSubItems.splice(sourceIndex, 1);

        let newDestSubItems = [...destSubItems];
        newDestSubItems.splice(destIndex, 0, draggedItem);
        newItems = newItems.map(item => {
          if (item.id === sourceParentId) {
            item.subItems = newSourceSubItems;
          } else if (item.id === destParentId) {
            item.subItems = newDestSubItems;
          }
          return item;
        });
        this.setState({
          items: newItems
        });
      }
    }
  }

  handleChange = event => {
    const updateTodo = {
      ...this.props.todoItems,
      [event.currentTarget.name]: event.currentTarget.value
    };
    this.props.updateTodos(this.props.index, updateTodo);
    this.counterSubTask()
  };

  toggleCheckbox = event => {
    
    const updateTodo = {
      ...this.props.todoItems,
      [event.currentTarget.name]: event.currentTarget.checked
    };
    this.counterSubTask();
    this.props.updateTodos(this.props.index, updateTodo);
    
  };

  counterSubTask(){
    const { index, todoItems } = this.props;
    const { progressBar } = this.state
    let counter = 0;
    let totalChildItem = 0;
    var progress = 0;
    let childArray = todoItems.children;
    for (var x in childArray) {
      if (childArray.hasOwnProperty(x)) totalChildItem++;
      if (childArray[x].status === true) counter++;
    }
    
    if(totalChildItem !== 0){
      progress = (counter*100/totalChildItem)
    } else if(totalChildItem !== 0 || todoItems.isCompleted === false){
      progress = 0
    } else {
        progress = 100
    }
    console.log(todoItems.isCompleted)
    
    this.setState({
      progressBar: progress
    })
  }

  toggleChildCheckbox = event => {
    let itemName = event.target.name;
    let checked = event.target.checked;
    const { index, todoItems } = this.props;
    let childArray = todoItems.children;

    for (var x in childArray) {
      if (childArray[x].todoChild === event.target.name)
          childArray[x].status = event.target.checked;
          console.log(childArray[x])
    }
    const updateTodo = {
      ...this.props.todoItems,
    };
    this.props.updateTodos(this.props.index, updateTodo);
    this.counterSubTask();
  };


  handleChildChange = event => {

    const { index, todoItems } = this.props;

    let childArray = todoItems.children;
    console.log(event.target.value);
    

    const updateTodo = {
      ...this.props.todoItems,
    };
    this.props.updateTodos(this.props.index, updateTodo);
    this.counterSubTask()
  };

  showModal = (e) => {
    this.setState({
      visibleModal: true
    });
  };

  handleOk = e => {
    e.preventDefault();

    const  newChildren= {
      todoChild: this.todoChild.current.value,
      status: false
    }
    const { index, todoItems } = this.props
    const updateTodo = {
      ...this.props.todoItems,
      children: [newChildren]
    };

    if(todoItems.children !== undefined){
      todoItems.children.push(newChildren)
    } else {
      this.props.updateTodos(this.props.index, updateTodo);
    }
    this.counterSubTask()
    this.todoChild.current.value = ""
    this.setState({
        visibleModal: false
    })
  };

  removeChildItem = (e, key) => {
    const { index, todoItems } = this.props
    delete todoItems.children[key];
    
    const updateTodo = {
      ...this.props.todoItems,
    };
    this.props.updateTodos(this.props.index, updateTodo);
    this.counterSubTask()
  }

  handleCancel = () => {
    this.setState({
      visibleModal: false
    })
  };

  render() {
    const { visibleModal } = this.state
    return (
      <Fragment>
        <div className="container">
          <DragDropContext onDragEnd={this.onDragEnd}>
            <Droppable droppableId="droppable" type="droppableItem">
            {(provided, snapshot) => (
              <div
              ref={provided.innerRef}
              style={getListStyle(snapshot.isDraggingOver)}
            >
              <div className="parent-list">
              <Draggable key={this.props.index} draggableId={this.props.index} index={this.props.index}>
                  {(provided, snapshot) => (
                    <div>
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        style={getItemStyle(
                          snapshot.isDragging,
                          provided.draggableProps.style
                        )}
                      >
                  
                        <span
                          {...provided.dragHandleProps}
                          style={{
                            display: "inline-block",
                            margin: "0 10px",
                            border: "1px solid #000"
                          }}
                        >
                          Drag
                        </span>
                      
                      </div>
                      {provided.placeholder}
                    </div>
                  )}
                </Draggable>
                <div className="item-layout">
                    <div className="item-header ">
                        <div className="w-100 ">
                              <Progress percent={this.state.progressBar} />
                        </div>
                    </div>
                    </div>
                    <div className={this.props.todoItems.isCompleted ? "done" : null, this.props.todoItems.children === undefined ? "no-child" : null}>
                      {
                        this.props.todoItems.children === undefined ? 
                          <input type="checkbox" name="isCompleted"  checked={this.props.todoItems.isCompleted} onChange={this.toggleCheckbox}/>
                        : null 
                      } 
                      <div className="item-header">
                        <input  type="text" name="todo" value={this.props.todoItems.todo}  onChange={this.handleChange} />
                      </div>
                        {
                          this.props.todoItems.children !== undefined ?
                            this.props.todoItems.children.map(({todoChild, status}, index) => (
                                <div key={index} className="child">
                                      <input
                                        type="checkbox"
                                        name={todoChild}
                                        checked={status === true ? true : false}
                                        onChange={this.toggleChildCheckbox}
                                        // checked={this.props.todoItems.isChecked}
                                      />
                                    
                                      <input
                                        type="text"
                                        name={todoChild}
                                        value={todoChild}
                                        onChange={this.handleChildChange}
                                      />
                                    
                                      <Button
                                        className="del-item-btn"
                                        onClick={() => this.removeChildItem(this, index)}
                                      >
                                        Remove
                                      </Button>
                                </div>
                              
                            ))
                          : (``)
                        }
                      {/* <button>Edit</button> */}

                     

                      {this.props.todoItems.children === undefined ? 
                      <Button
                      className="del-item-btn"
                        onClick={() => this.props.removeToDoItem(this.props.index)}
                      >
                        Remove Item
                      </Button>
                      : (``)
                      }
                    
                  </div>
                  <div>
                    <button
                      className="add-btn"
                      onClick={() => this.showModal(this.props.todoItems.todo)}
                    >
                      Add Item
                    </button>
                  </div>
              </div>
              {provided.placeholder}
            </div>
            )}
            </Droppable>
          </DragDropContext>
          <Modal title="Add Subtask" visible={visibleModal} onOk={this.handleOk} onCancel={this.handleCancel}>
            <form onSubmit={this.handleOk}>
              <input type="text" name="todosTxtbx" ref={this.todoChild} required />
            </form>
          </Modal>
        </div>
      </Fragment>
    );
  }
}

export default TodoList;