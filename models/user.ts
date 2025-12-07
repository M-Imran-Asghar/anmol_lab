import bcrypt from "bcryptjs";
import mongoose, { model, models, Schema } from "mongoose";

export interface IUser {
    email: string,
    password: string,
    name: string,
    isAdmin: boolean,
    createdAt: Date,
    updatedAt: Date,
    _id?: mongoose.Types.ObjectId
}

const userSchema = new Schema<IUser>({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Use a simpler approach without the `next` parameter
userSchema.pre("save", async function() {
    // Only hash the password if it's modified
    if (this.isModified("password") && this.password) {
        try {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        } catch (error) {
            console.error("Error hashing password:", error);
            
        }
    }
    
    
    if (this.isNew) {
        this.createdAt = new Date();
    }
    this.updatedAt = new Date();
});

const User = models?.User || model<IUser>("User", userSchema);

export default User;