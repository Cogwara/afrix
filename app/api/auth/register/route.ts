import { NextResponse } from "next/server";
import { RegisterSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { generateReferralCode } from "@/lib/utils";
import { Prisma } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const result = RegisterSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password, country, role, referralCode, firstName, lastName, businessName, phone } = result.data;

    // Check if user already exists in Prisma
    const existingUser = await prisma.userProfile.findFirst({
      where: {
        OR: [
          { email },
          ...(phone ? [{ phone }] : []),
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email or phone already exists." },
        { status: 409 }
      );
    }

    // Sign up with Supabase Auth
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    let authUserId: string;
    if (authError || !authData.user) {
      // In development / testing environment without real Supabase connection
      const isPlaceholder = process.env.NEXT_PUBLIC_SUPABASE_URL === "https://placeholder.supabase.co" || !process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (isPlaceholder) {
        authUserId = crypto.randomUUID();
      } else {
        return NextResponse.json(
          { error: authError?.message || "Failed to create authentication user." },
          { status: 400 }
        );
      }
    } else {
      authUserId = authData.user.id;
    }

    // Check referral code
    let referredById: string | null = null;
    let referrerProfile = null;
    if (referralCode) {
      referrerProfile = await prisma.userProfile.findUnique({
        where: { referralCode },
      });
      if (referrerProfile) {
        referredById = referrerProfile.id;
      }
    }

    const newReferralCode = generateReferralCode(8);

    // Create UserProfile, Worker/Business profile, and Wallet in a single transaction
    const newUser = await prisma.$transaction(async (tx) => {
      const userProfile = await tx.userProfile.create({
        data: {
          authUserId,
          email,
          phone: phone || null,
          role: role as "WORKER" | "BUSINESS",
          country,
          referralCode: newReferralCode,
          referredById,
          isVerified: true,
        },
      });

      // Create Wallet
      await tx.wallet.create({
        data: {
          userId: userProfile.id,
          currency: "USD",
          availableBalance: new Prisma.Decimal(0),
          pendingBalance: new Prisma.Decimal(0),
          lifetimeEarned: new Prisma.Decimal(0),
          lifetimeWithdrawn: new Prisma.Decimal(0),
        },
      });

      // Create role-specific profiles
      if (role === "WORKER") {
        await tx.workerProfile.create({
          data: {
            userId: userProfile.id,
            firstName: firstName || "Worker",
            lastName: lastName || "",
            level: 1,
            xp: 0,
            reputationScore: new Prisma.Decimal(100),
            accuracyScore: new Prisma.Decimal(100),
            completionScore: new Prisma.Decimal(100),
            reliabilityScore: new Prisma.Decimal(100),
            fraudScore: new Prisma.Decimal(0),
          },
        });
      } else if (role === "BUSINESS") {
        const business = await tx.business.create({
          data: {
            ownerId: userProfile.id,
            name: businessName || "New Enterprise Partner",
            email,
            phone: phone || "",
            country,
            verificationStatus: "PENDING",
          },
        });

        await tx.businessMember.create({
          data: {
            businessId: business.id,
            userId: userProfile.id,
            role: "OWNER",
          },
        });
      }

      // If referred, create Referral record
      if (referredById && referrerProfile) {
        await tx.referral.create({
          data: {
            referrerId: referredById,
            referredUserId: userProfile.id,
            status: "REGISTERED",
            rewardAmount: new Prisma.Decimal(0),
          },
        });
      }

      return userProfile;
    });

    return NextResponse.json({
      success: true,
      message: "Account created successfully.",
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        referralCode: newUser.referralCode,
      },
    });
  } catch (err: any) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred during registration." },
      { status: 500 }
    );
  }
}
