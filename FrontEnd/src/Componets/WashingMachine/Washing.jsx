import { useState, useEffect, useContext } from "react";
import UserInput from "./UserInput";
// import QueueDisplay from "./QueueDisplay";

// import TimerHourMin from "./TimerHourMin";

// import PauseMachine from "./PauseMachine";
// import MachineErrorMessage from "./MachineErrorMessage";
import axios from "axios";
import MachineErrorMessage from "../WashingMachineControlling/MachineErrorMessage";
import TimerHourMin from "../WashingMachineControlling/TimerHourMin";
import QueueDisplay from "../WashingMachineControlling/QueueDisplay";
// import GardLoginProfile from "../WashingMachineControlling/GardLoginProfile";
import GardContext from "../../Context/GardContext";
import toast from 'react-hot-toast';

function Washing() {
  const [num, setNum] = useState(0);
  const [queue, setQueue] = useState([]);
//   const {gard}=useContext(GardContext);
  const [isStopped, setIsStopped] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3000/machine");
        console.log(response);
        setQueue(response.data);
      } catch (err) {
        console.error("Error in Getting Values of Machine User From Server ", err);
      }
    };
  
    fetchData(); // Invoke the async function
  
  }, []);
  const getUsersFromServer = async () => {
    try {
      const response = await axios.get("http://localhost:3000/machine");
      return response.data; // Return the fetched data
    } catch (err) {
      console.error("Error in Getting Values of Machine User From Server ", err);
      throw err; // Re-throw the error for handling in the calling function or component
    }
  };
  //Api of AddUser in Queue ho gaya ✅

 /* useEffect(async()=>{
    try {
      setQueue(await axios.post('http://localhost:3000/machine/', {
        firstName: 'Fred',
        lastName: 'Flintstone'
      })
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      }););
    } catch (err) {
      
    }
  },[]);*/
  const addUserToQueue = async (userData) => {
    try {
      
      if (queue.length > 0) {

        const lastUser = queue[queue.length - 1];
        console.log(lastUser);
        userData.atTimeAdded = lastUser.timeAtDelete;
        userData.atTimeDelete = lastUser.timeAtDelete + userData.time * 120; // Convert time to milliseconds
       
      } else {
        const currentTime = new Date().getTime();
        userData.atTimeAdded = currentTime;
        userData.atTimeDelete = currentTime + userData.time * 120; // Convert time to milliseconds
       
      }
  
      console.log("UserData Need TO update:",userData);
      const response = await axios.post("http://localhost:3000/machine", {
        userName: userData.id,
        phoneNo: userData.phoneNumber,
        roomNo: userData.roomNo,
        time: userData.time,
        timeAtAdded: userData.atTimeAdded,
        timeAtDelete: userData.atTimeDelete
      });
  
      console.log(response);
      if (response.data.status === 'failure') {
        toast.error("Data is not uploaded");
      }
      if(response.status ===200){
        toast.success('You Added Successfully');
      }

  
      // Assuming getUsersFromServer is defined and updates the queue state
      setQueue(await getUsersFromServer());
    } catch (err) {
      console.error("Error in Adding User to Queue or Getting Values of Machine User From Server ", err);
    }
  };
  
  //Delete  User Api Call From Queue Ho Gaya  ✅


const removeUserFromQueue = async () => {
  try {
    const response = await axios.delete(`http://localhost:3000/machine/`);
    console.log('Deleted Data', response);
    if(response.status===404){
      toast.error("NO  Such User Found In The Queue");
    }
    if(response.status===200){
      toast.success( "Successfully Removed from Queue");}
   
    setQueue(await getUsersFromServer());
  } catch (err) {
    toast.error("Error in Deleting first User", err);
  }
};

