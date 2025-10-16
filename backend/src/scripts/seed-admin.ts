import "dotenv/config";
import { User } from "../models/User";
import connectDB from "../config/db";

// Default admin credentials
const DEFAULT_ADMIN = {
  name: "Admin",
  email: "admin@examapp.com",
  password: "admin123",
  role: "admin" as const
};

const seedAdmin = async (): Promise<void> => {
  try {
    
    // Connect to database
    await connectDB();

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      process.exit(0);
    }

    // Create default admin user
    
    const adminUser = await User.create(DEFAULT_ADMIN);


  } catch (error) {
    console.error('❌ Error during setup:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    process.exit(0);
  }
};

seedAdmin();
