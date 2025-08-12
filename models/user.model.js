import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true,"Provide name"]
    },
    email : {
        type : String,
        required : function() {
            return !this.mobile || this.mobile === null;
        },
        unique : true,
        sparse: true
    },
    password : {
        type : String,
        required : [true, "provide password"]
    },
    avatar : {
        type : String,
        default : ""
    },
    mobile : {
        type : String,
        unique : true,
        sparse: true,
        validate: {
            validator: function(v) {
                return !v || /^[6-9]\d{9}$/.test(v);
            },
            message: 'Please enter a valid 10-digit mobile number'
        }
    },
    country_code : {
        type : String,
        default : "+91"
    },
    refresh_token : {
        type : String,
        default : ""
    },
    verify_email : {
        type : Boolean,
        default : false
    },
    verify_mobile : {
        type : Boolean,
        default : false
    },
    mobile_otp : {
        type : String,
        default : null
    },
    mobile_otp_expiry : {
        type : Date,
        default : null
    },
    login_type : {
        type : String,
        enum : ["email", "mobile"],
        default : "email"
    },
    last_login_date : {
        type : Date,
        default : ""
    },
    status : {
        type : String,
        enum : ["Active","Inactive","Suspended"],
        default : "Active"
    },
    address_details : [
        {
            type : mongoose.Schema.ObjectId,
            ref : 'address'
        }
    ],
    shopping_cart : [
        {
            type : mongoose.Schema.ObjectId,
            ref : 'cartProduct'
        }
    ],
    orderHistory : [
        {
            type : mongoose.Schema.ObjectId,
            ref : 'order'
        }
    ],
    forgot_password_otp : {
        type : String,
        default : null
    },
    forgot_password_expiry : {
        type : Date,
        default : ""
    },
    role : {
        type : String,
        enum : ['ADMIN',"USER"],
        default : "USER"
    },
    wishlist: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'product',
        }
    ],
    saveForLater: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'cartProduct',
        }
    ]
},{
    timestamps : true
})

// Pre-save middleware to ensure either email or mobile is provided
userSchema.pre('save', function(next) {
    if (!this.email && !this.mobile) {
        return next(new Error('Either email or mobile number is required'));
    }
    next();
});

const UserModel = mongoose.model("User",userSchema)

export default UserModel