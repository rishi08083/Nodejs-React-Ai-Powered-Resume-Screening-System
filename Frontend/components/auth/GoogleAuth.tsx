import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

export default function GoogleSignIn({ onSuccess, onError }) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
      <GoogleLogin
        theme="filled_black"
        onSuccess={async (credentialResponse) => {
          try {
            // Decode the JWT credential
            const decoded = jwtDecode(credentialResponse.credential);
            console.log(decoded);
            // Send user data to your Node.js server
          } catch (error) {
            console.error("Authentication error:", error);
            onError(error.message);
          }
        }}
        onError={() => {
          onError("Google login failed");
        }}
      />
    </GoogleOAuthProvider>
  );
}
