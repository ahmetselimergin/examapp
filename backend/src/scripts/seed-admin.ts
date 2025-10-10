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
    console.log('🚀 Exam App - Admin User Seeder');
    console.log('==================================');
    
    // Connect to database
    console.log('📡 Connecting to database...');
    await connectDB();
    console.log('✅ Database connected successfully!');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log(`📧 Admin Email: ${existingAdmin.email}`);
      process.exit(0);
    }

    // Create default admin user
    console.log('🔧 Creating default admin user...');
    
    const adminUser = await User.create(DEFAULT_ADMIN);

    console.log('✅ Admin user created successfully!');
    console.log('==================================');
    console.log(`👤 Name: ${adminUser.name}`);
    console.log(`📧 Email: ${adminUser.email}`);
    console.log(`🔒 Password: ${DEFAULT_ADMIN.password}`);
    console.log(`🔑 Role: ${adminUser.role}`);
    console.log('==================================');
    console.log('🎉 Setup completed! You can now login to the app.');
    console.log('⚠️  Don\'t forget to change the default password after first login!');

  } catch (error) {
    console.error('❌ Error during setup:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    process.exit(0);
  }
};

seedAdmin();
