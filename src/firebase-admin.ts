import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// You get this JSON from Firebase Console -> Project Settings -> Service Accounts -> Generate New Private Key
const serviceAccount = {
  type: "service_account",
  project_id: "your-project-id",
  private_key_id: "your-private-key-id",
  private_key: "your-private-key",
  client_email: "your-client-email",
  client_id: "your-client-id",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "your-client-x509-cert-url",
  universe_domain: "googleapis.com",
  // ... other fields from your service account JSON
};

const serviceAccountString = JSON.stringify(serviceAccount);

const firebaseAdmin = initializeApp({
  credential: cert(serviceAccountString),
});

export const admin = getAuth(firebaseAdmin);
