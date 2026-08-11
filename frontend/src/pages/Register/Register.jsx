import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import "../Auth/Auth.css";

export default function Register() {
  const navigate=useNavigate(),[form,setForm]=useState({name:"",email:"",phone:"",password:""}),[error,setError]=useState(""),[loading,setLoading]=useState(false);
  const submit=async(e)=>{e.preventDefault();setLoading(true);setError("");try{await authService.signup(form);navigate("/dashboard");}catch(err){setError(err.response?.data?.message||"Unable to create your account.");}finally{setLoading(false);}};
  return <main className="passenger-auth"><section className="passenger-auth-visual"><strong>Bus Mitra</strong><h1>Travel smarter from your first search.</h1><p>Create a free passenger account to save routes and receive live updates.</p></section><section className="passenger-auth-card"><h2>Create account</h2><p>Join Bus Mitra as a passenger.</p><form onSubmit={submit}>{[["name","Full name","text"],["email","Email","email"],["phone","Phone number","tel"],["password","Password","password"]].map(([key,label,type])=><label key={key}>{label}<input required minLength={key==="password"?6:undefined} type={type} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}/></label>)}{error&&<div className="auth-error">{error}</div>}<button disabled={loading}>{loading?"Creating account...":"Create account"}</button></form><p>Already have an account? <Link to="/login">Log in</Link></p></section></main>;
}
