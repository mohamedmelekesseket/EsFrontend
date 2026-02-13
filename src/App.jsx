import { useState } from 'react'
import {BrowserRouter as Router,Routes,Route, Navigate} from 'react-router-dom'
import './App.css'
import HeaderBar from './components/HeaderBar'
import HomeComp from './components/HomeComp'
import SeConnect from './components/SeConnect'
import ManagementDashboard from './components/ManagementDashboard'
import DashBord from './components/DashBord'
import UserBord from './components/UserBord'
import CategroiesBord from './components/CategroiesBord'
import AddProduct from './components/AddProduct'
import AllProducts from './components/AllProducts'
import ProductsU from './components/ProductsU'
import PorductSelecte from './components/PorductSelecte'
import ProfileComp from './components/ProfileComp';
import CommandeComp from './components/CommandeComp';
import ConfirmSubscribePage from './components/ConfirmSubscribePage'
import ResetPasword from './components/ResetPassword'
import AboutComp from './components/AboutComp'
import ChangeComp from './components/ChangeComp'
import FinalePage from './components/FinalePage'
import { Toaster } from 'react-hot-toast';
import OrderBord from './components/OrderBord'
import BugsReports from './components/BugsReports'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import ComingSoon from './components/ComingSoon'

function App() {
  const [showBag, setShowBag] = useState(false); // LIFTED STATE
  const { user } = useAuth();

  return (
    <Router>
      <HeaderBar
        setShowBag={setShowBag}
        showBag={showBag}
      />
      {/* ✅ Put your SearchMobileComp here */}
      
      <Routes>
        <Route path='/changedsdsdaad' element={<ChangeComp />}/>
        <Route path='/' element={<HomeComp/>}/>
        <Route path='/PorductSelecte/:id' element={<PorductSelecte setShowBag={setShowBag} />}/>
        <Route path='/Seconnect' element={<SeConnect/>}/>
        <Route path='/AboutEs' element={<AboutComp/>}/>
        <Route path='/ResetPassword' element={<ResetPasword/>}/>
        <Route path='/ProductU/:subcategoryName' element={<ProductsU/>}/>
        <Route path='/Commande' element={<CommandeComp/>}/>
        <Route path='/Coming' element={<ComingSoon/>}/>
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <ProfileComp />
            </ProtectedRoute>
          } 
        />
        <Route path='/order-confirmation' element={<FinalePage/>}/>
        <Route path="/confirm-subscribe/:token" element={<ConfirmSubscribePage/>}/>
        <Route 
          path='/ManagementDashboard/*' 
          element={
            <ManagementDashboard />
            // </ProtectedRoute>
            // <ProtectedRoute adminOnly>
          }
        >
          <Route index element={<Navigate to="DashBord" replace />} />
          <Route path='BugsReports' element={<BugsReports/>}/>
          <Route path='DashBord' element={<DashBord/>}/>
          <Route path='CategroiesBord' element={<CategroiesBord/>}/>
          <Route path='Order' element={<OrderBord/>}/>
          <Route path='user' element={<UserBord/>}/>
          <Route path='AddNewProduct' element={<AddProduct/>}/>
          <Route path='AllProducts' element={<AllProducts/>}/>
        </Route>
      </Routes>
      <Toaster
        position="bottom-right"
        toastOptions={{
          error: {
            style: {
              background: '#c0392b', // red
              color: '#fff',
              borderRadius: '0px', // ❌ no rounded corners
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#c0392b',
            },
          },
          success: {
            style: {
              background: '#000000',
              color: '#fff',
              borderRadius: '0px', // ❌ no rounded corners
            },
          },
        }}
      />
    </Router>
  )
}

export default App
