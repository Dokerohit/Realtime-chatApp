
import {create} from "zustand";
import { axiosInstance } from "../lib/axios.js"; 
import toast from 'react-hot-toast';
import { useAuthStore } from "./useAuthStore";

export const useChatStore=create((set,get)=>({
    messages:[],
    users:[],
    selectedUser:null,
    isUsersLoading:false,
    isMessagesLoading:false,


        getUsers: async () => {
            set({ isUsersLoading: true });
            try {
              const res = await axiosInstance.get("/messages/users");
              set({ users: res.data });
            } catch (error) {
              toast.error(error.response.data.message);
            } finally {
              set({ isUsersLoading: false });
            }
          },

          getMessages: async (userId) => {
            if (!userId) return;
          
            set({ isMessagesLoading: true });
          
            try {
              const res = await axiosInstance.get(`/messages/${userId}`);
          
              set((state) => ({
                messages: res.data ?? state.messages,
              }));
            } catch (error) {
              toast.error(error.response?.data?.message || "Failed to load messages");
            } finally {
              set({ isMessagesLoading: false });
            }
          },
          
          sendMessage: async (messageData) => {
            const { selectedUser } = get();
            if (!selectedUser) return;
          
            try {
              const res = await axiosInstance.post(
                `/messages/send/${selectedUser._id}`,
                messageData
              );
          
              set((state) => ({
                messages: [...state.messages, res.data],
              }));
            } catch (error) {
              toast.error(error.response?.data?.message || "Failed to send message");
            }
          },
          

          //changed
          subscribeToMessages: () => {
            const { selectedUser } = get();
            if (!selectedUser) return;
          
            const socket = useAuthStore.getState().socket;
            if (!socket) return;
          
            socket.off("newMessage");
          
            socket.on("newMessage", (newMessage) => {
              const { authUser } = useAuthStore.getState();
          
              const isChatMessage =
                (String(newMessage.senderId) === String(selectedUser._id) &&
                 String(newMessage.receiverId) === String(authUser._id)) ||
                (String(newMessage.senderId) === String(authUser._id) &&
                 String(newMessage.receiverId) === String(selectedUser._id));
          
              if (!isChatMessage) return;
          
              set((state) => ({
                messages: [...state.messages, newMessage],
              }));
            });
          },
          
          unsubscribeFromMessages: () => {
            const socket = useAuthStore.getState().socket;
            if (socket) {
              socket.off("newMessage");
            }
          },
          
        
        setSelectedUser:(selectedUser)=>set({selectedUser}),

}));