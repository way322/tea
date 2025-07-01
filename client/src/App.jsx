import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Root from './routes/Root/Root.jsx'; 
import ErrorPage404 from './routes/ErrorPage404/ErrorPage404.jsx';
import HomePage from "./routes/Home/Home.jsx";
import Cart from "./routes/Cart/Cart.jsx";
import Profile from "./routes/Profile/Profile.jsx";
import Register from "./routes/Register/Register.jsx";
import Login from "./routes/Login/Login.jsx";


const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <ErrorPage404 />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'cart', 
        element: <Cart />,
      },
      {
        path: 'profile',
        element: <Profile />,
      },
      {
        path: 'register',
        element: <Register />,
      },
      {
        path: 'login',
        element: <Login />,
      },
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;