//Clock for send  request to server after every given interval
  useEffect(() => {
    if (isStopped) {
      return; // Return early if the machine is paused
    }

    const intervalId = setInterval(() => {
      if (queue[0]&&
        (queue[0].timeAtDelete < new Date().getTime())
      ) {
        removeUserFromQueue();
        setNum(0);
      } else {
        setNum(num + 1);
      }
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [queue, isStopped]); // Include isStopped in the dependencies array
  // Include firstUserTime in the dependency array
  // console.log(queue);
  //Api  call to delete by username is done ✅
  const deleteMachineQueueList = async (deletingUser) => {
    
      try {
        const result=await axios.delete(`http://localhost:3000/machine/${deletingUser.userName}`);
        console.log(result);
        if(result.status===200){
          toast.success('Deleted Successfully');
          setQueue(await getUsersFromServer());
        }else{
          throw Error('Something went wrong!')
        }
      } catch (err) {
        console.error("Error in Delete by User Name",err.message);
      }
  
    
    console.log(deletingUser);
};
//Extend Time ka API ho gaya ✅
  const updateQueueCatalog = async(extendedTime) => {
   
      try {
        const result= await axios.put(`http://localhost:3000/machine/${extendedTime}`);
        if(result.status==='200'){
          console.log("time updated");
        }
        setQueue(await getUsersFromServer());
      } catch (err) {
        console.error("Error updating time", err.message);
      }
    
  };
  // const updateQueueAfterPause = () => {
  //   var currentDate = new Date();
  //   var pauseDurationInMs = currentDate.getTime() - pauseStartTime;
  // };
  // eslint-disable-next-line no-unused-vars
  const [stoppedTime, setStoppedTime] = useState(0);
  // const twoMinTime={id:"TwoMin",time:2,atTimeAdded:firstTime.atTimeAdded,atTimeDelete:firstTime.atTimeAdded+2*600};
  const pauseMachine = () => {
    setIsStopped(true);
    setStoppedTime(new Date().getTime()); // Record the time when the machine is paused
  };

  const resumeMachine = () => {
    setIsStopped(false);
    const machinePausedTime = new Date().getTime() - stoppedTime; // Calculate the duration the machine was paused
    const updatedUsers = queue.map((user) => {
      return {
        ...user, // Spread operator to copy user object
        atTimeAdded: user.atTimeAdded + machinePausedTime, // Update the added time by adding the paused time
        atTimeDelete: user.atTimeDelete + machinePausedTime, // Assuming user.time is in seconds, update the delete time accordingly
      };
    });

    setQueue(updatedUsers);
    // setFirstTime(updatedUsers[0]); // Update firstTime with the first user
    // setFirstUserTime(updatedUsers[0]); // Update firstUserTime with the first user4
    setStoppedTime(0); // Reset the machinePausedTime
  };
  console.log(queue);

  // let key = "stop";
  // let pauseMachineBar=()=>{

  // };
  // let resumeMachineBar=()=>{

  // };
// setFirstUser(queue[0])
  return (
    <div>
        {/* <GardLoginProfile/> */}
       
      {/* <CurrentTime removeUserFromQueue={removeUserFromQueue} firstUserTime={firstTime} /> */}
      {/* <PauseMachine pauseMachine={pauseMachine} resumeMachine={resumeMachine} /> */}
      <center>
        <MachineErrorMessage queue={queue} isStopped={isStopped} />
      </center>

      <TimerHourMin
        // firstUserTime={}
        queue={queue}
        // pauseMachineBar={pauseMachineBar}
        // resumeMachineBar={resumeMachineBar}
        isStopped={isStopped}
      />
      <UserInput addUserToQueue={addUserToQueue} />
      <QueueDisplay
        queue={queue}
        // firstUser={queue[0]}
        updateQueueCatalog={updateQueueCatalog}
        deleteMachineQueueList={deleteMachineQueueList}
      />
      {/* <TimerHourMin firstUserTime={twoMinTime}/> */}
      {/* <FlipDate value={`${num}`}/>
     <Flipr value={num}/> */}
    </div>
  );
}

export default Washing;
