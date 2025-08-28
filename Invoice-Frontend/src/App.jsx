// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Clients from "./pages/Clients";
import Invoices from "./pages/Invoices";
import Payments from "./pages/Payments";
import Profile from "./pages/Profile";
import PrivateRoute from "./components/PrivateRoute";
// import Pdfview from "./pages/Pdfview";
import "./index.css"; 


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/invoices" element={<Invoices />} />
        
        
        

        <Route
          path="/clients"
          element={<PrivateRoute><Clients /></PrivateRoute>}
        />
        
        <Route
          path="/invoices"
          element={<PrivateRoute><Invoices /></PrivateRoute>}
        />
        <Route
       
          path="/payments"
          element={<PrivateRoute><Payments /></PrivateRoute>}
        />
        <Route
          path="/profile"
          element={<PrivateRoute><Profile /></PrivateRoute>}
        />
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;






