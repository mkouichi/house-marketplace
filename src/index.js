import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import './index.css';
import App from './App';
import Explore from './pages/Explore';
import Offers from './pages/Offers';
import Profile, { loader as profileLoader } from './pages/Profile';
import Category from './pages/Category';
import Listing from './pages/Listing';
import Contact from './pages/Contact';
import CreateListing from './pages/CreateListing';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import reportWebVitals from './reportWebVitals';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Explore /> },
      { path: 'offers', element: <Offers /> },
      { path: 'profile', element: <Profile />, loader: profileLoader },
      { path: 'category/:categoryName', element: <Category /> },
      { path: 'category/:categoryName/:listingId', element: <Listing /> },
      { path: 'contact/:landlordId', element: <Contact /> },
      { path: 'create-listing', element: <CreateListing /> },
      { path: 'sign-in', element: <SignIn /> },
      { path: 'sign-up', element: <SignUp /> },
      { path: 'forgot-password', element: <ForgotPassword /> },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
