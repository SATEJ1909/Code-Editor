import mongoose from "mongoose";

const UserSchma = new mongoose.Schema({
    username : {type : String , required : true },
    email : {type :String , required : true , unique : true},
    password : {type: String , required : true }
})

const UserModel =  mongoose.model('User', UserSchma);
export default UserModel ;