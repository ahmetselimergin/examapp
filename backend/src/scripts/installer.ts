import "dotenv/config";
import readline from "readline";
import { User } from "../models/User";
import connectDB from "../config/db";

// Installer utilities

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Utility function to ask questions
const askQuestion = (question: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
};

// Hide password input
const askPassword = (question: string): Promise<string> => {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    const stdout = process.stdout;
    
    stdout.write(question);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    
    let password = '';
    const onData = (char: string) => {
      char = char + '';
      
      switch (char) {
        case '\n':
        case '\r':
        case '\u0004':
          stdin.setRawMode(false);
          stdin.pause();
          stdin.removeListener('data', onData);
          stdout.write('\n');
          resolve(password);
          break;
        case '\u0003':
          process.exit();
          break;
        case '\u007f': // Backspace
          if (password.length > 0) {
            password = password.slice(0, -1);
            stdout.write('\b \b');
          }
          break;
        default:
          password += char;
          stdout.write('*');
          break;
      }
    };
    
    stdin.on('data', onData);
  });
};

// Email validation
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Main installer function
const installer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDB();

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      rl.close();
      process.exit(0);
    }

    // Get admin details
    let name = '';
    while (!name) {
      name = await askQuestion('Admin Adı: ');
    }

    let email = '';
    while (!email || !isValidEmail(email)) {
      email = await askQuestion('Admin Email: ');
    }

    let password = '';
    while (password.length < 6) {
      password = await askPassword('Admin Şifresi (min 6 karakter): ');
    }

    let confirmPassword = '';
    while (confirmPassword !== password) {
      confirmPassword = await askPassword('Şifre Tekrarı: ');
    }

    // Create admin user
    const adminUser = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'admin'
    });

  } catch (error) {
    console.error('Kurulum hatası:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    rl.close();
    process.exit(0);
  }
};

// Handle process termination
process.on('SIGINT', () => {
  rl.close();
  process.exit(1);
});

process.on('SIGTERM', () => {
  rl.close();
  process.exit(1);
});

// Run installer
installer();
