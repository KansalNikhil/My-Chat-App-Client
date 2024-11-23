import { useAppStore } from "@/store";
import { useSocket } from "@/context/SocketContext";
import EmojiPicker from "emoji-picker-react";
import { useState, useRef, useEffect } from "react";
import { GrAttachment } from 'react-icons/gr';
import { IoSend } from "react-icons/io5";
import { RiEmojiStickerLine } from "react-icons/ri";
import { apiClient } from "@/lib/api-client";
import { UPLOADFILEROUTES } from "@/utils/constants";

const MessageBar = () => {
    const emojiRef = useRef(); 
    const fileInputRef = useRef();
    const { selectedChatType, selectedChatData, userInfo, setIsUploading, setfileUploadingProgress } = useAppStore();
    const socket = useSocket();
    const [message, setMessage] = useState("");
    const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

    useEffect(()=>{
        function handleClickOutside(event){
            if(emojiRef.current && !emojiRef.current.contains(event.target)){
                setEmojiPickerOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown",handleClickOutside);
        }
    },[emojiRef])

    const handleSendMessage = async() => {
        if(message){
        if(selectedChatType === "contact"){
            socket.emit("sendMessage", {
                 sender:userInfo.id,
                 content:message,
                 recipient:selectedChatData._id,
                 messageType:"text",
                 fileUrl: undefined,
            })  
        } 
        else if(selectedChatType === "channel"){
            console.log("Message_send");
            socket.emit("send-channel-message", {
                sender:userInfo.id,
                content:message,
                messageType:"text",
                fileUrl: undefined,
                channelId: selectedChatData._id,
           })
        }};
        setMessage("");
    }

    const handleAddEmoji = (emoji) =>{
        setMessage((msg => msg + emoji.emoji));
    }

    const handleAttachmentClick = () => {
        if(fileInputRef.current){
            fileInputRef.current.click();
        }
    }

    const handleAttachmentChange = async(event) => {
        try{
            const file = event.target.files[0];
            if(file){
                const formdata = new FormData();
                formdata.append("file", file);
                setIsUploading(true);
                const response = await apiClient.post(UPLOADFILEROUTES, formdata, {withCredentials:true, onUploadProgress:data => setfileUploadingProgress(Math.round(100*data.loaded/data.total))});
                if(response.status === 200 && response.data){
                setIsUploading(false);
                if(selectedChatType === "contact"){
                        socket.emit("sendMessage", {
                            sender:userInfo.id,
                            content:undefined,
                            recipient:selectedChatData._id,
                            messageType:"file",
                            fileUrl: response.data.filePath,
                        });
                    }
                    else if(selectedChatType === "channel"){
                        socket.emit("send-channel-message", {
                            sender:userInfo.id,
                            content:undefined,
                            messageType:"file",
                            fileUrl: response.data.filePath,
                            channelId: selectedChatData._id,
                       })
                    }
                }
            }
        }catch(error){
                setIsUploading(true);
                console.log(error);
        }
    }

    return <div className="h-[10vh] bg-[#1c1d25] flex items-center justify-center px-8 mb-6 gap-6">
        <div className="flex-1 flex bg-[#2a2b33] rounded-md items-center gap-5 pr-5">
            <input 
                type="text" 
                className="flex-1 p-5 bg-transparent rounded-md focus:border-none focus:outline-none" 
                placeholder="Enter Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                />
            <button className="text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all"
            onClick={handleAttachmentClick}>
                <GrAttachment className="text-2xl"/>
            </button>
            <input type="file" className="hidden" ref={fileInputRef} onChange={handleAttachmentChange} />
            <div className="relative">
                <button 
                    className="text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all"
                    onClick={() => setEmojiPickerOpen(true)}>
                    <RiEmojiStickerLine className="text-2xl"/>
                </button>
                <div className="absolute bottom-16 right-0" ref={emojiRef}>
                    <EmojiPicker theme="dark"
                        open={emojiPickerOpen}
                        onEmojiClick={handleAddEmoji}
                        autoFocusSearch={false}
                    />
                </div>
            </div>
        </div>
        <button 
            className="bg-[#8417ff] p-5 rounded-md flex items-center justify-center focus:border-none hover:bg-[#741bda] focus:bg-[#741bda] focus:text-white duration-300 transition-all"
            onClick={handleSendMessage}
            >
            <IoSend className="text-2xl"/>
        </button>
    </div>
}

export default MessageBar;