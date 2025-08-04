import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema({
    image: {
        type: String,
        required: true
    },
    caption: {
        type: String,
        default: ""
    },
    link: {
        type: String,
        default: ""
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'user',
        required: true
    }
}, {
    timestamps: true
});

const BannerModel = mongoose.model('banner', bannerSchema);

export default BannerModel;