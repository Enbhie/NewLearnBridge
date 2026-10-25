import {createHash, randomBytes, randomInt, timingSafeEqual} from "node:crypto";
import {getApps, initializeApp} from "firebase-admin/app";
import {getFirestore, Timestamp} from "firebase-admin/firestore";
import {getStorage} from "firebase-admin/storage";
import {getDatabase} from "firebase-admin/database";
import {defineSecret, defineString} from "firebase-functions/params";
import {HttpsError, onCall, onRequest} from "firebase-functions/v2/https";
import {logger} from "firebase-functions";
import {v2 as cloudinary} from "cloudinary";

initializeApp();

const db = getFirestore();
const bucket = getStorage().bucket();
const region = "us-central1";
const maxPhotoBytes = 5 * 1024 * 1024;
const reviewPinLifetimeMs = 24 * 60 * 60 * 1000;
const maxReviewPinAttempts = 5;
const resendApiKey = defineSecret("RESEND_API_KEY");
const cloudinaryApiSecret = defineSecret("CLOUDINARY_API_SECRET");
const missionEmailFrom = defineString("MISSION_EMAIL_FROM");
const missionReviewBaseUrl = defineString("MISSION_REVIEW_BASE_URL", {
  default: "",
});
const cloudinaryCloudName = defineString("CLOUDINARY_CLOUD_NAME");
const cloudinaryApiKey = defineString("CLOUDINARY_API_KEY");
const firebaseDatabaseUrl = defineString("FIREBASE_DATABASE_URL");

function configureCloudinary(): void {
  cloudinary.config({
    cloud_name: cloudinaryCloudName.value(),
    api_key: cloudinaryApiKey.value(),
    api_secret: cloudinaryApiSecret.value(),
    secure: true,
  });
}

function getRealtimeDatabase() {
  const appName = "mission-review-database";
  const app =
    getApps().find((candidate) => candidate.name === appName) ??
    initializeApp(
      {databaseURL: firebaseDatabaseUrl.value()},
      appName
    );
  return getDatabase(app);
}

async function getCloudinaryReviewUrl(submission: Record<string, unknown>): Promise<string> {
  const uid = typeof submission.uid === "string" ? submission.uid : "";
  const submissionId = typeof submission.id === "string" ? submission.id : "";
  const databaseSubmissionId = typeof submission.databaseSubmissionId === "string" ?
    submission.databaseSubmissionId :
    "";
  if (!uid || !submissionId) {
    throw new Error("Mission owner details are missing.");
  }
  const databasePath = databaseSubmissionId ?
    `submissions/${uid}/${databaseSubmissionId}/imageUrl` :
    `missionSubmissions/${uid}/${submissionId}/secureUrl`;
  const snapshot = await getRealtimeDatabase()
    .ref(databasePath)
    .get();
  const secureUrl = snapshot.val();
  if (
    typeof secureUrl !== "string" ||
    !secureUrl.startsWith(`https://res.cloudinary.com/${cloudinaryCloudName.value()}/image/upload/`)
  ) {
    throw new Error("The Cloudinary mission photo URL is unavailable.");
  }
  return secureUrl;
}

async function updateDatabaseSubmissionStatus(
  submission: Record<string, unknown>,
  status: "approved" | "rejected"
): Promise<void> {
  const uid = typeof submission.uid === "string" ? submission.uid : "";
  const databaseSubmissionId = typeof submission.databaseSubmissionId === "string" ?
    submission.databaseSubmissionId :
    "";
  if (!uid || !databaseSubmissionId) return;
  await getRealtimeDatabase()
    .ref(`submissions/${uid}/${databaseSubmissionId}/status`)
    .set(status);
}

