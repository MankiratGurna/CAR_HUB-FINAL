# CarHub Project - Comprehensive Code Explanation

This document explains the entire CarHub backend and frontend architecture from scratch, detailing what each part does and how they work together.

---

## 1. Core Technology Stack
- **Node.js**: The runtime environment that executes JavaScript on the server.
- **Express.js**: A web framework for Node.js used to handle routes, requests, and middleware.
- **MongoDB & Mongoose**: MongoDB is the database (NoSQL), and Mongoose is the library used to interact with it from Node.js using "Models".
- **Express-Session**: Middleware used to keep users logged in by creating a "session" on the server and a "cookie" in the browser.
- **Bcrypt**: Used for securely hashing passwords before saving them to the database.

---

## 2. Project Structure
- `app.js`: The main entry point of the server.
- `database/dbConnection.js`: Handles the connection to MongoDB Atlas.
- `models/`: Contains the "Blueprints" for our data (User, Service, etc.).
- `routes/userRouter.js`: Contains all the "logic" for our pages and API endpoints.
- `views/`: The HTML pages the user sees.
- `public/`: Static files like CSS and images.

---

## 3. The Backend Logic (`app.js`)
This file initializes the server.
- It connects to the database.
- It sets up **Middleware** like `express.json()` (to read form data) and `express-session` (to track users).
- It tells the app to use the `userRouter` for all incoming requests.

---

## 4. Database Models (`models/`)
Each file here defines what a record looks like in the database.
- **User.js**: Stores `username`, `email`, and a hashed `password`.
- **ServiceBooking.js**: Stores details about car washing, servicing, or modifications. Most importantly, it now includes a `userId` to link the booking to the person who made it.
- **SellCar.js**: Stores details of cars that users list for sale (includes photos and price).
- **Purchase.js**: Stores records of cars bought by users through the "Buy" page.

---

## 5. Routing & Authentication (`routes/userRouter.js`)
This is the "brain" of the application.

### Authentication Flow:
- **Signup**: Takes user input, hashes the password using Bcrypt, and saves a new User record.
- **Login**: Checks if the user exists and if the password matches. If successful, it saves the user's ID in `req.session.userId`.
- **isAuthenticated Middleware**: A custom function that checks if a `userId` exists in the session. If not, it redirects the user to the login page. This protects pages like `/profile` and `/sell`.

### The Registration API (`/api/my-registrations`):
When you visit the profile page, the browser sends a request to this endpoint. The server:
1. Looks at the `req.session.userId`.
2. Searches all collections (Bookings, Sales, Purchases) for records matching that ID.
3. Returns a JSON object containing all of them.

---

## 6. The Frontend Integration
The HTML files in `views/` are mostly static, but they use **JavaScript (`fetch`)** to talk to the backend.

- **Dynamic Navigation**: We added "My Registrations" and "Logout" to the navbar.
- **Profile Dashboard (`profile.html`)**: This page uses JavaScript to fetch the data from `/api/my-registrations` and dynamically builds the lists of bookings and purchases you see on the screen.
- **Logout Popup**: When you click logout, the server clears your session and redirects you to `/login?logout=true`. The login page has a script that looks for this "logout" signal and shows the alert popup.

---

## 7. How Data is Linked
The "magic" that makes the profile page work is the **`userId`**. Every time you submit a form (like booking a wash), the backend adds your session ID to that data:
```javascript
const newBooking = new ServiceBooking({
    ...formData,
    userId: req.session.userId // This connects the data to YOU
});
```

---

**Summary**: The system is now a full-stack application with a secure login system, a database that tracks individual user actions, and a beautiful dashboard to manage everything in one place.
