import React, { useState, useRef } from 'react'
import { Mail, ArrowLeft, Eye, EyeOff } from 'lucide-react'
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
  const [showPass, setShowPass] = useState(false)
  const [showConf, setShowConf] = useState(false)
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

  // Paste support: paste 6-digit code and it auto-fills all boxes
  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newCode = new Array(6).fill('')
    pasted.split('').forEach((ch, i) => (newCode[i] = ch))
    setCode(newCode)
    const nextEmpty = newCode.findIndex(c => !c)
    inputsRef.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus()
  }

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
      if (res.status === 200) {
        setReset('Rest2')
      }
    } catch (error) {
      console.error("Error sending reset email:", error)
      const msg = error.response?.data?.message || "Erreur lors de l'envoi du code"
      toast.error(msg, { id: "reset-send-code-error" })
    } finally {
      setIsSendingEmail(false)
    }
  }

  const handleVerify = async () => {
    if (isVerifyingCode) return
    const enteredCode = code.join('')
    if (enteredCode.length < 6) {
      return toast.error(" Veuillez saisir le code complet", { id: "reset-code-incomplete" })
    }

    setIsVerifyingCode(true)
    try {
      const res = await axios.post(`${API_BASE_URL}/VerifyCode`, { email, code: enteredCode })
      if (res.status === 200) {
        toast.success("🔓 Code vérifié avec succès, créez un nouveau mot de passe.", { id: "reset-code-verified" })
        setReset('Rest3')
      } else {
        toast.error(" Code incorrect !", { id: "reset-code-incorrect" })
      }
    } catch (error) {
      console.error("Error verifying code:", error)
      toast.error(" Code incorrect ou expiré", { id: "reset-code-error" })
    } finally {
      setIsVerifyingCode(false)
    }
  }

  const NewPassword = async () => {
    if (isChangingPassword) return
    if (!password) return toast.error(' Password is required', { id: "reset-password-required" })
    if (password.length < 8) return toast.error(' Password must be at least 8 characters', { id: "reset-password-too-short" })
    if (password !== ConfPassword) return toast.error(' Password not matched', { id: "reset-password-mismatch" })

    setIsChangingPassword(true)
    try {
      const res = await axios.post(`${API_BASE_URL}/NewPassword`, { password, email })
      if (res.status === 200) {
        toast.success("✅ Password changed successfully", { id: "reset-password-success" })
        setTimeout(() => navigate("/"), 1000)
      } else if (res.status === 204) {
        toast.error(" Email Not Found", { id: "reset-email-not-found" })
      }
    } catch (error) {
      console.error("Error updating password:", error)
      toast.error(" Erreur lors du changement du mot de passe", { id: "reset-password-error" })
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && ResetEmail()}
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
            Un code de vérification a été envoyé à votre email <br /><br />
            <span style={{ color: "#03F7EB" }}>{email}</span>.<br /><br />
            Veuillez saisir ce code, il expirera dans 15 minutes.
          </p>

          <div className="CodeInputs">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputsRef.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
              />
            ))}
          </div>

          <div className="BtnGroup">
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
          <div style={{ position: 'relative', marginTop: '50px' }}>
            <input
              type={showPass ? 'text' : 'password'}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nouveau mot de passe"
              style={{ paddingRight: '42px' }}
            />
            <button
              onClick={() => setShowPass(p => !p)}
              style={{
                position: 'absolute', right: '12px', top: '50%',
                transform: 'translateY(-50%)', background: 'none',
                border: 'none', color: '#6b7280', cursor: 'pointer',
                padding: 0, display: 'flex', alignItems: 'center',
                width: 'auto', height: 'auto'
              }}
              tabIndex={-1}
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div style={{ position: 'relative', marginTop: '20px' }}>
            <input
              type={showConf ? 'text' : 'password'}
              onChange={(e) => setConfPassword(e.target.value)}
              placeholder="Confirmer le mot de passe"
              style={{ paddingRight: '42px' }}
            />
            <button
              onClick={() => setShowConf(p => !p)}
              style={{
                position: 'absolute', right: '12px', top: '50%',
                transform: 'translateY(-50%)', background: 'none',
                border: 'none', color: '#6b7280', cursor: 'pointer',
                padding: 0, display: 'flex', alignItems: 'center',
                width: 'auto', height: 'auto'
              }}
              tabIndex={-1}
            >
              {showConf ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
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
      <img src={EsL} width={'70px'} height={'70px'} alt="" />
      {displayForm()}
    </div>
  )
}

export default ResetPasword