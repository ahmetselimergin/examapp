import "dotenv/config";
import readline from "readline";
import { User } from "../models/User";
import connectDB from "../config/db";

// Console colors for better UI
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

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
    console.log(colors.cyan + colors.bright);
    console.log('╔══════════════════════════════════════╗');
    console.log('║        EXAM APP INSTALLER            ║');
    console.log('║    İlk Kurulum - Admin Kullanıcısı   ║');
    console.log('╚══════════════════════════════════════╝');
    console.log(colors.reset);

    // Connect to database
    console.log(colors.yellow + '📡 Veritabanına bağlanılıyor...' + colors.reset);
    await connectDB();
    console.log(colors.green + '✅ Veritabanı bağlantısı başarılı!' + colors.reset);

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log(colors.yellow + '⚠️  Admin kullanıcısı zaten mevcut!' + colors.reset);
      console.log(colors.blue + `📧 Admin Email: ${existingAdmin.email}` + colors.reset);
      console.log(colors.green + '✅ Kurulum tamamlandı.' + colors.reset);
      rl.close();
      process.exit(0);
    }

    console.log(colors.magenta + '\n👤 Admin kullanıcısı bilgilerini giriniz:' + colors.reset);

    // Get admin details
    let name = '';
    while (!name) {
      name = await askQuestion(colors.cyan + '📝 Admin Adı: ' + colors.reset);
      if (!name) {
        console.log(colors.red + '❌ Ad boş olamaz!' + colors.reset);
      }
    }

    let email = '';
    while (!email || !isValidEmail(email)) {
      email = await askQuestion(colors.cyan + '📧 Admin Email: ' + colors.reset);
      if (!email) {
        console.log(colors.red + '❌ Email boş olamaz!' + colors.reset);
      } else if (!isValidEmail(email)) {
        console.log(colors.red + '❌ Geçerli bir email adresi giriniz!' + colors.reset);
      }
    }

    let password = '';
    while (password.length < 6) {
      password = await askPassword(colors.cyan + '🔒 Admin Şifresi (min 6 karakter): ' + colors.reset);
      if (password.length < 6) {
        console.log(colors.red + '❌ Şifre en az 6 karakter olmalıdır!' + colors.reset);
      }
    }

    let confirmPassword = '';
    while (confirmPassword !== password) {
      confirmPassword = await askPassword(colors.cyan + '🔒 Şifre Tekrarı: ' + colors.reset);
      if (confirmPassword !== password) {
        console.log(colors.red + '❌ Şifreler eşleşmiyor!' + colors.reset);
      }
    }

    // Create admin user
    console.log(colors.yellow + '\n🔧 Admin kullanıcısı oluşturuluyor...' + colors.reset);
    
    const adminUser = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'admin'
    });

    console.log(colors.green + colors.bright);
    console.log('\n╔══════════════════════════════════════╗');
    console.log('║           KURULUM BAŞARILI!          ║');
    console.log('╚══════════════════════════════════════╝');
    console.log(colors.reset);
    
    console.log(colors.green + '✅ Admin kullanıcısı başarıyla oluşturuldu!' + colors.reset);
    console.log(colors.blue + `👤 Ad: ${adminUser.name}` + colors.reset);
    console.log(colors.blue + `📧 Email: ${adminUser.email}` + colors.reset);
    console.log(colors.blue + `🔑 Rol: ${adminUser.role}` + colors.reset);
    
    console.log(colors.magenta + '\n🚀 Artık uygulamayı kullanabilirsiniz!' + colors.reset);
    console.log(colors.cyan + '💡 Frontend\'e giriş yapmak için yukarıdaki bilgileri kullanın.' + colors.reset);

  } catch (error) {
    console.error(colors.red + '❌ Kurulum sırasında hata oluştu:' + colors.reset);
    console.error(colors.red + (error instanceof Error ? error.message : String(error)) + colors.reset);
    process.exit(1);
  } finally {
    rl.close();
    process.exit(0);
  }
};

// Handle process termination
process.on('SIGINT', () => {
  console.log(colors.red + '\n\n❌ Kurulum iptal edildi.' + colors.reset);
  rl.close();
  process.exit(1);
});

process.on('SIGTERM', () => {
  rl.close();
  process.exit(1);
});

// Run installer
installer();
