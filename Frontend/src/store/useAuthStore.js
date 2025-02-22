import axios from "axios";
import { create } from "zustand";
import { axiosInstanace } from "../lib/axios";

export const useAuthStore =create((set)=>({
    authUser:null,
    isSigingnUp:false,
    isLoginUp:false,
    isUpdatingProfile: false,
    isCheckingAuth : true,
    checkAuth:async ()=> {
        try {
            const res=await axiosInstanace.get("/auth/check");
            set({authUser:res.data})
        } catch (error) {
            console.log("Error in checkAuth:",error);
            set({authUser:null})
        }finally{
            set({isCheckingAuth:false})
        }
    }
}));