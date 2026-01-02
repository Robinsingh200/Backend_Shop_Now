import mongoose from "mongoose";
// import bcrypt from 'bcrypt'


const UserSchema = new mongoose.Schema({

     firstName: {
          type: String,
          required: true
     },
     lastName: {
          type: String,
          required: true
     },
     profilePicture: {
          type: String,
          // required: true
     },
     profileId: {
          type: String,
          // required: true
     },
     gmail:
     {
          type: String,
          required: true,
          unique: true
     },
     password: {
          type: String,
          required: true
     },
     role: {
          type: String,
          enum: ['user', 'admin'],
          default: 'user'
     },
     token: {
          type: String,
          default: null,
     },
     isVerified: {
          type: Boolean,
          default: false,
     },
     isLoggied: {
          type: Boolean,
          default: false,
     },
     otp: {
          type: String,
          default: null,
     },
     otpExpire: {
          type: Date,
          default: null,
     },
     address: {
          type: String,
     },

     city: {
          type: String,
     },

     zipCode: {
          type: String,
     },

     Phoneno: {
          type: String,
     },


}, { timestamps: true })


const AuthenticLogin = mongoose.model('User', UserSchema);

export default AuthenticLogin;