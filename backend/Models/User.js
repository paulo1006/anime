import mongoose from "mongoose";

const FavoritoSchema = new mongoose.Schema({
    mal_id: Number,
    title: String,
    image: String
});

const UserSchema = new mongoose.Schema({
    nome: String,
    email: String,
    favoritos: [FavoritoSchema]
});

export default mongoose.model("User", UserSchema);
