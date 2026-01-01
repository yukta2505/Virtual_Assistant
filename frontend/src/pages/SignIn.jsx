import React, { useContext } from "react";
import bg from "../assets/image.png";
import { IoEye } from "react-icons/io5";
import { IoEyeOff } from "react-icons/io5";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { userDataContext } from "../context/userContext";
import axios from "axios";

function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const {serverUrl, userData, setUserData} = useContext(userDataContext)
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const handleSignIn = async (e)=> {
    e.preventDefault()
    setErr("");
    setLoading(true)
    try {
      let result = await axios.post(`${serverUrl}/api/auth/signin`, { email, password}, {withCredentials: true});
      setUserData(result.data)
      setLoading(false)
      navigate("/")
    } catch (error) {
      setUserData(null)
      setLoading(false)
      setErr(error.response.data.message)
    }
  }
  return (
    <div
      className="w-full h-[100vh] bg-cover  flex justify-center "
      style={{ backgroundImage: `url(${bg})` }}
    >
      <form
        action=""
        className="w-[90%] h-[600px] max-w-[500px] bg-[#00000062] backdrop-blur shadow-lg shadow-black flex flex-col items-center justify-center gap-[20px] px-[20px]"
        onSubmit={handleSignIn}
      >
        <h1 className="text-white text-[30px] font-semibold mb-[30px]">
          Sign In to <span className="text-red-400">Virtual Assistant</span>
        </h1>
        
        <input
          type="email"
          placeholder="Enter your Email"
          className="w-full h-[60px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-[20px] py-[10px] rounded-full text-[18px]"
          onChange={(e)=>setEmail(e.target.value)}
          value={email}
          required
        />
        
        <div className="w-full h-[60px] border-2 border-white bg-transparent text-white rounded-full text-[18px] relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="password"
            className="w-full h-full rounded-full outline-none bg-transparent placeholder-gray-300 px-[20px] py-[10px]"
            onChange={(e)=>setPassword(e.target.value)}
          value={password}
          />

          {!showPassword && (
            <IoEye
              className="absolute top-[18px] right-[20px] text-white w-[25px] h-[25px]"
              onClick={() => setShowPassword(true)}
            />
          )}
          {showPassword && (
            <IoEyeOff
              className="absolute top-[18px] right-[20px] text-white w-[25px] h-[25px] cursor-pointer"
              onClick={() => setShowPassword(false)}
            />
          )}
        </div>
        {err.length > 0 && <p className="text-red-500"> 
          *{err}
          </p>}
        <button className="min-w-[150px] h-[60px] mt-[30px] text-black font-semibold  bg-white rounded-full text-[19px]" disabled={loading}>
          {loading ? "Loading...": "Sign In"}
        </button>
        <p className="text-white text-[18px] cursor-pointer" onClick={()=>navigate("/signup")}>
          Want to create a new account ?{" "}
          <span className="text-red-400">Sign Up</span>
        </p>
      </form>
      
    </div>
  );
}

export default SignIn;
 