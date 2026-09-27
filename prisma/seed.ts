import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: "Business Verification", slug: "business-verification", description: "Verify African local stores, business signs, physical locations, and operating hours.", icon: "Store" },
  { name: "AI Data Labeling", slug: "ai-data-labeling", description: "Annotate text, bounding boxes, sentiment, and local cultural entities for machine learning models.", icon: "Cpu" },
  { name: "Image Classification", slug: "image-classification", description: "Categorize images of products, receipts, road conditions, and landmarks across Africa.", icon: "Image" },
  { name: "Audio Collection", slug: "audio-collection", description: "Record clear speech samples in African languages and accents (Yoruba, Swahili, Igbo, Hausa, Zulu, Twi).", icon: "Mic" },
  { name: "Transcription", slug: "transcription", description: "Transcribe local audio recordings, voicemails, and interviews into accurate written text.", icon: "FileText" },
  { name: "Translation", slug: "translation", description: "Translate phrases between English, French, Swahili, Yoruba, Hausa, Amharic, and pidgin.", icon: "Languages" },
  { name: "Product Research", slug: "product-research", description: "Survey retail availability, shelf-space, and consumer branding in local neighborhood kiosks.", icon: "Search" },
  { name: "Price Collection", slug: "price-collection", description: "Collect real-time FMCG commodity prices from open-air markets and retail supermarkets.", icon: "TrendingUp" },
  { name: "Website Testing", slug: "website-testing", description: "Test mobile responsiveness, payment gateways, and load speeds on African cellular networks (MTN, Airtel, Safaricom).", icon: "Globe" },
  { name: "Field Verification", slug: "field-verification", description: "On-the-ground verification of real estate, logistics hubs, and infrastructure projects with GPS photos.", icon: "MapPin" },
];

const MISSIONS = [
  {
    title: "Daily Starter: Complete 2 Microtasks",
    description: "Submit 2 legitimate microtasks today to unlock bonus XP.",
    type: "DAILY" as const,
    requirements: { targetCount: 2, action: "SUBMIT_TASK" },
    xpReward: 100,
    cashReward: new Prisma.Decimal("0.10"),
    isActive: true,
  },
  {
    title: "Weekly Champion: 15 High-Accuracy Tasks",
    description: "Achieve at least 95% accuracy on 15 task submissions this week.",
    type: "WEEKLY" as const,
    requirements: { targetCount: 15, minAccuracy: 95 },
    xpReward: 500,
    cashReward: new Prisma.Decimal("1.00"),
    isActive: true,
  },
  {
    title: "African Voice Pioneer",
    description: "Contribute 5 audio recordings in any indigenous African language.",
    type: "CAMPAIGN" as const,
    requirements: { targetCount: 5, category: "audio-collection" },
    xpReward: 300,
    cashReward: new Prisma.Decimal("0.50"),
    isActive: true,
  },
];

