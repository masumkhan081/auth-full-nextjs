export async function register() {
  // Only run the seed script on the Node.js server environment (not edge)
  // We MUST dynamically import Node-only dependencies inside this block,
  // otherwise they will crash the Edge runtime with __import_unsupported
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { db } = await import("./db");
    const { users } = await import("./db/schema");
    const { eq } = await import("drizzle-orm");
    const bcrypt = (await import("bcryptjs")).default;

    console.log("🌱 [Seed] Running startup checks...");

    const superAdminEmail = process.env.SUPERADMIN_EMAIL;
    const superAdminName = process.env.SUPERADMIN_NAME;
    const superAdminPassword = process.env.SUPERADMIN_PASSWORD;

    if (!superAdminEmail || !superAdminPassword) {
      console.log("🌱 [Seed] SUPERADMIN_EMAIL or SUPERADMIN_PASSWORD not set. Skipping genesis account creation.");
      return;
    }

    try {
      // Check if user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, superAdminEmail))
        .limit(1);

      const passwordHash = await bcrypt.hash(superAdminPassword, 12);

      if (existingUser.length > 0) {
        // User exists -> Ensure they have Super Admin privileges and their details match .env
        const user = existingUser[0];
        
        // Only update if something actually changed to prevent unnecessary DB writes
        const isNameDiff = user.name !== superAdminName;
        const isRoleDiff = user.role !== "SUPERADMIN";
        const isPasswordDiff = !(await bcrypt.compare(superAdminPassword, user.passwordHash));

        if (isNameDiff || isRoleDiff || isPasswordDiff) {
          console.log(`🌱 [Seed] Updating existing Super Admin account for ${superAdminEmail}...`);
          await db
            .update(users)
            .set({
              name: superAdminName || "Super Admin",
              role: "SUPERADMIN",
              passwordHash: isPasswordDiff ? passwordHash : user.passwordHash,
              updatedAt: new Date(),
            })
            .where(eq(users.id, user.id));
          console.log("🌱 [Seed] Super Admin updated successfully.");
        } else {
          console.log("🌱 [Seed] Super Admin already exists and is up to date.");
        }
      } else {
        // User does not exist -> Create the Genesis Account
        console.log(`🌱 [Seed] Creating Genesis Super Admin account for ${superAdminEmail}...`);
        await db.insert(users).values({
          name: superAdminName || "Super Admin",
          email: superAdminEmail,
          passwordHash,
          emailVerified: true, // Auto-verify the super admin
          role: "SUPERADMIN",
        });
        console.log("🌱 [Seed] Genesis Super Admin created successfully.");
      }
    } catch (error) {
      console.error("🌱 [Seed] Error during startup seed:", error);
    }
  }
}
