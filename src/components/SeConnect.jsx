import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { CircleX, Mail, House, Shirt, Lock, Phone, Eye,EyeOff  } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast'
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import mobile1 from '../images/vetment/pontalon-6-0.png'
import mobile2 from '../images/vetment/pontalon-5-1.png'
import mobile3 from '../images/product-32-0.png'
import mobile4 from '../images/Chaussures/baskets-14-1.png'
import { motion, AnimatePresence } from 'framer-motion';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Login = () => {
    const [from, setForm] = useState(false)
    const [email, setEmail] = useState('')
    const [emailerror, setEmailError] = useState('')
    const [password, setPassword] = useState('')
    const [showpassword, setShowPassword] = useState(false)
    const [phoneNumber, setphoneNumber] = useState('')
    const [phoneError, setphoneNumberError] = useState('')
    const [passwordError, setPasswordError] = useState('')
    const navigate = useNavigate()
    const [isSubmitted, setIsSubmitted] = useState(false); // Track attempt to submit
    const [isLoading, setIsLoading] = useState(false); // Loading state for API calls
    const { setUser } = useAuth();

    // Helper to determine border color
    const getBorderStyle = (value, error) => ({
        paddingLeft: "35px",
        height: "40px",
        width: "60%",
        border: (isSubmitted && !value) || error ? "1.5px solid #ff4d4f" : "1px solid #d9d9d9",
        borderRadius: "6px",
        outline: "none",
        transition: "border 0.3s ease"
    });

    function isNumber(phoneNumber) {
        var pattern = /^\d+\.?\d*$/;
        return pattern.test(phoneNumber);
    }

    const SignUp = async () => {
    if (isLoading) return;

    if (!email || !phoneNumber || !password) {
        return toast.error("All fields are required");
    }

    setIsLoading(true);

    try {
        const res = await API.post("/SignUp", {
        email,
        phoneNumber,
        password
        });

        toast.success("Account created!");

        setUser(res.data); // backend returns { id, email, role }

        navigate("/", { replace: true });

    } catch (error) {
        toast.error(error.response?.data?.message || "SignUp failed");
    } finally {
        setIsLoading(false);
    }
    };


    const SignIn = async () => {
    if (isLoading) return;

    if (!email || !password) {
        return toast.error("Please fill in all required fields.");
    }

    setIsLoading(true);

    try {
        const res = await API.post("/SignIn", { email, password });

        toast.success("Welcome back!");

        // Set global user
        setUser(res.data.user);

        navigate("/", { replace: true });

    } catch (error) {
        toast.error(error.response?.data?.message || "Login failed");
    } finally {
        setIsLoading(false);
    }
    };
    const DisplayForm = () => {
        const isSignUp = !from;

        // Variants for reusable animation logic
        const fieldVariants = {
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -10 }
        };

        return (
            <motion.div 
                layout // This animates the container size change smoothly
                className={isSignUp ? 'DivDisplay auto-height' : 'DivDisplay'}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
            >
                
                
                <motion.h1 layout style={{ marginTop: "4%" }}>
                    {isSignUp ? "Welcome" : "Welcome Back"}
                </motion.h1>
                
                <motion.h4 layout>
                    {isSignUp ? "Create your Account" : "Sign in to continue"}
                </motion.h4>

                {/* Email Field */}
                <motion.div layout>
                    <p>E-mail</p>
                    <div style={{ position: "relative", width: "100%" }}>
                        <Mail id='MobileIC' size={19} className="input-icon" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="example@gmail.com"
                            style={getBorderStyle(email, emailerror)}
                        />
                    </div>
                    {emailerror && <p className="error-text">{emailerror}</p>}
                </motion.div>

                {/* Phone Field (Animated Transition) */}
                <AnimatePresence mode="popLayout">
                    {isSignUp && (
                        <motion.div
                            key="phone-field"
                            variants={fieldVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            transition={{ duration: 0.2 }}
                        >
                            <p>Phone Number</p>
                            <div style={{ position: "relative", width: "100%" }}>
                                <Phone id='MobileIC' size={19} className="input-icon" />
                                <input
                                    type="text"
                                    value={phoneNumber}
                                    onChange={(e) => setphoneNumber(e.target.value)}
                                    placeholder="+216"
                                    style={getBorderStyle(phoneNumber, phoneError)}
                                />
                            </div>
                            {phoneError && <p className="error-text">{phoneError}</p>}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Password Field */}
                <motion.div layout>
                    <p>Password</p>
                    <div style={{ position: "relative", width: "100%" }}>
                        <Lock id='MobileIC' size={19} className="input-icon" />
                        <input
                            type={showpassword ? "text" : "password"}
                            value={password}
                            placeholder="*********"
                            onChange={(e) => setPassword(e.target.value)}
                            style={getBorderStyle(password, passwordError)}
                        />
                        {showpassword
                        ?
                        <EyeOff  id='MobileIC1' 
                        onClick={() => setShowPassword(!showpassword)} 
                        size={19} 
                        className="eye-icon" />
                        :
                        <Eye 
                        id='MobileIC1' 
                        onClick={() => setShowPassword(!showpassword)} 
                        size={19} 
                        className="eye-icon" 
                        />
                        }
                    </div>
                    {passwordError && <p className="error-text">{passwordError}</p>}
                </motion.div>

                {/* Submit Button Area */}
                <motion.div layout className="button-section">
                    {!isSignUp && (
                        <Link to='/ResetPassword' style={{ textDecoration: "none", color: "black" }}>
                            <h4 id='Resetph4'>Forgot password?</h4>
                        </Link>
                    )}
                    
                    <motion.button 
                        whileHover={{ scale: isLoading ? 1 : 1.02 }}
                        whileTap={{ scale: isLoading ? 1 : 0.98 }}
                        className='seconnectBt' 
                        onClick={isSignUp ? SignUp : SignIn}
                        disabled={isLoading}
                        style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
                    >
                        {isLoading ? (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <span style={{ 
                                    width: '16px', 
                                    height: '16px', 
                                    border: '2px solid #ffffff', 
                                    borderTop: '2px solid transparent',
                                    borderRadius: '50%',
                                    animation: 'spin 0.8s linear infinite',
                                    display: 'inline-block'
                                }}></span>
                                {isSignUp ? "Signing Up..." : "Signing In..."}
                            </span>
                        ) : (
                            isSignUp ? "Sign Up" : "Sign In"
                        )}
                    </motion.button>

                    <h5 className="toggle-text">
                        {from ? "You don't have Account? " : "Already have Account? "}
                        <span className="toggle-link" onClick={() => {
                            setForm(!from);
                            setIsSubmitted(false);
                            setEmail('');
                            setPassword('');
                            setphoneNumber('');
                        }} style={{color:"black", cursor:"pointer"}}>
                            {from ? 'Sign Up' : 'Sign In'}
                        </span>
                    </h5>
                </motion.div>
            </motion.div>
        );
    };

    return (
        <div className='SeConnect'>
            <div className="SeConnect-1">
                <div className="pc-page">
                    <div className="pc-wrap">
                        <div className="pc-card">
                            <p className="pc-prompt">
                                We are passionate about creating high-quality, stylish clothing that empowers individuals to express their unique personality
                            </p>

                            <div className="pc-controls">
                                <div className="pc-left">
                                    <button className="pc-btn pc-btn-icon pc-plus" aria-label="add">+</button>

                                    <div className="pc-tag">
                                        <span className="pc-tag-icon">⚡</span>
                                        <span className="pc-tag-text">Inspiration</span>
                                        <span className="pc-tag-caret">▾</span>
                                    </div>
                                </div>

                                <div className="pc-center">
                                    <div className="pc-variant">Es 1.0</div>
                                </div>

                                <div className="pc-right">
                                    <button className="pc-btn pc-btn-icon pc-mic" aria-label="mic"><Shirt /></button>
                                    <button className="pc-send" aria-label="send">Es</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="SeConnect-2">
                <House onClick={() => navigate("/")} size={23} strokeWidth={3} style={{ position: "absolute", cursor: 'pointer', top: "10px", right: "10px" }} />
                <div key={from ? "sign-in" : "sign-up"} className="fade-in">
                    {DisplayForm()}
                </div>
            </div>
            <div className='MobileConnect'>
            {DisplayForm()}
            <div className='ImagesConnect'>
            <motion.img
                src={mobile1}
                className='ImagesConnect1'
                alt=''
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
            />
            <motion.img
                src={mobile4}
                className='ImagesConnect2'
                alt=''
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
            />
            <motion.img
                src={mobile2}
                className='ImagesConnect2'
                alt=''
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
            />
            <motion.img
                src={mobile3}
                className='ImagesConnect3'
                alt=''
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
            />
            </div>
            </div>
        </div>
    )
}

export default Login