async function main() {
  console.log("🌱 Starting AFRIX database seed...");

  // 1. Seed Categories
  console.log("Seeding task categories...");
  const categoryMap = new Map<string, string>();
  for (const cat of CATEGORIES) {
    const record = await prisma.taskCategory.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        isActive: true,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
        isActive: true,
      },
    });
    categoryMap.set(cat.slug, record.id);
  }

  // 2. Seed Missions
  console.log("Seeding missions...");
  for (const m of MISSIONS) {
    const existing = await prisma.mission.findFirst({
      where: { title: m.title },
    });
    if (!existing) {
      await prisma.mission.create({
        data: m,
      });
    }
  }

  // 3. Seed Demo Users (Admin, Business, Workers)
  console.log("Seeding demo profiles...");

  // Admin User
  const adminAuthId = "00000000-0000-0000-0000-000000000001";
  const admin = await prisma.userProfile.upsert({
    where: { authUserId: adminAuthId },
    update: {},
    create: {
      authUserId: adminAuthId,
      email: "admin@afrix.work",
      role: "ADMIN",
      country: "Nigeria",
      referralCode: "AFX-ADMIN",
      isVerified: true,
    },
  });

  // Business User
  const businessAuthId = "00000000-0000-0000-0000-000000000002";
  const businessUser = await prisma.userProfile.upsert({
    where: { authUserId: businessAuthId },
    update: {},
    create: {
      authUserId: businessAuthId,
      email: "partner@kudaresearch.africa",
      role: "BUSINESS",
      country: "Nigeria",
      referralCode: "AFX-BIZ01",
      isVerified: true,
    },
  });

  // Create Business entity
  let business = await prisma.business.findFirst({
    where: { ownerId: businessUser.id },
  });

  if (!business) {
    business = await prisma.business.create({
      data: {
        ownerId: businessUser.id,
        name: "Kuda Market Intelligence",
        legalName: "Kuda Market Intelligence Africa Ltd",
        registrationNumber: "RC-1928472",
        email: "partner@kudaresearch.africa",
        phone: "+2348012345678",
        country: "Nigeria",
        address: "14 Victoria Island, Lagos",
        website: "https://kudaresearch.africa",
        verificationStatus: "VERIFIED",
        description: "Leading consumer insights and retail verification platform in West Africa.",
      },
    });

    await prisma.businessMember.create({
      data: {
        businessId: business.id,
        userId: businessUser.id,
        role: "OWNER",
      },
    });
  }

  // Worker Users
  const workersData = [
    {
      authUserId: "00000000-0000-0000-0000-000000000003",
      email: "chidi.okonkwo@gmail.com",
      firstName: "Chidi",
      lastName: "Okonkwo",
      country: "Nigeria",
      referralCode: "AFX-CHIDI",
      level: 3,
      xp: 3200,
      balance: "48.50",
      lifetimeEarned: "142.50",
      completed: 78,
    },
    {
      authUserId: "00000000-0000-0000-0000-000000000004",
      email: "amina.mwangi@gmail.com",
      firstName: "Amina",
      lastName: "Mwangi",
      country: "Kenya",
      referralCode: "AFX-AMINA",
      level: 4,
      xp: 11400,
      balance: "92.00",
      lifetimeEarned: "385.00",
      completed: 210,
    },
    {
      authUserId: "00000000-0000-0000-0000-000000000005",
      email: "kwame.mensah@gmail.com",
      firstName: "Kwame",
      lastName: "Mensah",
      country: "Ghana",
      referralCode: "AFX-KWAME",
      level: 2,
      xp: 850,
      balance: "14.20",
      lifetimeEarned: "29.20",
      completed: 19,
    },
  ];

  for (const w of workersData) {
    const user = await prisma.userProfile.upsert({
      where: { authUserId: w.authUserId },
      update: {},
      create: {
        authUserId: w.authUserId,
        email: w.email,
        role: "WORKER",
        country: w.country,
        referralCode: w.referralCode,
        isVerified: true,
      },
    });

    await prisma.workerProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        firstName: w.firstName,
        lastName: w.lastName,
        level: w.level,
        xp: w.xp,
        reputationScore: new Prisma.Decimal("98.50"),
        accuracyScore: new Prisma.Decimal("97.20"),
        completionScore: new Prisma.Decimal("99.00"),
        reliabilityScore: new Prisma.Decimal("98.00"),
        tasksCompleted: w.completed,
        totalEarned: new Prisma.Decimal(w.lifetimeEarned),
        kycStatus: "VERIFIED",
      },
    });

    const wallet = await prisma.wallet.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        availableBalance: new Prisma.Decimal(w.balance),
        pendingBalance: new Prisma.Decimal("0.00"),
        lifetimeEarned: new Prisma.Decimal(w.lifetimeEarned),
        lifetimeWithdrawn: new Prisma.Decimal(new Prisma.Decimal(w.lifetimeEarned).minus(new Prisma.Decimal(w.balance))),
      },
    });

    // Seed sample initial transaction in ledger
    const existingTx = await prisma.ledgerTransaction.findFirst({
      where: { walletId: wallet.id },
    });
    if (!existingTx) {
      await prisma.ledgerTransaction.create({
        data: {
          walletId: wallet.id,
          transactionType: "BONUS",
          amount: new Prisma.Decimal(w.balance),
          direction: "CREDIT",
          reference: `welcome_bonus:${user.id}`,
          description: "Welcome worker starter earnings balance",
          status: "COMPLETED",
        },
      });
    }
  }

  // 4. Seed Campaigns & Tasks
  console.log("Seeding campaigns and tasks...");
  const bizVerificationCatId = categoryMap.get("business-verification")!;
  const imgClassCatId = categoryMap.get("image-classification")!;
  const audioCatId = categoryMap.get("audio-collection")!;
  const webTestingCatId = categoryMap.get("website-testing")!;

  // Campaign 1: Lagos Retail Audit
  let campaign1 = await prisma.campaign.findFirst({
    where: { name: "West Africa FMCG Retail Audit" },
  });

  if (!campaign1 && business) {
    campaign1 = await prisma.campaign.create({
      data: {
        businessId: business.id,
        name: "West Africa FMCG Retail Audit",
        description: "On-the-ground store verification and shelf price collection for fast-moving consumer goods.",
        categoryId: bizVerificationCatId,
        country: "Nigeria",
        totalTasks: 500,
        completedTasks: 142,
        approvedTasks: 138,
        rejectedTasks: 4,
        budget: new Prisma.Decimal("500.00"),
        amountSpent: new Prisma.Decimal("125.00"),
        amountReserved: new Prisma.Decimal("375.00"),
        status: "ACTIVE",
      },
    });

    // Task 1: Verify a Local Business
    const task1 = await prisma.task.create({
      data: {
        campaignId: campaign1.id,
        categoryId: bizVerificationCatId,
        title: "Verify a Local Business",
        description: "Locate a neighbourhood pharmacy or kiosk, verify their open status, and take a photo of the exterior signboard.",
        instructions: "1. Approach the store during daylight.\n2. Ensure the business signboard is clearly legible in the camera frame.\n3. Verify the store name and operating hours with the attendant.\n4. Submit with GPS location enabled.",
        rewardAmount: new Prisma.Decimal("0.15"),
        currency: "USD",
        maxSubmissions: 200,
        completedSubmissions: 78,
        requiredLevel: 1,
        requiresLocation: true,
        requiresPhoto: true,
        validationType: "MANUAL",
        status: "ACTIVE",
      },
    });

    await prisma.taskQuestion.createMany({
      data: [
        {
          taskId: task1.id,
          question: "What is the exact store name displayed on the sign?",
          questionType: "TEXT",
          isRequired: true,
          sortOrder: 1,
        },
        {
          taskId: task1.id,
          question: "Is the store open and operating at this moment?",
          questionType: "SINGLE_CHOICE",
          options: ["Yes, Open", "Temporarily Closed", "Permanently Closed"],
          isRequired: true,
          sortOrder: 2,
        },
        {
          taskId: task1.id,
          question: "Take a clear photo of the store front showing the signage.",
          questionType: "IMAGE",
          isRequired: true,
          sortOrder: 3,
        },
      ],
    });
  }

  // Campaign 2: African AI Data Collection
  let campaign2 = await prisma.campaign.findFirst({
    where: { name: "Pan-African AI Voice & Vision Dataset" },
  });

  if (!campaign2 && business) {
    campaign2 = await prisma.campaign.create({
      data: {
        businessId: business.id,
        name: "Pan-African AI Voice & Vision Dataset",
        description: "Collecting localized datasets for African language LLMs and image recognition models.",
        categoryId: audioCatId,
        country: "All Africa",
        totalTasks: 1000,
        completedTasks: 350,
        approvedTasks: 340,
        rejectedTasks: 10,
        budget: new Prisma.Decimal("800.00"),
        amountSpent: new Prisma.Decimal("280.00"),
        amountReserved: new Prisma.Decimal("520.00"),
        status: "ACTIVE",
      },
    });

    // Task 2: Classify an Image
    const task2 = await prisma.task.create({
      data: {
        campaignId: campaign2.id,
        categoryId: imgClassCatId,
        title: "Classify an Image",
        description: "View an image of road conditions or storefronts and categorize the primary object displayed.",
        instructions: "Look closely at the image displayed. Select the single best matching category. Submissions are checked for consistency.",
        rewardAmount: new Prisma.Decimal("0.08"),
        currency: "USD",
        maxSubmissions: 300,
        completedSubmissions: 120,
        requiredLevel: 1,
        validationType: "AUTOMATIC",
        status: "ACTIVE",
      },
    });

    await prisma.taskQuestion.createMany({
      data: [
        {
          taskId: task2.id,
          question: "What is the primary category depicted in this image?",
          questionType: "SINGLE_CHOICE",
          options: ["Road Infrastructure", "Retail Storefront", "Vehicular Traffic", "Informal Market"],
          isRequired: true,
          sortOrder: 1,
        },
        {
          taskId: task2.id,
          question: "Rate image clarity and quality from 1 to 5.",
          questionType: "NUMBER",
          isRequired: true,
          sortOrder: 2,
        },
      ],
    });

    // Task 3: Record a Nigerian Phrase
    const task3 = await prisma.task.create({
      data: {
        campaignId: campaign2.id,
        categoryId: audioCatId,
        title: "Record a Nigerian Phrase",
        description: "Read aloud a short prompt in Nigerian English, Pidgin, or Yoruba in a quiet room.",
        instructions: "Read the sentence clearly without background music or traffic noise. Keep your phone 15cm from your mouth.",
        rewardAmount: new Prisma.Decimal("0.35"),
        currency: "USD",
        maxSubmissions: 250,
        completedSubmissions: 95,
        requiredLevel: 2,
        requiresAudio: true,
        validationType: "MANUAL",
        status: "ACTIVE",
      },
    });

    await prisma.taskQuestion.createMany({
      data: [
        {
          taskId: task3.id,
          question: "Please record audio reading: 'How much be the total money wey I dey owe for this light bill?'",
          questionType: "AUDIO",
          isRequired: true,
          sortOrder: 1,
        },
      ],
    });

    // Task 4: Test a Website
    const task4 = await prisma.task.create({
      data: {
        campaignId: campaign2.id,
        categoryId: webTestingCatId,
        title: "Test a Website",
        description: "Visit a regional fintech checkout page, attempt a test transaction, and report page responsiveness and any bugs.",
        instructions: "Visit the specified staging URL on your mobile browser. Attempt to initiate a test payment and submit a screenshot of the confirmation page.",
        rewardAmount: new Prisma.Decimal("1.20"),
        currency: "USD",
        maxSubmissions: 50,
        completedSubmissions: 22,
        requiredLevel: 3,
        requiresPhoto: true,
        validationType: "MANUAL",
        status: "ACTIVE",
      },
    });

    await prisma.taskQuestion.createMany({
      data: [
        {
          taskId: task4.id,
          question: "Did the checkout page load in less than 3 seconds on your connection?",
          questionType: "BOOLEAN",
          isRequired: true,
          sortOrder: 1,
        },
        {
          taskId: task4.id,
          question: "Which cellular mobile carrier did you test on?",
          questionType: "SINGLE_CHOICE",
          options: ["MTN", "Airtel", "Safaricom", "Glo", "Vodacom", "WiFi"],
          isRequired: true,
          sortOrder: 2,
        },
        {
          taskId: task4.id,
          question: "Upload screenshot of the completed payment confirmation screen.",
          questionType: "IMAGE",
          isRequired: true,
          sortOrder: 3,
        },
        {
          taskId: task4.id,
          question: "Describe any usability issues, lag, or layout bugs observed.",
          questionType: "TEXT",
          isRequired: false,
          sortOrder: 4,
        },
      ],
    });
  }

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