async function deleteMissionPhoto(submission: Record<string, unknown>): Promise<void> {
  if (submission.storageProvider === "cloudinary") {
    const publicId =
      typeof submission.cloudinaryPublicId === "string" ?
        submission.cloudinaryPublicId :
        "";
    const uid = typeof submission.uid === "string" ? submission.uid : "";
    const submissionId = typeof submission.id === "string" ? submission.id : "";
    const cleanupTasks: Promise<unknown>[] = [];
    if (publicId) {
      configureCloudinary();
      cleanupTasks.push(
        cloudinary.uploader.destroy(publicId, {
          resource_type: "image",
          type: "upload",
          invalidate: true,
        })
      );
    }
    if (uid && submissionId) {
      cleanupTasks.push(
        getRealtimeDatabase()
          .ref(`missionSubmissions/${uid}/${submissionId}`)
          .remove()
      );
    }
    if (uid && typeof submission.databaseSubmissionId === "string") {
      cleanupTasks.push(
        getRealtimeDatabase()
          .ref(`submissions/${uid}/${submission.databaseSubmissionId}/imageUrl`)
          .remove()
      );
    }
    const cleanupResults = await Promise.allSettled(cleanupTasks);
    const cleanupErrors = cleanupResults
      .filter((result): result is PromiseRejectedResult => result.status === "rejected")
      .map((result) => result.reason);
    if (cleanupErrors.length > 0) {
      logger.warn("Cloudinary mission photo cleanup had failures", {
        cleanupErrors,
      });
      throw new Error("Could not fully delete the mission photo.");
    }
    return;
  }
  if (typeof submission.storagePath === "string") {
    await bucket.file(submission.storagePath).delete({ignoreNotFound: true});
  }
}

const missionDetails: Record<string, { title: string; parentCheck: string }> = {
  "K-3": {
    title: "Count the Items",
    parentCheck:
      "Check that the photo shows 10 items and confirm the count with your child.",
  },
  "K-4": {
    title: "First Letter",
    parentCheck:
      "Look at the three objects in the photo and ask your child to name each one and its first letter.",
  },
  "K-5": {
    title: "Letter Tracing",
    parentCheck:
      "Look at the photo and confirm your child's first name is traced on the paper.",
  },
  "G1-2": {
    title: "Savings Count",
    parentCheck: "Written total is correct.",
  },
  "G1-3": {
    title: "Living or Non-Living",
    parentCheck: "Sorting of all 10 items is correct.",
  },
  "G1-5": {
    title: "Day and Night",
    parentCheck: "Drawing has both morning and night parts.",
  },
  "G1-7": {
    title: "Parts of Speech Hunt",
    parentCheck: "All words are placed in the correct categories.",
  },
  "G2-2": {
    title: "Savings Challenge",
    parentCheck: "Daily totals are added correctly.",
  },
  "G2-4": {
    title: "Living or Non-Living: Advanced",
    parentCheck: "Sorting and explanation are both correct.",
  },
  "G2-6": {
    title: "Day-Night Journal",
    parentCheck: "4 activities total, correctly split morning/night.",
  },
  "G2-7": {
    title: "Weather Tracker",
    parentCheck: "All 3 days logged, child explains each.",
  },
  "G2-8": {
    title: "Words at Home Hunt",
    parentCheck: "Words correctly categorized, child uses one in a sentence.",
  },
  "G2-9": {
    title: "Simple Sentence",
    parentCheck: "Sentences make sense, adjective identified.",
  },
  "G2-10": {
    title: "Story Timeline",
    parentCheck:
      "The three events are placed in a sensible order and the child retells the story.",
  },
  "G2-11": {
    title: "Clue Detective",
    parentCheck:
      "The child points to story details that identify the character and setting.",
  },
  "G2-12": {
    title: "Feelings in a Story",
    parentCheck:
      "The child names the feeling and explains which words or events gave the clue.",
  },
  "G2-13": {
    title: "Build a Number",
    parentCheck:
      "The model has the right number of hundreds, tens, and ones and matches the number.",
  },
  "G2-14": {
    title: "Array Garden",
    parentCheck: "The drawing has 3 rows of 4 flowers and the total is 12.",
  },
  "G2-15": {
    title: "Pretend Snack Shop",
    parentCheck:
      "The child counts the pretend money and explains how it totals ₱25.",
  },
  "G2-16": {
    title: "Living Things Sort",
    parentCheck:
      "The child sorts both examples correctly and gives one reason for each.",
  },
  "G2-17": {
    title: "Water State Watch",
    parentCheck:
      "The child labels solid, liquid, and gas and gives a safe everyday example.",
  },
  "G2-18": {
    title: "Day and Night Sky",
    parentCheck:
      "The child places the Sun in the day sky and the Moon or stars in the night sky.",
  },
  "G3-1": {
    title: "Sharing Rice Cake",
    parentCheck: "Child shows and explains each fraction correctly.",
  },
  "G3-3": {
    title: "Equal Division",
    parentCheck: "Each person receives the same amount.",
  },
  "G3-4": {
    title: "Order of Operations Card",
    parentCheck: "Working shown and answers are correct.",
  },
  "G3-5": {
    title: "Calendar Detective",
    parentCheck: "Counting is correct.",
  },
  "G3-6": {
    title: "Roman Numeral Hunt",
    parentCheck: "Child reads them correctly.",
  },
  "G3-7": {
    title: "Food Chain Draw",
    parentCheck: "Labels are correct.",
  },
  "G3-8": {
    title: "Short Paragraph",
    parentCheck: "Paragraph is read and signed off.",
  },
};

