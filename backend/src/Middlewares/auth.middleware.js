import User from "../Models/user.model.js";
import jwt from "jsonwebtoken";

export const protectRoute= async (req,res,next)=>{
    try {
        const token=req.cookies.jwt;
        if(!token){
            return res.status(400).json({message:"Unauthorized NO-Token Provided"});
        }

        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        if(!decoded){
            return res.status(400).json({message:"Unauthorized Invalid-Token"});
        }

        const user=await User.findById(decoded.userId).select("-password");
        if(!user){
            return res.status(404).json({message:"User Not Found"});
        }

        req.user=user;
        next();

    } catch (error) {
        return res.status(500).json({message:"Internal Server Error"});
    }
}