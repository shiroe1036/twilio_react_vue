import { useState } from "react"
import { Client as ConversationsClient } from "@twilio/conversations";
import axios from "axios";
import { Conversations } from "./Conversation";
import '../css/chat.css';

export function Chat(){
    const [statusString, setStatusString] = useState("")
    const [activeConversation, setActiveConversation] = useState(null)
    const [name, setName] = useState("")
    const [nameRegistered, setNameRegistered] = useState(false)
    const [isConnected, setIsConnected] = useState(false)



    const [tokenTwilio, setToken] = useState(null)
    
    const initConversationsClient = async () => {
        window.ConversationsClient = ConversationsClient

        const token = await getToken(name);
        console.log("token", token)

        const conversationsClient = new ConversationsClient(token)

        setToken(token)
        
        setStatusString("Connecting to twilio...")

        conversationsClient.on("connectionStateChanged", (state) => {
            switch (state) {
                case "connected":
                    setStatusString("You are connected.");
                    setIsConnected(true)
                  break;
                case "disconnecting":
                  setStatusString("Disconnecting from Twilio...");
                  break;
                case "disconnected":
                  setStatusString("Disconnected")
                  break;
                case "denied":
                  setStatusString("Failed to connect.")
                  break;
                default:
                    break
              }
            })
    }

    const getToken = async (identity) => {
        const response = await axios.get(`http://localhost:5000/auth/user/${identity}`);

        const responseJson = await response.data
        return responseJson.token
    }

    const registerName = async () => {
        setNameRegistered(true)
        await initConversationsClient()
    }

    const createConversation = async () => {
        const conversationsClient = new ConversationsClient(tokenTwilio)
        try {
            await conversationsClient.getUser("User1")
            await conversationsClient.getUser("User2")
        } catch (error) {
            console.error("Waiting for User1 and User2 client sessions");
            return;
        }

        try {
            const newCOnversation = await conversationsClient.createConversation({
                uniqueName: "chat"
            })

            const joinedConversation = await newCOnversation
                .join()
                .catch(err => console.log(err))

            await joinedConversation
                .add("User1")
                .catch(err => console.log("error: ", err))

            await joinedConversation
                .add("User2")
                .catch(err => console.log("error: ", err))
        } catch (error) {
            const activeConv = await conversationsClient.getConversationByUniqueName("chat")
            console.log("activ conv", activeConv)
            setActiveConversation(activeConv)
        }
    }

    const handleInputData = (e) => {
        setName(e.target.value)
    }

    return(
        <div id="chat">
            <h1>
                Welcome to the Vue chat app<span v-if="nameRegistered">, { name }</span>!
            </h1>
            <p>{ statusString }</p>
            {
                (!nameRegistered) ? (
                    <>
                        <input
                            type="text"
                            value={name}
                            onChange={handleInputData}
                        />
                        <button onClick={registerName}>Register name</button>
                    </>
                ) : null
            }

            {
                (nameRegistered && !activeConversation && isConnected) ? (
                    <button onClick={createConversation}>Join chat</button>
                ) : null 
            }

            {
                (activeConversation) ? (
                    <Conversations
                        active_conversation_prop={activeConversation}
                        name_prop={name}
                    />
                ) : null
            }
        </div>
    )
}