type SubmissionStatus =
  | "pending"
  | "approved"
  | "needs_revision"
  | "email_failed";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function reviewBaseUrl(): string {
  const configured = missionReviewBaseUrl.value().trim();
  if (configured) return configured.replace(/\/+$/, "");
  const projectId = process.env.GCLOUD_PROJECT;
  if (!projectId) throw new Error("Firebase project ID is unavailable.");
  return `https://${region}-${projectId}.cloudfunctions.net/reviewMissionSubmission`;
}

async function sendParentEmail(input: {
  to: string;
  missionTitle: string;
  parentCheck: string;
  reviewUrl: string;
  reviewPin: string;
  submissionId: string;
}): Promise<void> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${resendApiKey.value()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: missionEmailFrom.value(),
      to: [input.to],
      subject: `Mission ready for review: ${input.missionTitle}`,
      text: [
        `Your child submitted "${input.missionTitle}" for review.`,
        input.parentCheck,
        `Review and confirm the mission: ${input.reviewUrl}`,
        `Review PIN: ${input.reviewPin}`,
        "The PIN expires in 24 hours and is required to view the photo.",
      ].join("\n\n"),
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#173b53">
        <h1>Mission ready for review</h1>
        <h2>${escapeHtml(input.missionTitle)}</h2>
        <p>${escapeHtml(input.parentCheck)}</p>
        <p>Open the private review link, then enter this PIN to view the photo:</p>
        <p style="font-size:24px;font-weight:bold;letter-spacing:4px">${escapeHtml(input.reviewPin)}</p>
        <p><a href="${escapeHtml(input.reviewUrl)}" style="display:inline-block;background:#397147;color:white;padding:14px 20px;border-radius:8px;text-decoration:none;font-weight:bold">Review this mission</a></p>
        <p style="font-size:12px;color:#667">The PIN expires in 24 hours and is required to view the photo. The link and PIN are for the parent or guardian only.</p>
      </div>`,
    }),
  });

  if (!response.ok) {
    const responseText = await response.text();
    logger.error("Mission review email delivery failed", {
      status: response.status,
      response: responseText.slice(0, 1000),
      submissionId: input.submissionId,
    });
    throw new Error("The parent review email could not be delivered.");
  }
}

export const submitMissionForReview = onCall(
  {
    region,
    memory: "512MiB",
    timeoutSeconds: 60,
    secrets: [resendApiKey, cloudinaryApiSecret],
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Sign in before sending a mission for review.");
    }
    if (request.auth.token.email_verified !== true) {
      throw new HttpsError(
        "failed-precondition",
        "Verify the parent email before sending a mission for review."
      );
    }

    const data = request.data as {
      missionId?: unknown;
      submissionId?: unknown;
      storageProvider?: unknown;
      storagePath?: unknown;
      cloudinaryPublicId?: unknown;
      cloudinarySecureUrl?: unknown;
      databaseSubmissionId?: unknown;
      submittedAt?: unknown;
    };
    const missionId = typeof data.missionId === "string" ? data.missionId : "";
    const submissionId =
      typeof data.submissionId === "string" ? data.submissionId : "";
    const storagePath =
      typeof data.storagePath === "string" ? data.storagePath : "";
    const storageProvider =
      data.storageProvider === "cloudinary" ? "cloudinary" : "firebase";
    const cloudinaryPublicId =
      typeof data.cloudinaryPublicId === "string" ? data.cloudinaryPublicId : "";
    const cloudinarySecureUrl =
      typeof data.cloudinarySecureUrl === "string" ? data.cloudinarySecureUrl : "";
    const databaseSubmissionId =
      typeof data.databaseSubmissionId === "string" ? data.databaseSubmissionId : "";
    const submittedAt =
      typeof data.submittedAt === "string" &&
      Number.isFinite(Date.parse(data.submittedAt)) ?
        Timestamp.fromDate(new Date(data.submittedAt)) :
        Timestamp.now();
    const mission = missionDetails[missionId];

    if (!mission) {
      throw new HttpsError("invalid-argument", "This mission cannot be sent for photo review.");
    }
    if (!/^[A-Za-z0-9_-]{20,64}$/.test(submissionId)) {
      throw new HttpsError("invalid-argument", "The mission submission ID is invalid.");
    }
    if (
      databaseSubmissionId &&
      !/^[A-Za-z0-9_-]{20,64}$/.test(databaseSubmissionId)
    ) {
      throw new HttpsError(
        "invalid-argument",
        "The Realtime Database submission ID is invalid."
      );
    }
    const expectedPath = `mission-submissions/${request.auth.uid}/${submissionId}/evidence`;
    const expectedCloudinaryId =
      `mission-submissions/${request.auth.uid}/${submissionId}`;
    if (
      (storageProvider === "firebase" && storagePath !== expectedPath) ||
      (storageProvider === "cloudinary" &&
        (cloudinaryPublicId !== expectedCloudinaryId ||
          !cloudinarySecureUrl.startsWith(
            `https://res.cloudinary.com/${cloudinaryCloudName.value()}/image/upload/`
          )))
    ) {
      throw new HttpsError(
        "permission-denied",
        "The uploaded photo does not belong to this account."
      );
    }

    const parentEmail =
      typeof request.auth.token.email === "string" ?
        request.auth.token.email.trim() :
        "";
    if (!parentEmail) {
      throw new HttpsError(
        "failed-precondition",
        "Add a parent email address to the account before sending a mission."
      );
    }

    let size: number;
    let contentType: string;
    if (storageProvider === "cloudinary") {
      configureCloudinary();
      const databasePath = databaseSubmissionId ?
        `submissions/${request.auth.uid}/${databaseSubmissionId}` :
        `missionSubmissions/${request.auth.uid}/${submissionId}`;
      const databaseRecord = await getRealtimeDatabase().ref(databasePath).get();
      const record = databaseRecord.val() as
        | {
            missionId?: unknown;
            imageUrl?: unknown;
            secureUrl?: unknown;
            status?: unknown;
          }
        | null;
      const validDatabaseRecord = databaseSubmissionId ?
        record?.missionId === missionId &&
          record.imageUrl === cloudinarySecureUrl &&
          record.status === "pending" :
        record?.secureUrl === cloudinarySecureUrl;
      if (!validDatabaseRecord) {
        throw new HttpsError(
          "permission-denied",
          "The uploaded photo URL and pending submission are not saved to this account."
        );
      }
      let resource: Awaited<ReturnType<typeof cloudinary.api.resource>>;
      try {
        resource = await cloudinary.api.resource(cloudinaryPublicId, {
          resource_type: "image",
          type: "upload",
          context: true,
        });
      } catch (error) {
        logger.warn("Could not verify uploaded Cloudinary mission photo", {
          submissionId,
          error,
        });
        throw new HttpsError(
          "not-found",
          "The mission photo could not be found. Please choose it again."
        );
      }
      size = Number(resource.bytes ?? 0);
      const format = typeof resource.format === "string" ? resource.format : "";
      contentType = format === "jpg" || format === "jpeg" ?
        "image/jpeg" :
        `image/${format}`;
      if (
        resource.public_id !== expectedCloudinaryId ||
        resource.type !== "upload" ||
        resource.secure_url !== cloudinarySecureUrl ||
        resource.context?.custom?.owner_uid !== request.auth.uid ||
        resource.context?.custom?.submission_id !== submissionId
      ) {
        throw new HttpsError(
          "permission-denied",
          "The uploaded photo does not belong to this account."
        );
      }
    } else {
      const photoFile = bucket.file(storagePath);
      const [metadata] = await photoFile.getMetadata().catch(() => {
        throw new HttpsError(
          "not-found",
          "The mission photo could not be found. Please choose it again."
        );
      });
      size = Number(metadata.size ?? 0);
      contentType = metadata.contentType ?? "";
      if (
        metadata.metadata?.ownerUid !== request.auth.uid ||
        metadata.metadata?.submissionId !== submissionId
      ) {
        throw new HttpsError(
          "permission-denied",
          "The uploaded photo does not belong to this account."
        );
      }
    }
    if (
      size <= 0 ||
      size > maxPhotoBytes ||
      !/^image\/(jpeg|jpg|png|webp|heic|heif)$/.test(contentType)
    ) {
      throw new HttpsError(
        "invalid-argument",
        "The photo must be a supported image smaller than 5 MB."
      );
    }

    const submissionRef = db.collection("missionSubmissions").doc(submissionId);
    const lockRef = db.collection("missionReviewLocks").doc(request.auth.uid);
    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");
    const reviewPin = randomInt(0, 1_000_000).toString().padStart(6, "0");
    const pinHash = createHash("sha256")
      .update(`${rawToken}:${reviewPin}`)
      .digest("hex");
    const tokenRef = db.collection("missionReviewTokens").doc(tokenHash);
    const createdAt = Timestamp.now();
    const expiresAt = Timestamp.fromMillis(
      createdAt.toMillis() + reviewPinLifetimeMs
    );
    let shouldSendEmail = false;

    await db.runTransaction(async (transaction) => {
      const [submission, lock] = await Promise.all([
        transaction.get(submissionRef),
        transaction.get(lockRef),
      ]);
      if (submission.exists) {
        const existing = submission.data();
        if (existing?.uid !== request.auth!.uid || existing?.missionId !== missionId) {
          throw new HttpsError(
            "permission-denied",
            "This submission ID is already associated with another submission."
          );
        }
        if (existing.status !== "email_failed") return;
        if (lock.exists) {
          throw new HttpsError(
            "failed-precondition",
            "A mission is already waiting for your parent. Finish that review first."
          );
        }
        transaction.update(submissionRef, {
          parentEmail,
          status: "pending" satisfies SubmissionStatus,
          updatedAt: createdAt,
          storagePath,
          storageProvider,
          cloudinaryPublicId,
          ...(databaseSubmissionId ? {databaseSubmissionId} : {}),
          clientSubmittedAt: submittedAt,
        });
      } else {
        if (lock.exists) {
          throw new HttpsError(
            "failed-precondition",
            "A mission is already waiting for your parent. Finish that review first."
          );
        }
        transaction.create(submissionRef, {
          uid: request.auth!.uid,
          id: submissionId,
          missionId,
          title: mission.title,
          parentCheck: mission.parentCheck,
          parentEmail,
          status: "pending" satisfies SubmissionStatus,
          createdAt,
          updatedAt: createdAt,
          clientSubmittedAt: submittedAt,
          storagePath,
          storageProvider,
          cloudinaryPublicId,
          ...(databaseSubmissionId ? {databaseSubmissionId} : {}),
        });
      }
      transaction.create(lockRef, {
        submissionId,
        tokenHash,
        createdAt,
      });
      transaction.create(tokenRef, {
        submissionId,
        pinHash,
        pinAttempts: 0,
        expiresAt,
        createdAt,
      });
      shouldSendEmail = true;
    });

    if (!shouldSendEmail) return {status: "pending" as const};

    try {
      const tokenUrl = `${reviewBaseUrl()}?token=${encodeURIComponent(rawToken)}`;
      await sendParentEmail({
        to: parentEmail,
        missionTitle: mission.title,
        parentCheck: mission.parentCheck,
        reviewUrl: tokenUrl,
        reviewPin,
        submissionId,
      });
      return {status: "pending" as const};
    } catch (error) {
      logger.error("Could not create mission review email", {
        submissionId,
        error,
      });
      await db.runTransaction(async (transaction) => {
        const [submission, lock] = await Promise.all([
          transaction.get(submissionRef),
          transaction.get(lockRef),
        ]);
        if (submission.exists && submission.data()?.status === "pending") {
          transaction.update(submissionRef, {
            status: "email_failed" satisfies SubmissionStatus,
            updatedAt: Timestamp.now(),
          });
        }
        if (lock.exists && lock.data()?.submissionId === submissionId) {
          transaction.delete(lockRef);
        }
        transaction.delete(tokenRef);
      });
      throw new HttpsError(
        "internal",
        "Could not email the mission to the parent. Please try again."
      );
    }
  }
);

