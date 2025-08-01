import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../Models/user.model.js";
import bcrypt from "bcryptjs";

export const signup= async (req,res)=>{
    const {fullName,email,password}=req.body;
    try {
        if(!fullName ||!email ||  !password){
            return res.status(400).json({message:"All Fields are required"})
        }
        if(password.length<6){
            return res.status(400).json({message:"Password Must be at least 6 characters"})
        }
        const user=await User.findOne({email});
        if (user) return res.status(400).json({message:"User already exists"});
        const salt= await bcrypt.genSalt(10);
        const hashPassword=await bcrypt.hash(password,salt);

        const newUser= new User({
            fullName,
            email,
            password:hashPassword,
        })
        if(newUser){
            // generate JWT Token
            generateToken(newUser._id,res);
            await newUser.save();
            
            res.status(200).json({
                _id:newUser._id,
                fullName:newUser.fullName,
                email:newUser.email,
                profilePic:newUser.profilePic,
                createdAt:newUser.createdAt,
            });
        }
        else{
            return res.status(400).json({message:"Invalid User data"});
        }

    } catch (error) {
        console.log("Error in signup controller",error.message);
        res.status(500).json({message:"Internal Server Error"});
    }
};

export const  login= async (req,res)=>{
    const {email,password}=req.body;
    try {
        const user= await User.findOne({email});
        if(!user){
           return res.status(400).json({message:"Invalid Credentials"})
        }
        const isPasswordCorrect=await bcrypt.compare(password,user.password);
        if(!isPasswordCorrect){
            return res.status(400).json({message:"Invalid Credentials"})
        }
        generateToken(user._id,res);
        res.status(200).json({
            _id:user._id,
            fullName:user.fullName,
            email:user.email,
            profilePic:user.profilePic,
            createdAt: user.createdAt,
        });

    } catch (error) {
        console.log("Error in login controller",error.message);
        res.status(500).json({message:"Internal Server Error"});
    }
};

export const logout=(req,res)=>{
    try {
        res.cookie("jwt","",{maxAge:0})
        res.status(200).json({message:"Logged Out Sucessfully"})
    } catch (error) {
        console.log("Error in logout controller",error.message);
        res.status(500).json({message:"Internal Server Error"});
    }
};

export const updateProfile = async (req,res)=>{
    try {
        const {profilePic}= req.body;
        const userId=req.user._id;

        if(!profilePic){
            return res.status(400).json({message:"Profile Picture is required"});
        }

        const uploadResponse= await cloudinary.uploader.upload(profilePic);
        const updatedUser= await User.findByIdAndUpdate(
            userId,
            {profilePic:uploadResponse.secure_url},
            {new:true});

        res.status(200).json(updatedUser);

    } catch (error) {
        console.log("Error in UpdateProfile controller",error);
        res.status(500).json({message:"Internal Server Error"});
    }
}

export const checkAuth=  (req,res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in checkAuth controller",error.message);
        res.status(500).json({message:"Internal Server Error"});
    }
}
