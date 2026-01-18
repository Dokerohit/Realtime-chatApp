import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId,io } from "../lib/socket.js";

export const getUsersForSiderbar = async (req, res) => {
    try {
      const loggedInUser = req.user._id;
  
      // Get all users except logged-in user
      const users = await User.find({ _id: { $ne: loggedInUser } })
        .select("-password");
  
      // Attach last message time for each user
      const usersWithLastMessage = await Promise.all(
        users.map(async (user) => {
          const lastMessage = await Message.findOne({
            $or: [
              { senderId: loggedInUser, receiverId: user._id },
              { senderId: user._id, receiverId: loggedInUser },
            ],
          }).sort({ createdAt: -1 });
  
          return {
            ...user.toObject(),
            lastMessageAt: lastMessage ? lastMessage.createdAt : null,
          };
        })
      );
  
      //  Sort users by recent chat
      usersWithLastMessage.sort(
        (a, b) =>
          new Date(b.lastMessageAt || 0) -
          new Date(a.lastMessageAt || 0)
      );
  
      res.status(200).json(usersWithLastMessage);
    } catch (error) {
      console.error("Error in getUsersForSidebar:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
export const getMessages = async (req, res) => {
    try {
      const userToChatId = req.params.id;        // string
      const myId = req.user._id.toString();      // string
  
      const messages = await Message.find({
        $or: [
          { senderId: myId, receiverId: userToChatId },
          { senderId: userToChatId, receiverId: myId },
        ],
      }).sort({ createdAt: 1 });
    
      res.status(200).json(messages);
    } catch (error) {
      console.log("Error in getMessages controller:", error);
      res.status(500).json({ error: "Internal server error" });
    }
}
export const sendMessage = async(req,res)=>{
    try {
        const {text,image}=req.body;
        //change here
        const receiverId = req.params.id.toString();   // jisko bhejna hai
         const senderId = req.user._id.toString();      // myid

        let imageUrl;
        if (image) {
            // Upload base64 image to cloudinary
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }
        //new message to send
        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl, //if provided
        });
       await newMessage.save();

       //todo:real Time functionality goes here socket.io

       const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", newMessage);
        }
       res.status(201).json(newMessage);
    } catch (error) {
        console.log("Error in sendMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}