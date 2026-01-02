import mongoose from "mongoose"

const sessionSchema = new mongoose.Schema({
  UserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    unique: true,
    required: true
  }
}, { timestamps: true })



const sessionToken =  mongoose.model('session', sessionSchema);

export default sessionToken;