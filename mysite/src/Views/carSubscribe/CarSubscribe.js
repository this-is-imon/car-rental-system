import './CarSubscribe.css'
import { useEffect, useState, useLayoutEffect } from 'react';
import {useNavigate, useLocation} from 'react-router-dom'
import Axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';


function CarSubscribe(){

    const navigate = useNavigate()
    const location = useLocation()

    const [carImage, setCarImage] = useState("")

    const [sessionUser, setSessionUser] = useState("")
    const [authorized, setAuthorized] = useState(false)
    const [car, setCar] = useState("")

    const [booking, setBooking] = useState("")
    const [showCalender, setShowCalender] = useState("none")

    const[startTime, setStartTime] = useState("")
    const[endTime, setEndTime] = useState("")

    const [makeBookingColor, setMakeBookingColor] = useState("inherit")
    const [isBookedView, setIsBookedView] = useState({"display":"none", "value": ""})

    const [comments, setComments] = useState([])
    const [commentInput, setCommentInput] = useState("")



    useLayoutEffect(()=>{ 

        //getting authorization
        
        
        if(sessionStorage.getItem("UserID") != null){
            // location.state != null
            // console.log(location.state)
            // if(location.state["authorized"] == true){
            //     setCar(location.state.car)
            //     setSessionUser(location.state.sessionUser)
            //     setAuthorized(true)
                
            //     console.log("car subscribe")
            //     console.log(sessionUser)
            //     console.log(authorized)
            //     console.log(car)
            //     console.log("car subscribe finish")
            // }
            setAuthorized(true)
            setSessionUser({
                "UserID": sessionStorage.getItem("UserID"),
                "Name": sessionStorage.getItem("Name"),
                "Phone": sessionStorage.getItem("Phone")
            })

            let car = JSON.parse(sessionStorage.getItem("car")) 
            console.log(car)
            setCar(car)

        }else{
            alert("YOU ARE SUSPECTED FOR TRESSPASSING!!! CALLING THE FBI")
            navigate("/")
        }

        

        //

        // getting all the car images
        function importAll(r) {
            return r.keys().map(r);
        }
        const imgs = importAll(require.context('/src/car pics', false, /\.(png|jpe?g|svg)$/))
        setCarImage(imgs);
        // console.log(carImage)
        //

        //getting booking details
        Axios.get("http://localhost:3001/getCarBookingDetails",{
            params: {CarID: car["CarID"]}
        }).then((res)=>{
            setBooking(res.data)
            console.log("booking is :")
            console.log(res.data)
        })
        //

        //getting the comments
        Axios.get("http://localhost:3001/getAllComments",{
            params: {CarID: car["CarID"]}
        }).then((res)=>{
            setComments(res.data)
            console.log(res.data)
        })
        
        
    },[authorized])

    const BookingsView=()=>{
        console.log("rendering"+typeof(booking)+ booking.length)
        if(booking.length >0){
            return(
                booking.map((b)=>{
                    // let startdatetime = b["StartDate"].split("T")
                    // let enddatetime = b["EndDate"].split("T")



                    let startdatetime = new Date(b["StartDate"])
                    let enddatetime = new Date(b["EndDate"])
                    startdatetime = startdatetime.toLocaleString().split(", ")
                    enddatetime = enddatetime.toLocaleString().split(", ")

                    return(
                        <div className='bookingList'>
                            <h3>{startdatetime[0]}</h3>
                            <h3>{startdatetime[1].split(".000Z")}</h3>
                            <h3>{enddatetime[0]}</h3>
                            <h3>{enddatetime[1].split(".000Z")}</h3>
                        </div>
                    )
                }
                )
            )
            
        }
        
    }

    const onConfirmBooking=()=>{
        const userKeyRegExp = /^[0-9]{4}\-[0-9]{2}\-[0-9]{2} [0-9]{2}\:[0-9]{2}\:[0-9]{2}?$/;
        console.log(userKeyRegExp.test(startTime))
        console.log(userKeyRegExp.test(endTime))
        if(userKeyRegExp.test(startTime) && userKeyRegExp.test(endTime)){
            
            
            let input_start = startTime; 
            let input_end = endTime;
            input_start = new Date(input_start)
            input_end = new Date(input_end)
            console.log("start time is " + input_start.toLocaleString())
            console.log("End time is "+input_end.toLocaleString())
            console.log("----------------")

            if(input_end <= input_start){
                alert("You are crazy. Time doesn't flow backward")
            }

            let isDateOpen = true

            for(let i=0; i<booking.length; i++){

                let get_start = new Date(booking[i]["StartDate"])
                let get_end = new Date(booking[i]["EndDate"])
                console.log(get_start)
                console.log(get_end)

                if( (input_start>=get_start && input_start<=get_end) || (input_end>=get_start && input_end<=get_end)){
                        console.log("already booked Middle")
                        isDateOpen = false
                        break
                }
                

                // if(input_start>=get_start && input_end<=get_end){
                //     console.log("already booked Middle")
                //     isDateOpen = false
                //     break
                // }
                // else if(input_start <= get_start ){
                //     console.log("input start is greater");
                //     if(input_end >= get_start){
                //         console.log("already booked Start")
                //         isDateOpen = false
                //         break
                //     }
                // }
                // else if(input_end >= get_end){
                //     console.log("input end is greater");
                //     if(input_start <= get_end){
                //         console.log("already booked End")
                //         isDateOpen = false
                //         break
                //     }
                // }
                // else{
                //     // isDateOpen = false
                //     // break
                    // console.log("Not booked")
                // }
            }

            console.log("Is a slot open? "+isDateOpen);
            console.log("-------------------");

            if(isDateOpen){
                setIsBookedView({"display":"block", "value": "Booking successfull"})
                setMakeBookingColor("#197ee3")

                Axios.post("http://localhost:3001/setSubscription", {
                    userID: sessionUser["UserID"],
                    carID: car["CarID"],
                    StartDate: startTime.replace(" ", "T"),
                    EndTime: endTime.replace(" ", "T")
                }).then((res)=>{
                    console.log(res)
                })
                
            }else{
                setIsBookedView({"display":"block", "value": "Already Booked"})
                setMakeBookingColor("#e32019")
            }
            


        }else{
            alert("ENTER THE TIME FORMAT PROPERLY")
            setStartTime("")
            setEndTime("")
        }
        // compare dates

    }

    const onCommentSubmit=()=>{
        console.log(sessionUser["UserID"])
        Axios.post("http://localhost:3001/addComment",{
            comment: commentInput,
            UserID: sessionUser["UserID"],
            CarID: car["CarID"]
        }).then((res)=>{
            alert(res.data)
        })
    }



    return(
        <div>
            <div className='logout' style={{marginTop: "-5%"}}>
                <h3 >{sessionUser["Name"]}</h3>
                <button onClick={()=>{sessionStorage.clear(); navigate("/")}}>Logout</button>
            </div>
            
            <h1 style={{color: "white"}}>{car["Name"]}</h1>
            <div className='container'>
                <img src={carImage[car["CarID"]-1]} className="img"/>
                <div className='bookingView'>
                    {/* find bookings */}
                    <div className='bookings'>
                        <h3 className='h'>Booking</h3>
                        <div className='headers'>
                            <h3>Start-Date</h3>
                            <h3>Start-Time</h3>
                            <h3>End-Date</h3>
                            <h3>End-Time</h3>
                        </div>
                        
                        <BookingsView />

                    </div>
                    {/* make booking */}

                    <div className='makeBooking' style={{backgroundColor: makeBookingColor}}>
                        <h1>MAKE YOUR BOOKING</h1>
                        <h1 style={{display: isBookedView["display"]}}>{isBookedView["value"]}</h1>

                        <h3 style={{display: "flex"}}>Start Date/Time - </h3> 
                        <input onChange={(e)=>{setStartTime(e.target.value)}} placeholder="YYYY-MM-DD HH:MM:SS"></input>

                        <h3 style={{display: "flex"}}>End Date/Time - </h3> 
                        <input onChange={(e)=>{setEndTime(e.target.value)}} placeholder="YYYY-MM-DD HH:MM:SS"></input>
                        
                        <button onClick={onConfirmBooking}>Confirm Booking</button>
                    </div>

                </div>

                {/* comments */}
                <div style={{textAlign: "center"}}>
                    <h1 style={{color: "aliceblue", marginLeft: "-70%"}}>Comments</h1>
                    <div className='addComment'>
                        <input onChange={(e)=>{setCommentInput(e.target.value)}}></input>
                        <button onClick={onCommentSubmit}>Comment</button>
                    </div>
                    <div className='commentView'>
                        {comments.map((c)=>{

                            if(c["CarID"] == car["CarID"]){
                                return(<h3>{c["Comment"]}</h3>)
                            }
                            
                        })}
                    </div>
                </div>
                {/* <Comment /> */}

            </div>
            
        </div>
    )

}



export default CarSubscribe;