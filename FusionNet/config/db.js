import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_CS, {

    })
    console.log('MongoDB connection SUCCESS')
  } catch (error) {
    console.log('MongoDB connection FAIL', error)
    process.exit(1) // Stop server if DB connection fails
  }
}

export default connectDB
