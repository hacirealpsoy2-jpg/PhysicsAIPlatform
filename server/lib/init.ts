import bcrypt from "bcryptjs";
import { storage } from "../storage";

export async function initializeAdminUser() {
  try {
    const adminUsername = "admin";
    const adminPassword = process.env.ADMIN_PASSWORD || "Ferhat4755__";

    const existingAdmin = await storage.getUserByUsername(adminUsername);
    
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const adminUser = await storage.createUser({
        username: adminUsername,
        password: hashedPassword,
      });

      await storage.updateUser(adminUser.id, { role: "admin" });
      
      console.log("✅ Admin kullanıcısı oluşturuldu:");
      console.log(`   Kullanıcı adı: ${adminUsername}`);
      console.log(`   Şifre: ${adminPassword}`);
      console.log("   ⚠️  Üretim ortamında ADMIN_PASSWORD değişkenini mutlaka değiştirin!");
    } else {
      console.log("✅ Admin kullanıcısı zaten mevcut");
    }
  } catch (error) {
    console.error("❌ Admin kullanıcısı oluşturulamadı:", error);
  }
}
