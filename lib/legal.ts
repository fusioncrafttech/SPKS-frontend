export const LEGAL_CONTACT_EMAIL = 'fusioncraft@gmail.com';
export const LEGAL_CONTACT_PHONE = '+91 9360121830';
export const LEGAL_DEVELOPER = 'FusionCraft';
export const LEGAL_APP_NAME = 'SPKS Exam Academy';
export const ACCOUNT_DELETION_DAYS = 7;
export const PRIVACY_POLICY_URL = 'https://spks-exams-admin.vercel.app/privacy-policy.html';
export const DELETE_ACCOUNT_URL = 'https://spks-exams-admin.vercel.app/delete-account.html';

export const PRIVACY_SECTIONS = [
  {
    title: '1. Who we are',
    body: `${LEGAL_APP_NAME} is an exam-preparation app for TNPSC, RRB, TNUSRB and related government exams. It is operated by ${LEGAL_DEVELOPER}. This policy explains what personal data we collect, why we use it, and how you can control it.`,
  },
  {
    title: '2. Information we collect',
    body: `We collect information you give us when you create an account or use the app: first name, last name, email address, mobile number, password, state, and optional profile photo. We also store learning data such as test attempts, scores, progress, bookmarks, support tickets, and subscription or payment status. Device information needed to run the app (for example app version and notification tokens) may also be stored.`,
  },
  {
    title: '3. How we use information',
    body: `We use this information to create and secure your account, deliver courses, tests, notes and videos, process subscriptions, send password-reset and support messages, improve the app, and meet legal or tax requirements. We do not sell your personal information.`,
  },
  {
    title: '4. Payments',
    body: `Paid plans are processed through Razorpay. Razorpay receives the payment details needed to complete a transaction. We store order, payment and subscription records so we can unlock premium content and show your payment history. Card or UPI secrets are handled by Razorpay, not stored in our app database.`,
  },
  {
    title: '5. Sharing',
    body: `We share data only with service providers who help us operate the app (hosting, email, payments) and only as needed for that service. We may disclose information if required by law. We do not share your data with advertisers.`,
  },
  {
    title: '6. Data retention',
    body: `Account and learning data are kept while your account is active. After you request deletion we remove or anonymise personal data within ${ACCOUNT_DELETION_DAYS} days, except records we must keep for tax, fraud prevention or legal compliance (for example completed payment invoices).`,
  },
  {
    title: '7. Security',
    body: `Passwords are stored in hashed form. Access to the service uses authenticated API requests. No method of transmission or storage is 100% secure, but we take reasonable technical and organisational measures to protect your information.`,
  },
  {
    title: '8. Your rights',
    body: `You can view and update your profile in the app, change your password, and request deletion of your account. You may also contact us to access, correct or delete personal data we hold about you.`,
  },
  {
    title: '9. Children',
    body: `${LEGAL_APP_NAME} is intended for students preparing for competitive exams. We do not knowingly collect personal information from children under 13. If you believe a child has created an account, contact us and we will delete it.`,
  },
  {
    title: '10. Contact',
    body: `Questions about this policy or your data: ${LEGAL_CONTACT_EMAIL} or ${LEGAL_CONTACT_PHONE}. Last updated: 19 September 2026.`,
  },
];
