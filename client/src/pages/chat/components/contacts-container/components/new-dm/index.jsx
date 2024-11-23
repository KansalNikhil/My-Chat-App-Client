import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { FaPlus } from 'react-icons/fa';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
import Lottie from "react-lottie";
import { animationDefaultOptions } from "@/lib/utils";
import { apiClient } from '@/lib/api-client';
import { SEARCHCONTACTS } from '@/utils/constants';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { getColor } from '@/lib/utils';
import { useAppStore } from '@/store';
import { HOST } from '@/utils/constants';




const NewDM = () => {

    const {setSelectedChatType, setSelectedChatData} = useAppStore();
    const [openNewContactModal, setOpenNewContactModel] = useState(false);
    const [searchedContacts, setSearchedContacts] = useState([]);

    const searchContacts = async (searchTerm) => {
        try{
            if(searchTerm.length > 0){
                const response = await apiClient.post(SEARCHCONTACTS,{searchTerm}, {withCredentials:true});
                if(response.status === 200 && response.data.contacts){
                    setSearchedContacts(response.data.contacts)
                }
            }else{
                setSearchedContacts([]);
            }
        }
        catch(error){
            console.log({error});
        }
    }

    const selectNewContact = (contact) => {
        setOpenNewContactModel(false);
        setSelectedChatType("contact");
        setSelectedChatData(contact);
        setSearchedContacts([]);
    }

    return <>
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>
                    <FaPlus className='text-neutral-400 font-light text-opacity-90 text-sm hover:text-neutral-100 cursor-pointer transition-all duration-300'
                        onClick={()=>setOpenNewContactModel(true)}/>
                </TooltipTrigger>
                <TooltipContent className="bg-[#1c1b1e] border-none mb-2 p-3 text-white">Select New Contact</TooltipContent>
            </Tooltip>
        </TooltipProvider>
        <Dialog open={openNewContactModal} onOpenChange={setOpenNewContactModel}>
        <DialogContent className='bg-[#181928] border-none text-white w-[400px] h-[400px] flex flex-col'>
            <DialogHeader>
            <DialogTitle>Please select a Contact</DialogTitle>
            <DialogDescription>
            </DialogDescription>
            </DialogHeader>
            <div>
                <Input placeholder="Search Contacts" className="rounded-lgp-6 bg-[#2c2e3b] border-none" onChange={(e) =>searchContacts(e.target.value)}/>
            </div>
            {
                searchedContacts.length > 0 &&
            
            (<ScrollArea className="h-[250px]">
                <div className="flex flex-col gap-5">
                    {
                        searchedContacts.map(contact => 
                            <div key={contact._id} className='flex gap-3 items-center cursor-pointer' onClick={() => selectNewContact(contact)}>
                                <div className='w-12 h-12 relative'>
                                    <Avatar className='h-12 w-12 rounded-full overflow-hidden'>
                                        {
                                        contact.image?<AvatarImage src={`${HOST}/${contact.image}`} alt='profile' className='object-cover w-full h-full bg-black rounded-full' />
                                        : <div className={`uppercase h-12 w-12 text-lg border-[1px] flex justify-center items-center rounded-full ${getColor(contact.color)}`}>
                                        {contact.firstName? contact.firstName.split("").shift(): contact.email.split("").shift()}
                                        </div>
                                        }
                                    </Avatar>
                                </div>
                                <div className="flex flex-col">
                                <span>{contact.firstName && contact.lastName ? `${contact.firstName} ${contact.lastName}`:contact.email}</span>
                                <span>{contact.email ? `${contact.email}`:""}</span>
                                </div>
                            </div>
                        )
                    }
                </div>
            </ScrollArea>)}
            {searchedContacts.length <= 0 && 
                <div className="flex-1 md:bg-[#1c1d25] md:flex mt-5 md:mt-0 flex-col justify-center items-center duration-1000 transition-all">
                <Lottie
                isClickToPauseDisabled={true}
                height={100}
                width={100}
                options={animationDefaultOptions}
                />
                <div className="text-opacity-80 text-white flex flex-col gap-5 items-center mt-5 lg:text-2xl text-xl transition-all duration-300 text-center">
                    <h3 className="poppins-medium">
                        Hi<span className="text-purple-500">!</span> Search new
                        <span className="text-purple-500"> Contact.</span>
                    </h3>
                </div>
        </div>
            }
        </DialogContent>
        </Dialog>
    </>
}

export default NewDM;