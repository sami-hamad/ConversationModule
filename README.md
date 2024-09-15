
# Conversation Module

This project includes a **front-end** built with **Next.js** and **TypeScript**, and a **back-end** powered by **FastAPI** and **MongoDB**.

## Getting Started

### Prerequisites

Before getting started, ensure you have the following installed:

- **Node.js** version 20.17.X or later
- **npm** or **yarn** (for managing Node.js packages)
- **Python** version 3.10 or later
- **pip** (Python package manager)
- **MongoDB** (local installation or MongoDB Atlas for cloud-based setup)

---

## Frontend Setup (Next.js)

### Installation & Running the Frontend Server

1. Clone the repository:

   ```bash
   git clone https://github.com/sami-hamad/ConversationModule.git
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## Backend Setup (FastAPI)

### Prerequisites

- **Python** version 3.10 or later
- **MongoDB** (either installed locally or using a cloud service like MongoDB Atlas)

### Installation & Running the Backend Server

1. Clone the backend repository (if it's separate):

   ```bash
   git clone https://github.com/sami-hamad/ConversationModule.git
   cd backend
   ```

2. Create and activate a virtual environment:

   - For Mac/Linux:

     ```bash
     python3 -m venv env
     source env/bin/activate
     ```

   - For Windows:

     ```bash
     python -m venv env
     .\venv\Scripts\Activate
     ```

3. Install the required dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Start the FastAPI server:

   ```bash
   uvicorn main:app --reload
   ```

   The backend server will be available at: [http://localhost:8000](http://localhost:8000)

---

## MongoDB Setup

### Installing MongoDB Compass (GUI)
#### MongoDB Compass is a graphical interface for MongoDB that makes it easier to visualize and manage your data. To install it:
1. Go to the MongoDB Compass Download Page.
2. Download the version that matches your operating system.
3. Install MongoDB Compass by following the instructions for your operating system.
4. Open MongoDB Compass and connect to your local instance or Atlas cluster by entering the MongoDB URI.
Once you’ve connected, you can visualize your databases, collections, and documents, and easily interact with MongoDB.
---

## Connecting Frontend to Backend

To connect your frontend to the backend, create a `.env.local` file in your Next.js project with the following content:

```bash
NEXTAUTH_SECRET=af4c80bb5d6d8f1e3b66e5d4f66f5c1b63e6f18e2bfe8cc3a1d1a6d7b2b5e798
NEXTAUTH_URL=http://localhost:3000
```

---

## Running Both Frontend and Backend

1. Start the backend server by running:

   assuming you are in the git root directory
   ```bash
   cd backend/app
   uvicorn main:app --reload
   ```

3. In a separate terminal, navigate to your Next.js project and start the frontend server:

   assuming you are in the git root directory 
   ```bash
   cd frontend
   npm run dev
   ```

Now, both the frontend ([http://localhost:3000](http://localhost:3000)) and the backend ([http://localhost:8000](http://localhost:8000)) should be running.
1. Create a user by heading to [http://localhost:8000/docs](http://localhost:8000/docs)
2. Then locate the add user endpoint
3. Click "Try it out"
4. Enter your crdentials
5. You can then login using the frontend page
---
