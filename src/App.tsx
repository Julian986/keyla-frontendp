import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from 'react'
import './App.css'
import { Home } from "./pages/home/Home";
import UserProfile from "./pages/user/UserProfile";
import Login from "./pages/login/Login";
import SignInForm from "./pages/signup/Signup";
import { Tables } from "./pages/tables/Tables";
import Accordion from "./pages/faq/Faq";
import ProductForm from "./pages/productForm/ProductForm";
import PaymentForm from "./pages/paymentForm/PaymentForm";
import CreditCardForm from "./pages/cardForm/CardForm";
import BackButton from "./components/BackButton";
import UserForm from "./pages/userForm/UserForm";
import ProdContainer from "./components/prodContainer/ProdContainer";
import { SearchProvider } from "./context/SearchContext";
import VisitProfile from "./components/visitProfile/VisitProfile";

/* import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; */


/* import { ChatProvider } from "./context/ChatContext"; */
import ChatPage from "./pages/chat/Chat";
import ChatList from "./pages/chatList/ChatList";
import { ProductDetailWrapper } from "./pages/productDetail/ProductDetailWrapper";
import PricingPlans from "./pages/pircingPlans/PircingPlans";
import ContactUs from "./pages/contactUs/ContactUs";
import EditProductForm from "./pages/editProductForm/EditProductForm";
import ContactSeller from "./pages/contactSeller/ContactSeller";
import NotFound from "./pages/notFound/NotFound";

function App() {

  return (
    <>
    {/* <ChatProvider> */}
        <SearchProvider> 
          <BrowserRouter>


          <BackButton />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/Home" element={<Home />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignInForm />} />
              <Route path="/tables" element={<Tables />} />
              <Route path="/support" element={<Accordion />} />
              <Route path="/ProductForm" element={<ProductForm />} />
              <Route path="/PaymentForm" element={<PaymentForm />} />
              <Route path="/cardForm" element={<CreditCardForm />} />
              <Route path="/userForm" element={<UserForm />} />
              <Route path="/profile/:userId" element={<VisitProfile />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/chat/:chatId" element={<ChatPage />} />
              <Route path="/contact-seller" element={<ContactSeller />} />
              <Route path="/Chats" element={<ChatList />} />
              <Route path="/product/:productId" element={<ProductDetailWrapper />} />
              <Route path="/Plans" element={<PricingPlans />} />
              <Route path="/Contact us" element={<ContactUs />} />
              <Route path="/edit-product/:productId" element={<EditProductForm />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
            
            
          </BrowserRouter>
        </SearchProvider>
      {/* </ChatProvider> */}
    </>
  )
}

export default App;
