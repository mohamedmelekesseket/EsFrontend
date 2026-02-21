import React, { useState, useRef } from 'react'
import { Mail, ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from "react-router-dom"
import axios from 'axios'
import { toast, Toaster } from 'react-hot-toast'
import EsL from '../images/Es4.png'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ResetPasword = () => {
  const [Rest, setReset] = useState('Rest1')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [ConfPassword, setConfPassword] = useState('')
  const [code, setCode] = useState(new Array(6).fill(''))
  // BUG 2 FIX: Removed serverCode state — code is now verified server-side only
  const inputsRef = useRef([])
  const navigate = useNavigate()
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [isVerifyingCode, setIsVerifyingCode] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const handleChange = (value, index) => {
    if (/^[0-9]?$/.test(value)) {
      const newCode = [...code]
      newCode[index] = value
      setCode(newCode)
      if (value && index < 5) {
        inputsRef.current[index + 1].focus()
      }
    }
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1].focus()
    }
  }

  // BUG 1 FIX: Guard moved before any async work so spam-clicks are fully blocked.
  // CheckEmail is now inside try/catch so network errors are handled.
  const ResetEmail = async () => {
    if (isSendingEmail) return
    if (!email) return toast.error('Email Required !!', { id: "reset-email-required" })

    setIsSendingEmail(true)
    try {
      const find = await axios.post(`${API_BASE_URL}/CheckEmail`, { email })
      if (find.status === 204) {
        toast.error('Email Not exist !!', { id: "reset-email-not-exist" })
        return
      }

      const res = await axios.post(`${API_BASE_URL}/ResetEmail`, { email })
      // BUG 2 FIX: We no longer read or store the code from the response.
      // The backend keeps it; we only advance the step.
      if (res.status === 200) {
        setReset('Rest2')
      }
    } catch (error) {
      console.error("Error sending reset email:", error)
      toast.error("❌ Erreur lors de l'envoi du code", { id: "reset-send-code-error" })
    } finally {
      setIsSendingEmail(false)
    }
  }

  // BUG 2 & 3 FIX: handleVerify is now async and sends the code to the backend
  // for server-side verification. isVerifyingCode now wraps real async work so
  // the loading spinner actually renders.
  const handleVerify = async () => {
    if (isVerifyingCode) return
    const enteredCode = code.join('')
    if (enteredCode.length < 6) {
      return toast.error("❌ Veuillez saisir le code complet", { id: "reset-code-incomplete" })
    }

    setIsVerifyingCode(true)
    try {
      const res = await axios.post(`${API_BASE_URL}/VerifyCode`, { email, code: enteredCode })
      if (res.status === 200) {
        toast.success("🔓 Code vérifié avec succès, créez un nouveau mot de passe.", { id: "reset-code-verified" })
        setReset('Rest3')
      } else {
        toast.error("❌ Code incorrect !", { id: "reset-code-incorrect" })
      }
    } catch (error) {
      console.error("Error verifying code:", error)
      toast.error("❌ Code incorrect ou expiré", { id: "reset-code-error" })
    } finally {
      setIsVerifyingCode(false)
    }
  }

  // BUG 5 FIX: Added empty and minimum-length password validation
  const NewPassword = async () => {
    if (isChangingPassword) return
    if (!password) return toast.error('❌ Password is required', { id: "reset-password-required" })
    if (password.length < 8) return toast.error('❌ Password must be at least 8 characters', { id: "reset-password-too-short" })
    if (password !== ConfPassword) return toast.error('❌ Password not matched', { id: "reset-password-mismatch" })

    setIsChangingPassword(true)
    try {
      const res = await axios.post(`${API_BASE_URL}/NewPassword`, { password, email })
      if (res.status === 200) {
        toast.success("✅ Password changed successfully", { id: "reset-password-success" })
        setTimeout(() => navigate("/"), 1000)
      } else if (res.status === 204) {
        toast.error("❌ Email Not Found", { id: "reset-email-not-found" })
      }
    } catch (error) {
      console.error("Error updating password:", error)
      toast.error("❌ Erreur lors du changement du mot de passe", { id: "reset-password-error" })
    } finally {
      setIsChangingPassword(false)
    }
  }

  const displayForm = () => {
    if (Rest === 'Rest1') {
      return (
        <div id='ResetP' className='ResetP'>
          <div className='IconRest'><Mail size={32} /></div>
          <h1>Forgot your password?</h1>
          <p>Enter your email to receive a reset link.</p>
          <h4>Adresse email</h4>
          <input
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            placeholder='votreEmail@example.com'
          />
          <button
            onClick={ResetEmail}
            disabled={isSendingEmail}
            style={{ opacity: isSendingEmail ? 0.7 : 1, cursor: isSendingEmail ? 'not-allowed' : 'pointer' }}
          >
            {isSendingEmail ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                <span style={{
                  width: '16px', height: '16px',
                  border: '2px solid currentColor', borderTop: '2px solid transparent',
                  borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block'
                }}></span>
                Sending...
              </span>
            ) : 'Send the reset code'}
          </button>
          <Link to='/Seconnect' style={{ textDecoration: "none" }}>
            <p id='Retour'><ArrowLeft /> Return to login</p>
          </Link>
        </div>
      )
    }

    if (Rest === 'Rest2') {
      return (
        <div id='ResetP2' className='ResetP'>
          <h1>Vérification en deux étapes</h1>
          <p>
            Un code de vérification a été envoyé à votre email <br />
            <span style={{ color: "#03F7EB" }}>{email}</span>.<br />
            Veuillez saisir ce code, il expirera dans 15 minutes.
          </p>

          <div className="CodeInputs">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputsRef.current[index] = el)}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
              />
            ))}
          </div>

          <div className="BtnGroup">
            {/* BUG 4 FIX: Reset code array when going back so old digits don't persist */}
            <button
              onClick={() => {
                setReset('Rest1')
                setEmail('')
                setCode(new Array(6).fill(''))
              }}
              className="BackBtn"
              disabled={isVerifyingCode}
              style={{ opacity: isVerifyingCode ? 0.7 : 1, cursor: isVerifyingCode ? 'not-allowed' : 'pointer' }}
            >
              Retour
            </button>
            <button
              onClick={handleVerify}
              className="VerifyBtn"
              disabled={isVerifyingCode}
              style={{ opacity: isVerifyingCode ? 0.7 : 1, cursor: isVerifyingCode ? 'not-allowed' : 'pointer' }}
            >
              {isVerifyingCode ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                  <span style={{
                    width: '16px', height: '16px',
                    border: '2px solid currentColor', borderTop: '2px solid transparent',
                    borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block'
                  }}></span>
                  Vérification...
                </span>
              ) : 'Vérifier'}
            </button>
          </div>
        </div>
      )
    }

    if (Rest === 'Rest3') {
      return (
        <div id='ResetP' className='ResetP'>
          <h1>Créer un nouveau mot de passe</h1>
          <input
            style={{ marginTop: "50px" }}
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nouveau mot de passe"
          />
          <input
            style={{ marginTop: "20px" }}
            type="password"
            onChange={(e) => setConfPassword(e.target.value)}
            placeholder="Confirmer le mot de passe"
          />
          <button
            style={{ marginTop: "20px", opacity: isChangingPassword ? 0.7 : 1, cursor: isChangingPassword ? 'not-allowed' : 'pointer' }}
            className="VerifyBtn"
            onClick={NewPassword}
            disabled={isChangingPassword}
          >
            {isChangingPassword ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                <span style={{
                  width: '16px', height: '16px',
                  border: '2px solid currentColor', borderTop: '2px solid transparent',
                  borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block'
                }}></span>
                Saving...
              </span>
            ) : 'Enregistrer'}
          </button>
        </div>
      )
    }
  }

  return (
    <div className='ResetPasword'>
      {/* BUG 6 FIX: <Toaster /> was imported but never rendered — toasts were silent */}
      <Toaster />
      <img src={EsL} width={'70px'} height={'70px'} alt="" />
      {displayForm()}
    </div>
  )
}

export default ResetPasword