function renderPage(title: string, body: string): string {
  return `<!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="referrer" content="no-referrer" />
      <title>${escapeHtml(title)} · LearnBridge</title>
      <style>
        body{font-family:Arial,sans-serif;background:#eaf5f7;color:#173b53;margin:0;padding:24px}
        main{max-width:640px;margin:24px auto;background:#fff;border-radius:18px;padding:24px;box-shadow:0 4px 18px #173b5320}
        h1{margin-top:0}img{display:block;width:100%;max-height:60vh;object-fit:contain;background:#f5f8f8;border-radius:12px}
        .criterion{background:#fff4ce;border-radius:12px;padding:14px;line-height:1.5}
        button{border:0;border-radius:10px;padding:14px 18px;color:#fff;font-size:15px;font-weight:bold;cursor:pointer}
        .approve{background:#397147}.retry{background:#c76e29}.actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:18px}
        .muted{color:#526778;line-height:1.5}
      </style>
    </head>
    <body><main>${body}</main></body>
  </html>`;
}

function renderPinEntryPage(message = ""): string {
  return renderPage(
    "Unlock parent mission review",
    `<h1>Parent review PIN</h1>
    <p class="muted">Enter the 6-digit PIN sent to your email. It expires 24 hours after it was sent.</p>
    ${message ? `<p class="criterion">${escapeHtml(message)}</p>` : ""}
    <form method="post">
      <label for="pin">6-digit PIN</label>
      <input id="pin" name="pin" type="text" inputmode="numeric" autocomplete="one-time-code"
        pattern="[0-9]{6}" maxlength="6" required autofocus />
      <div class="actions"><button class="approve" type="submit" name="action" value="unlock">Unlock photo and review</button></div>
    </form>`
  );
}

