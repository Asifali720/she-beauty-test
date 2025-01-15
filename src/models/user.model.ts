import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name']
    },
    email: {
      type: String,
      required: [true, 'Please provide a email'],
      unique: true
    },
    password: {
      type: String,
      required: [true, 'Please provide a password']
    },
    photo: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
      default: ''
    },
    role: {
      type: String,
      enum: ['staff', 'master_admin'],
      default: 'staff'
    },
    isVerfied: {
      type: Boolean,
      default: false
    },
    forgotPasswordToken: {
      type: String,
      default: null
    },
    forgotPasswordTokenExpiry: {
      type: Date,
      default: null
    },
    verifyToken: {
      type: String,
      default: null
    },
    verifyTokenExpiry: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
)

const UserModel = mongoose.models.users || mongoose.model('users', userSchema)

export default UserModel
