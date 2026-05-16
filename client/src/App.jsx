import {
  Route,
  BrowserRouter as Router,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import Login from "./components/Login";
import Registration from "./components/Registration";
import Admin from "./components/Admin";
import UserProfile from "./components/UserProfile";
import ForgetPassword from "./components/ForgetPassword";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./components/Home";
import About from "./components/About";
import ItemsListPage from "./components/ItemsListPage";
import AddItem from "./components/AddItem";
import { Provider, useSelector } from "react-redux";
import { store } from "./store";

function isAuthed(user) {
  return Boolean(user && (user._id || user.email));
}

function ProtectedRoute({ children }) {
  const user = useSelector((s) => s.user.user);
  if (!isAuthed(user)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function AppShell() {
  const user = useSelector((s) => s.user.user);
  const location = useLocation();
  const showChrome = isAuthed(user);
  const showFooter = showChrome && location.pathname !== "/home";

  return (
    <div className="app-layout">
      {showChrome && <Header />}
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/forgetPassword" element={<ForgetPassword />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/about"
            element={
              <ProtectedRoute>
                <About />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lost"
            element={
              <ProtectedRoute>
                <ItemsListPage listingType="lost" title="Lost Items Screen" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/found"
            element={
              <ProtectedRoute>
                <ItemsListPage listingType="found" title="Found Items Screen" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-item"
            element={
              <ProtectedRoute>
                <AddItem />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {showFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppShell />
      </Router>
    </Provider>
  );
}

export default App;
