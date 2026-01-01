import React, { useContext, useRef, useState } from 'react'
import {userDataContext} from '../context/userContext'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import axios from 'axios'
import aiImg from '../assets/ai.gif'
import userImg from "../assets/user.gif"
import { HiOutlineMenuAlt1 } from "react-icons/hi";
import { RxCross1 } from "react-icons/rx";

const Home = () => {
  const {userData, serverUrl, setUserData, getGeminiResponse} = useContext(userDataContext)
  const navigate = useNavigate()
  const [listening, setListening] = useState(false)
  const [userText, setUserText] = useState("")
  const [aiText, setAiText] = useState("")
  const isSpeakingRef = useRef(false)
  const recognitionRef = useRef(null)
  const [ham, setHam] = useState(false)
  const isRecognizingRef = useRef(false)
  const synth = window.speechSynthesis

  const handleLogOut = async ()=>{
    try {
      const result = await axios.get(`${serverUrl}/api/auth/logout`,
        {withCredentials: true}
      )
      setUserData(null)
      navigate("/signin")
    } catch (error) {
      console.log(error)
      setUserData(null)
    }
  }

  const startRecognition = () => {
    if(!isSpeakingRef.current && !isRecognizingRef.current){

      try {
        recognitionRef.current?.start();
        //setListening(true);
        console.log("Recognition requested to start")
      } catch (error) {
        if (error.name !== "InvalidStateError"){
          console.error("Start error: ", error);
        }
    }
      
    }
  }


  const speak = (text) =>{
    const utterence = new SpeechSynthesisUtterance(text)
    utterence.lang = 'hi-IN'
    const voices = window.speechSynthesis.getVoices()
    const hindiVoice  = voices.find(v => v.lang === 'hi-IN');
    if(hindiVoice) {
      utterence.voice = hindiVoice
    }

    isSpeakingRef.current=true
    utterence.onend = ()=>{
      setAiText("")
      isSpeakingRef.current = false;
      setTimeout(()=>{
        startRecognition();
      }, 800);     
    }
    synth.cancel();
    synth.speak(utterence)
  }

  const handleCommand = (data) =>{
    const {type, userInput, response} = data
    speak(response)

    if(type === "google-search") {
      const query = encodeURIComponent(userInput);
      window.open(`http://www.google.com/search?q=${query}`, '_blank')
    }

    if(type === "calculator-open") {
      window.open(`http://www.google.com/search?q=calculator`, '_blank')
    }

    if(type === "instagram-open") {
      window.open(`http://www.instagram.com/`, '_blank')
    }

    if(type === 'facebook-open') {
      window.open(`http://www.facebook.com/`, '_blank')
    }

     if(type === 'weather-show') {
      window.open(`http://www.google.com/search?q=weather`, '_blank')
    }

    if(type === 'youtube-search' || type === 'youtube-play') {
      const query = encodeURIComponent(userInput);
      window.open(`http://www.youtube.com/results?search_query=${query}`, '_blank')
    }
    
    
  }


  useEffect(()=>{
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition


    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.lang = 'en-US'
    recognition.interimResults = false;

    recognitionRef.current = recognition

    let isMounted = true;

    const startTimeout = setTimeout(()=> {
      if(isMounted && !isSpeakingRef.current && !isRecognizingRef.current) {
         try {
          recognition.start()
          console.log("Recognition requested to start")
        } catch (e) {
          if (e.name !== "InvalidStateError"){
            console.error(e);
          }
        }
      }
    }, 1000)
    


    recognition.onstart = ()=>{
      // console.log("Recognition started");
      isRecognizingRef.current = true;
      setListening(true)
    }

    recognition.onend = () => {
      // console.log("Recognition ended");
      isRecognizingRef.current = false;
      setListening(false);
      if(isMounted && !isSpeakingRef.current) {
        setTimeout(()=> {
          if (isMounted) {
            try {
              recognition.start();
              console.log("Recognition restarted")
            } catch (e) {
              if(e.name !== "InvalidStateError") {
                console.error(e);
              }
            }
          }
        }, 1000)
      }
    };

    recognition.onerror = (event) => {
      console.warn("Recognition error: ", event.error);
      isRecognizingRef.current = false;
      setListening(false);
      if(event.error !== "aborted" && isMounted && !isSpeakingRef.current) {
        setTimeout(() => {
          if (isMounted) {
            try {
              recognition.start();
              console.log("Recognition restarted after error")
            } catch (e) {
              if (e.name !== "InvalidStateError") console.error(e)
            }
          }
        }, 1000)
      }
    };

    recognition.onresult=async (e)=>{
      const transcript = e.results[e.results.length - 1][0].transcript.trim()
      console.log("heard : " + transcript)

      if(transcript.toLowerCase().includes(userData.assistantName.toLowerCase())){
        setAiText("")
        setUserText(transcript)
        recognition.stop()
        isRecognizingRef.current = false
        setListening(false)
       const data = await getGeminiResponse(transcript)
      
       handleCommand(data)
       setAiText(data.response)
       setUserText("")


      }
    }

  
      const greeting = new SpeechSynthesisUtterance(`Hello ${userData.name}, what can I help you with?`);
      greeting.lang = 'hi-IN';
      window.speechSynthesis.speak(greeting)
   

    return ()=>{
      isMounted = false;
      clearTimeout(startTimeout)
      recognition.stop()
      setListening(false);
      isRecognizingRef.current = false
      
    }

    
  },[])
  
  return (
    <div className='w-full h-[100vh] bg-gradient-to-t from-[black] to-[#050536] flex justify-center items-center flex-col gap-[15px] overflow-hidden'>
      <HiOutlineMenuAlt1 className='lg:hidden text-white absolute top-[20px] right-[20px] w-[25px] h-[25px]' onClick={()=> setHam(true)}/>
      <div className={`absolute lg:hidden top-0 w-full h-full bg-[#0000002e] backdrop-blur-lg p-[20px] flex flex-col gap-[20px] items-start ${ham?"translate-x-0":"translate-x-full"} transition-transform`}>
        <RxCross1 className=' text-white absolute top-[20px] right-[20px] w-[25px] h-[25px]' onClick={()=>setHam(false)} />

           <button className="min-w-[150px] h-[60px] text-black cursor-pointer font-semibold  bg-white rounded-full text-[19px]" onClick={handleLogOut}>
        Log Out
        </button>

        <button className="min-w-[150px] h-[60px]  text-black font-semibold  bg-white cursor-pointer rounded-full text-[19px] px-[20px] py-[10px] " onClick={()=> navigate("/customize")}>
          Customize your Assistant
        </button>


<div className='w-full h-[2px] bg-gray-400'>
</div>
<h1 className='text-white font-semibold text-[19px]'>History</h1>

<div className='w-full h-[400px] gap-[20px] overflow-y-auto flex flex-col '>
  {userData.history?.map((his, i)=>(
    <span key={i} className='text-gray-200 text-[18px] truncate '>{his}</span>
  ))}
</div>
        

      </div>
      <button className="min-w-[150px] h-[60px] mt-[30px] text-black cursor-pointer font-semibold absolute hidden lg:block top-[20px] right-[20px] bg-white rounded-full text-[19px]" onClick={handleLogOut}>
        Log Out
        </button>

        <button className="min-w-[150px] h-[60px] mt-[30px] text-black font-semibold absolute top-[100px] right-[20px] bg-white cursor-pointer rounded-full text-[19px] px-[20px] py-[10px] hidden lg:block" onClick={()=> navigate("/customize")}>
          Customize your Assistant
        </button>

      <div className='w-[300px] h-[400px] flex justify-center overflow-hidden rounded-4xl shadow-lg'>
        <img src={userData?.assistantImage} alt=""  className='h-full object-cover'/>
      </div>
      <h1 className='text-white text-[18px] font-semibold'>I'm {userData.assistantName}</h1>
      {!aiText && <img src={userImg} alt="" className='w-[200px]'/> }
      {aiText && <img src={aiImg} alt="" className='w-[200px]'/> }

      <h1 className='text-white text-[18px] font-semibold text-wrap'>{userText?userText:aiText?aiText:null}</h1>
        
    </div>
  )
}

export default Home