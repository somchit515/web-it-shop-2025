import "./App.css";

import { BrowserRouter as Router, Routes } from "react-router-dom";
import Footer from "./components/layout/Footer";
import Header from "./components/layout/Header";
import { Toaster } from "react-hot-toast";
// Assuming you changed the import to fix the error:
import useUserRoutes from "./components/routes/UserRoutes";
import useAdminRoutes from "./components/routes/AdminRoutes";
function App() {

  const userRoutes = useUserRoutes();
  const adminRoutes = useAdminRoutes();

  return (
    <Router>
      <div className="App">
        <Toaster position="top-center" />
        <Header />

        <div className="container">
          <Routes>
            {/* The array of <Route> components is rendered here */}
            {userRoutes},
            {adminRoutes}
          </Routes>
        </div>

        <Footer />
      </div>
    </Router>
  );
}

export default App;