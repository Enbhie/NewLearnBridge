# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

## Firebase Authentication

1. In the Firebase Console, create a project, add a Web app, and enable **Email/Password** plus **Email link (passwordless sign-in)** under Authentication > Sign-in method.
2. For local development, put the Firebase Web app values in `.env.local` using the `EXPO_PUBLIC_FIREBASE_*` variable names. Restart Expo after changing the file.
3. For EAS APK builds, add these variables once in the EAS project dashboard under **Project settings > Environment variables**:
   - `EXPO_PUBLIC_FIREBASE_API_KEY`
   - `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
   - `EXPO_PUBLIC_FIREBASE_APP_ID`
   - `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`

   Set them in the **preview** environment for `eas build --profile preview --platform android` APKs and in **production** for production builds. Use plain-text visibility: `EXPO_PUBLIC_` values are bundled into the app and are not secrets. The `.env.local` file is intentionally ignored by Git and is not uploaded to remote EAS builds. Once these EAS variables are saved, future APK builds use them automatically; rebuild and reinstall the APK after setting them.
   After upgrading Expo or other native dependencies, build and install a new APK or development client before using the updated JavaScript. The SDK 58 runtime version prevents EAS Updates from sending SDK 58 code to older binaries.
4. New accounts receive Firebase's email verification link and must verify before opening the main menu.

Learner profiles are stored in Cloud Firestore under the signed-in parent account and cached locally on the device. Existing local profiles are copied to Firestore the first time the parent signs in after this update. Deploy the updated Firestore rules before using cloud profile sync:

```bash
firebase deploy --only firestore:rules
```

Firebase Auth does not send numeric email codes; the verification flow uses Firebase's built-in link.

## Grade 2 online lessons

Grade 2 learners can open quarter-based online lessons from the Lesson Board. Reading covers phonemic awareness and story elements, text features and sequence, critical thinking and text types, and independent reading. Math covers whole numbers and place value, addition and subtraction, multiplication/division/fractions, and measurement/geometry/data. Science covers living things and their environment, matter and the physical world, and Earth and sky. Each quarter includes 10 questions at each Easy, Standard, and Challenge difficulty; question order and answer choices are randomized for each play. A wrong answer records a mistake and moves to the next question, preventing repeated guessing on the same question. A quarter can only be completed, earn a badge, and unlock the next quarter after a perfect attempt; otherwise, the learner can retry the quarter from the beginning. Lesson mistakes and completion progress are saved locally for offline use. Other grades apply the same perfect-attempt rule to their existing lesson or module boundaries. Earned module badges include a learning summary and result and are stored locally.

## Parent mission photo review

Photo-based missions upload to Cloudinary with the app's unsigned upload preset while online. If the device is definitely disconnected, the photo is saved on-device as **Pending** and uploaded when connectivity returns or the app is reopened; an unknown network state attempts the upload rather than being treated as offline. After upload, the app saves Cloudinary's returned `secure_url` and mission details at `submissions/{uid}/{pushId}` in Realtime Database:

```json
{
  "missionId": "K-3",
  "imageUrl": "https://res.cloudinary.com/...",
  "status": "pending",
  "createdAt": 1710000000000
}
```

The database submission ID is retained in the local upload queue so a retry reuses the same record. Existing on-device Firebase Storage submissions remain supported. Cloudinary delivery URLs are public: anyone who obtains a `secure_url` can view its image, so the hosted review page only reveals the URL after authentication; the URL itself is not private.

### Firebase Spark mode

On the Spark plan, the app uploads directly to Cloudinary using an unsigned upload preset and saves the image URL plus mission details in Realtime Database. It then sends a Firebase Authentication email sign-in link to the signed-in parent account's verified email. The link opens the hosted `/mission-review` page; after the parent enters that email, the page authenticates them, loads the matching RTDB record, and offers a review modal. Confirming writes `status: "approved"` to RTDB, and the learner app listens for that decision and awards the mission badge. This flow does not use Cloud Functions or the Cloudinary API secret.

In `.env.local`, set `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME` to the Cloudinary cloud name and `EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET` to the exact name of an **unsigned** preset in that same Cloudinary account. Configure the preset to accept images only and enforce the 5 MB size limit. Restart Expo after changing either value. For installed builds, set both values in the matching EAS environment and rebuild the app.

In Firebase Console, enable **Email/Password** and its **Email link (passwordless sign-in)** option under Authentication > Sign-in method. Add the Hosting domain `learnbridge-a7c85.web.app` to Authentication > Settings > Authorized domains if it is not already listed. The sign-in link is sent to the email address on the currently signed-in parent account; on another device, the parent must enter that same email to finish signing in. `EXPO_PUBLIC_MISSION_REVIEW_URL` can override the default `https://learnbridge-a7c85.web.app/mission-review` continuation URL.

Build the static web app and deploy it with the RTDB rules:

```bash
npx expo export --platform web
firebase deploy --only hosting,database
```

The parent and learner currently use the same Firebase UID. Consequently, this email-link flow verifies access to the account email and protects the RTDB record from other accounts, but RTDB rules cannot distinguish the parent from a learner using that same signed-in account. A separate parent identity or a trusted server-side approval flow is needed for strict parent-only enforcement. The Cloudinary image URL also remains publicly accessible to anyone who obtains it.

### Automatic parent review

The separate legacy email/PIN workflow requires the Firebase Blaze plan because it uses Cloud Functions. Enable Cloud Firestore and Realtime Database; keep the app's Realtime Database URL in `src/firebase.ts` aligned with the Firebase project.
2. Install the Firebase CLI, sign in, and select the same project used by `.env.local`:

   ```bash
   npm install --global firebase-tools
   firebase login
   firebase use --add
   ```

3. Configure the Functions parameters `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `FIREBASE_DATABASE_URL` to match the Cloudinary account and the Realtime Database URL in `src/firebase.ts`. Store the Cloudinary API secret using Firebase Secret Manager:

   ```bash
   firebase functions:secrets:set CLOUDINARY_API_SECRET
   ```

   Mission photos are uploaded directly from the app to Cloudinary using a short-lived signature from the authenticated `createMissionUploadSignature` function. The API secret stays on the server; an unsigned Cloudinary upload preset and client-side Cloudinary credentials are not used. In Resend, verify a sending domain and set the sender address to an address on that verified domain. Store the Resend key using Firebase Secret Manager:

   ```bash
   firebase functions:secrets:set RESEND_API_KEY
   ```

   Enter each secret at its prompt. Do not place either secret in `.env.local` or commit it. On the first deployment, configure `MISSION_EMAIL_FROM` (for example, `LearnBridge <missions@your-verified-domain.example>`). `MISSION_REVIEW_BASE_URL` is optional; by default, the Functions use the deployed `us-central1` review URL.

4. Install and build the backend, then deploy the backend and security rules:

   ```bash
   npm --prefix functions install
   npm --prefix functions run build
   firebase deploy --only functions,firestore:rules,database,storage
   ```

The parent email contains a private review link and PIN. Opening the link only displays the submission after the PIN is entered; the parent must select an approval decision on the page. After a decision, the child app receives the result when it is online. The backend deletes the Cloudinary asset after review; legacy Firebase Storage photos are also deleted after review.

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
