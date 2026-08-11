import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import "../Auth/Auth.css";

export default function Login() {
  const navigate=useNavigate(),[email,setEmail]=useState(""),[password,setPassword]=useState(""),[error,setError]=useState(""),[loading,setLoading]=useState(false);
  const submit=async(e)=>{e.preventDefault();setLoading(true);setError("");try{const data=await authService.login({email,password});if(data.user.role!=="passenger"){authService.logout();throw new Error("Please use your dedicated operator or admin login.");}navigate("/dashboard");}catch(err){setError(err.response?.data?.message||err.message||"Unable to log in.");}finally{setLoading(false);}};
  return <main className="passenger-auth"><section className="passenger-auth-visual"><strong>Bus Mitra</strong><h1>Track every journey with confidence.</h1><p>Find routes, get live bus locations, and stay informed in one place.</p></section><section className="passenger-auth-card"><h2>Welcome back</h2><p>Log in to your passenger account.</p><form onSubmit={submit}><label>Email<input required type="email" value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Password<input required type="password" value={password} onChange={e=>setPassword(e.target.value)}/></label>{error&&<div className="auth-error">{error}</div>}<button disabled={loading}>{loading?"Logging in...":"Log in"}</button></form><p>New to Bus Mitra? <Link to="/register">Create account</Link></p></section></main>;
}