function pinMatches(rawToken: string, submittedPin: string, expectedHash: unknown): boolean {
  if (
    !/^\d{6}$/.test(submittedPin) ||
    typeof expectedHash !== "string" ||
    !/^[a-f0-9]{64}$/.test(expectedHash)
  ) {
    return false;
  }
  const actualHash = createHash("sha256")
    .update(`${rawToken}:${submittedPin}`)
    .digest();
  return timingSafeEqual(actualHash, Buffer.from(expectedHash, "hex"));
}

export const reviewMissionSubmission = onRequest(
  {
    region,
    memory: "512MiB",
    timeoutSeconds: 30,
    secrets: [cloudinaryApiSecret],
  },
  async (request, response) => {
    response.set("Cache-Control", "no-store");
    response.set("Referrer-Policy", "no-referrer");
    response.set("X-Content-Type-Options", "nosniff");
    response.set(
      "Content-Security-Policy",
      "default-src 'none'; img-src https:; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'"
    );

    const rawToken =
      typeof request.query.token === "string" ? request.query.token : "";
    if (!/^[a-f0-9]{64}$/.test(rawToken)) {
      response.status(404).send(
        renderPage(
          "Review link unavailable",
          "<h1>Review link unavailable</h1><p class=\"muted\">This private link is invalid. Ask your child to send the mission again.</p>"
        )
      );
      return;
    }

    const tokenHash = createHash("sha256").update(rawToken).digest("hex");
    const tokenRef = db.collection("missionReviewTokens").doc(tokenHash);
    const tokenSnapshot = await tokenRef.get();
    if (!tokenSnapshot.exists) {
      response.status(404).send(
        renderPage(
          "Review link unavailable",
          "<h1>Review link unavailable</h1><p class=\"muted\">This private link has expired or was already used.</p>"
        )
      );
      return;
    }

    const tokenData = tokenSnapshot.data()!;
    const submissionId = tokenData.submissionId;
    if (typeof submissionId !== "string") {
      response.status(404).send(
        renderPage(
          "Review link unavailable",
          "<h1>Review link unavailable</h1><p class=\"muted\">This private link is incomplete.</p>"
        )
      );
      return;
    }
    const submissionRef = db.collection("missionSubmissions").doc(submissionId);
    const submissionSnapshot = await submissionRef.get();
    if (!submissionSnapshot.exists) {
      response.status(404).send(
        renderPage(
          "Review link unavailable",
          "<h1>Review link unavailable</h1><p class=\"muted\">This mission submission is no longer available.</p>"
        )
      );
      return;
    }

    const submission = submissionSnapshot.data()!;
    submission.id = submissionId;
    if (submission.status !== "pending") {
      response.status(200).send(
        renderPage(
          "Mission already reviewed",
          `<h1>Mission already reviewed</h1><p class="muted">${escapeHtml(String(submission.title ?? "This mission"))} has already received a decision. Your child will see the result in LearnBridge.</p>`
        )
      );
      return;
    }

    const expiresAt = tokenData.expiresAt;
    if (!(expiresAt instanceof Timestamp) || expiresAt.toMillis() <= Date.now()) {
      const lockRef = db.collection("missionReviewLocks").doc(String(submission.uid));
      await db.runTransaction(async (transaction) => {
        const [currentSubmission, currentToken, lock] = await Promise.all([
          transaction.get(submissionRef),
          transaction.get(tokenRef),
          transaction.get(lockRef),
        ]);
        if (currentSubmission.exists && currentSubmission.data()?.status === "pending") {
          transaction.update(submissionRef, {
            status: "needs_revision" satisfies SubmissionStatus,
            updatedAt: Timestamp.now(),
          });
        }
        if (lock.exists && lock.data()?.tokenHash === tokenHash) {
          transaction.delete(lockRef);
        }
        if (currentToken.exists) transaction.delete(tokenRef);
      });
      await updateDatabaseSubmissionStatus(submission, "rejected").catch((error) =>
        logger.warn("Could not mirror expired PIN decision to Realtime Database", {
          submissionId,
          error,
        })
      );
      await deleteMissionPhoto(submission).catch((error) =>
        logger.warn("Could not delete mission photo after PIN expiry", {
          submissionId,
          error,
        })
      );
      response.status(410).send(
        renderPage(
          "Review PIN expired",
          "<h1>Review PIN expired</h1><p class=\"muted\">Ask your child to submit the work again to get a new review link and PIN.</p>"
        )
      );
      return;
    }

    if (request.method === "GET") {
      response.status(200).send(renderPinEntryPage());
      return;
    }
    if (request.method !== "POST") {
      response.set("Allow", "GET, POST").status(405).send("Method not allowed.");
      return;
    }

    const submittedPin =
      typeof request.body?.pin === "string" ? request.body.pin : "";
    if (!pinMatches(rawToken, submittedPin, tokenData.pinHash)) {
      const lockRef = db.collection("missionReviewLocks").doc(String(submission.uid));
      let attemptsRemaining = 0;
      let attemptsExceeded = false;
      await db.runTransaction(async (transaction) => {
        const [currentToken, currentSubmission, lock] = await Promise.all([
          transaction.get(tokenRef),
          transaction.get(submissionRef),
          transaction.get(lockRef),
        ]);
        if (!currentToken.exists || !currentSubmission.exists) return;
        const attempts = Number(currentToken.data()?.pinAttempts ?? 0) + 1;
        attemptsRemaining = Math.max(0, maxReviewPinAttempts - attempts);
        if (attempts >= maxReviewPinAttempts) {
          attemptsExceeded = true;
          if (currentSubmission.data()?.status === "pending") {
            transaction.update(submissionRef, {
              status: "needs_revision" satisfies SubmissionStatus,
              updatedAt: Timestamp.now(),
            });
          }
          if (lock.exists && lock.data()?.tokenHash === tokenHash) {
            transaction.delete(lockRef);
          }
          transaction.delete(tokenRef);
        } else {
          transaction.update(tokenRef, {pinAttempts: attempts});
        }
      });
      if (attemptsExceeded) {
        await updateDatabaseSubmissionStatus(submission, "rejected").catch((error) =>
          logger.warn("Could not mirror locked PIN decision to Realtime Database", {
            submissionId,
            error,
          })
        );
        await deleteMissionPhoto(submission).catch((error) =>
          logger.warn("Could not delete mission photo after PIN lockout", {
            submissionId,
            error,
          })
        );
        response.status(429).send(
          renderPage(
            "PIN attempts exceeded",
            "<h1>PIN attempts exceeded</h1><p class=\"muted\">For security, this review PIN is no longer valid. Ask your child to submit the work again.</p>"
          )
        );
        return;
      }
      response.status(400).send(
        renderPinEntryPage(
          `Incorrect PIN. ${attemptsRemaining} attempt${attemptsRemaining === 1 ? "" : "s"} remaining.`
        )
      );
      return;
    }

    const action = request.body?.action;
    const decision =
      action === "approve" ?
        "approved" :
        action === "needs_revision" ?
          "needs_revision" :
          null;

    if (!decision) {
      let photoUrl: string;
      if (submission.storageProvider === "cloudinary") {
        configureCloudinary();
        photoUrl = await getCloudinaryReviewUrl(submission);
      } else {
        [photoUrl] = await bucket.file(String(submission.storagePath)).getSignedUrl({
          action: "read",
          expires: Date.now() + 30 * 60 * 1000,
        });
      }
      response.status(200).send(
        renderPage(
          "Parent mission review",
          `<h1>Review your child's mission</h1>
          <h2>${escapeHtml(String(submission.title))}</h2>
          <p class="criterion"><strong>Target:</strong> ${escapeHtml(String(submission.parentCheck))}</p>
          <p class="muted">Look at the photo and confirm the work with your child.</p>
          <img src="${escapeHtml(photoUrl)}" alt="Photo submitted for ${escapeHtml(String(submission.title))}" />
          <form method="post">
            <input type="hidden" name="pin" value="${escapeHtml(submittedPin)}" />
            <div class="actions">
              <button class="approve" type="submit" name="action" value="approve">Confirm mission</button>
              <button class="retry" type="submit" name="action" value="needs_revision">Ask for another photo</button>
            </div>
          </form>`
        )
      );
      return;
    }

    const lockRef = db.collection("missionReviewLocks").doc(String(submission.uid));
    const decisionTime = Timestamp.now();
    try {
      await db.runTransaction(async (transaction) => {
        const [currentSubmission, currentToken, lock] = await Promise.all([
          transaction.get(submissionRef),
          transaction.get(tokenRef),
          transaction.get(lockRef),
        ]);
        if (
          !currentSubmission.exists ||
          currentSubmission.data()?.status !== "pending" ||
          !currentToken.exists ||
          !pinMatches(rawToken, submittedPin, currentToken.data()?.pinHash)
        ) {
          throw new Error("This mission has already been reviewed or unlocked.");
        }
        transaction.update(submissionRef, {
          status: decision,
          updatedAt: decisionTime,
          reviewedAt: decisionTime,
        });
        if (lock.exists && lock.data()?.tokenHash === tokenHash) {
          transaction.delete(lockRef);
        }
        transaction.delete(tokenRef);
      });
    } catch (error) {
      logger.warn("Mission review decision was not applied", {
        submissionId,
        error,
      });
      response.status(409).send(
        renderPage(
          "Mission already reviewed",
          "<h1>Mission already reviewed</h1><p class=\"muted\">The review link may already have been used. Your child will see the current result in LearnBridge.</p>"
        )
      );
      return;
    }

    await updateDatabaseSubmissionStatus(
      submission,
      decision === "approved" ? "approved" : "rejected"
    ).catch((error) =>
      logger.warn("Could not mirror parent decision to Realtime Database", {
        submissionId,
        error,
      })
    );
    await deleteMissionPhoto(submission).catch((error) => {
      logger.warn("Could not delete reviewed mission photo", {
        submissionId,
        error,
      });
    });
    response.status(200).send(
      renderPage(
        decision === "approved" ? "Mission approved" : "Photo resubmission requested",
        decision === "approved" ?
          `<h1>Mission approved!</h1><p class="muted">${escapeHtml(String(submission.title))} is confirmed. Your child will see a success result in LearnBridge.</p>` :
          "<h1>Another photo requested</h1><p class=\"muted\">Your child will see a message in LearnBridge and can send a new photo.</p>"
      )
    );
  }
);
