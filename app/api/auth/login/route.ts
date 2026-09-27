import { NextResponse } from "next/server";
import { LoginSchema } from "@/lib/validations";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const result = LoginSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid credentials format", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password } = result.data;
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // In dev fallback mode if mock credentials
      const isPlaceholder = process.env.NEXT_PUBLIC_SUPABASE_URL === "https://placeholder.supabase.co" || !process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (isPlaceholder) {
        const devUser = await prisma.userProfile.findFirst({
          where: { email },
        });

        if (devUser) {
          return NextResponse.json({
            success: true,
            user: {
              id: devUser.id,
              email: devUser.email,
              role: devUser.role,
            },
          });
        }
      }

      return NextResponse.json(
        { error: error.message || "Invalid email or password." },
        { status: 401 }
      );
    }

    const userProfile = await prisma.userProfile.findUnique({
      where: { authUserId: data.user.id },
    });

    if (userProfile?.isSuspended) {
      return NextResponse.json(
        { error: "Your account has been suspended for violating platform policies." },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userProfile?.id,
        email: data.user.email,
        role: userProfile?.role || "WORKER",
      },
    });
  } catch (err: any) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred during login." },
      { status: 500 }
    );
  }
}
