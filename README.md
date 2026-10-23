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

1. In the Firebase Console, create a project, add a Web app, and enable **Email/Password** under Authentication > Sign-in method.
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

Grade 2 learners can open quarter-based online lessons from the Lesson Board. Reading covers phonemic awareness and story elements, text features and sequence, critical thinking and text types, and independent reading. Math covers whole numbers and place value, addition and subtraction, multiplication/division/fractions, and measurement/geometry/data. Science covers living things and their environment, matter and the physical world, and Earth and sky. Each quarter includes 10 questions at each Easy, Standard, and Challenge difficulty; question order and answer choices are randomized for each play. At the end of a quarter, learners can raise or lower the saved difficulty. Lessons unlock in order within each subject, and completion progress is saved separately for each learner profile.

## Parent mission photo review

Kindergarten missions **Count the Items**, **First Letter**, and **Letter Tracing** send the selected photo to the verified email address on the signed-in parent/guardian account. The child then sees a waiting screen until the parent approves the work or asks for another photo. This flow requires Firebase Cloud Functions, Firestore, Storage, and a Resend account; it will not send email until the backend is deployed and configured.

1. In Firebase, enable Cloud Firestore and Cloud Storage, and upgrade the project to the Blaze plan if Firebase requires it for Cloud Functions.
2. Install the Firebase CLI, sign in, and select the same project used by `.env.local`:

   ```bash
   npm install --global firebase-tools
   firebase login
   firebase use --add
   ```

3. In Resend, verify a sending domain. Set the sender address to an address on that verified domain:

   ```bash
   firebase functions:secrets:set RESEND_API_KEY
   ```

   Enter the Resend API key at the prompt. Do not place it in `.env.local` or commit it. On the first deployment, configure `MISSION_EMAIL_FROM` when prompted (for example, `LearnBridge <missions@your-verified-domain.example>`). `MISSION_REVIEW_BASE_URL` is optional; by default, the functions use the deployed `us-central1` review URL.

4. Install and build the backend, then deploy the backend and security rules:

   ```bash
   npm --prefix functions install
   npm --prefix functions run build
   firebase deploy --only functions,firestore:rules,storage
   ```

The parent email contains the photo attachment and a private review link. Opening the link only displays the submission; the parent must select an approval decision on the page. After a decision, the child app receives the result when it is online. The backend removes the uploaded Storage copy after review; the email attachment remains in the parent's mailbox.

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
