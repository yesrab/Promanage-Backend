# Pro Manage

Pro Manage is a simple web application that mimics the functionality of Trello, a popular project management tool. It is built with React, a JavaScript library for creating user interfaces. Pro Manage allows you to create boards, lists, and cards to organize your tasks and collaborate with others. You can also drag and drop cards to reorder them, edit card details, and add comments. Pro Manage is a personal project that demonstrates the use of React hooks, custom components, and state management.

# Features

Create, edit, and delete cards
move them between lists of Backlog , To-do, In progress , Done
Add card details such as title, due date, and list of tasks
share cards to other people

# Installation

To run Pro Manage locally, you need to have [Node.js] and [npm] installed on your machine. Then, follow these steps:

Clone these two repositories or download the zip file
Navigate to the project directory and run npm install to

#### FrontEnd : `https://github.com/yesrab/Promanage-Frontend`

#### BackEnd : `https://github.com/yesrab/Promanage-Backend`

install the dependencies:

```
install all the dependencies : npm install
start frontEnd : npm run dev
start BackEnd : npm run dev:server
```

Environment setup:

```
Environment variables
DB="your mongodb connection URI"
JWT_SUPER_SEACRETE="your jwt super secret"
```

### FrontEnd dependencies:

- ReactJS
- React Router Dom
- react hot toast
- react day picker

### BackEnd dependencies

- bcrypt
- cors
- dotenv
- express
- express-async-errors
- jsonwebtoken
- mongoose

Open [http://localhost:5713] in your browser to view the app
Demo
You can view a live demo of Pro Manage [here](https://pro-manage-yesrab.vercel.app/).
