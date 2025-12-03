import bcrypt from "bcryptjs";
import mongoose, {model, models, Schema } from "mongoose";


export interface IUser {
    email : string,
    password : string,
    name : string,
    isAdmin : boolean,
    createdAt : Date,
    updatedAt : Date,
    _id?: mongoose.Types.ObjectId
}
const userSchema = new Schema <IUser>({
    email : {type : String, required : true, unique : true},
    password : {type : String, required : true},
    name : {type : String, required : true},
    isAdmin : {type : Boolean, default : false},
    createdAt : {type : Date, default : Date.now},
    updatedAt : {type : Date, default : Date.now}
})
userSchema.pre("save", async function(){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 10)
    }

    next()
}) 


 const User = models?.User || model<IUser>("User", userSchema)

 export default User