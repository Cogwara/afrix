import { UserRole } from "@prisma/client";
import { createClient } from "../supabase/server";
import { prisma } from "../prisma";

export interface AuthenticatedUser {
  authUserId: string;
  email: string;
  profile: {
    id: string;
    authUserId: string;
    email: string;
    phone: string | null;
    role: UserRole;
    country: string;
    state: string | null;
    city: string | null;
    referralCode: string;
    isVerified: boolean;
    isSuspended: boolean;
  };
  workerProfile?: {
    id: string;
    firstName: string;
    lastName: string;
    level: number;
    xp: number;
    reputationScore: number;
    kycStatus: string;
  } | null;
  business?: {
    id: string;
    name: string;
    verificationStatus: string;
  } | null;
}

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      // In dev or when testing without real supabase credentials, check if we have a demo cookie or header
      return null;
    }

    const profile = await prisma.userProfile.findUnique({
      where: { authUserId: user.id },
      include: {
        workerProfile: true,
        businesses: { take: 1 },
      },
    });

    if (!profile) return null;

    return {
      authUserId: user.id,
      email: user.email || profile.email,
      profile: {
        id: profile.id,
        authUserId: profile.authUserId,
        email: profile.email,
        phone: profile.phone,
        role: profile.role,
        country: profile.country,
        state: profile.state,
        city: profile.city,
        referralCode: profile.referralCode,
        isVerified: profile.isVerified,
        isSuspended: profile.isSuspended,
      },
      workerProfile: profile.workerProfile ? {
        id: profile.workerProfile.id,
        firstName: profile.workerProfile.firstName,
        lastName: profile.workerProfile.lastName,
        level: profile.workerProfile.level,
        xp: profile.workerProfile.xp,
        reputationScore: Number(profile.workerProfile.reputationScore),
        kycStatus: profile.workerProfile.kycStatus,
      } : null,
      business: profile.businesses?.[0] ? {
        id: profile.businesses[0].id,
        name: profile.businesses[0].name,
        verificationStatus: profile.businesses[0].verificationStatus,
      } : null,
    };
  } catch (err) {
    console.error("Error getting current user:", err);
    return null;
  }
}

export async function requireUser(allowedRoles?: UserRole[]): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized: Please log in to continue");
  }

  if (user.profile.isSuspended) {
    throw new Error("Forbidden: This account has been suspended for violating platform policies");
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.profile.role)) {
    throw new Error(`Forbidden: Access denied. Required role: ${allowedRoles.join(" or ")}`);
  }

  return user;
}
