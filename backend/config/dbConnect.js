import mongoose from "mongoose"

const dbConnect = async () => {
  if(mongoose.connection.readyState >= 1){
    return
  }
  
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

export default dbConnect;
