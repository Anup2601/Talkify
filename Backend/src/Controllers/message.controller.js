import cloudinary from "../lib/cloudinary.js";
import Message from "../Models/message.model.js";
import User from "../Models/user.model.js";

export const getUsersForSlidebar = async(req,res) =>{
    try {
        const loggedInUserId=req.user._id;
        const filteredUsers= await User.findOne({_id:{$ne : loggedInUserId}}).select("-password");
        res.status(200).json(filteredUsers);
    } catch (error) {
        console.log("Error in getUsersForSlidebar controller",error.message);
        res.status(500).json({message:"Internal Server Error"});
    }
}

export const getMessages =async(req,res)=>{
    try {
        const {id:userToChatId}=req.params;
        const myId= req.user._id;
        const message=await Message.find({
            $or: [
                {senderId:myId,receiverId:userToChatId},
                {senderId:userToChatId,receiverId:myId},
            ],
        })
        res.status(200).json(message);
    } catch (error) {
        console.log("Error in getMessages controller",error.message);
        res.status(500).json({message:"Internal Server Error"});
    }
}

export const sendMessage = async (req,res) => {
    try {
        const {text,image}=req.body;
        const {id:receiverId}=req.params;
        const senderId=req.user._id;

        let imageUrl;
        if(image){
            const uploadResponse= await cloudinary.uploader.upload(image);
            imageUrl=uploadResponse.secure_url;
        }

        const newMessage= new Message({
            senderId,
            receiverId,
            text,
            image:imageUrl,
        });

        await newMessage.save();

        // socket.io work

        res.status(200).json(newMessage);

    } catch (error) {
        console.log("Error in sendMessage controller",error.message);
        res.status(500).json({message:"Internal Server Error"});
    }
}