// src/components/GoogleSignInButton.tsx
import { Button } from "@/components/ui/button";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function GoogleSignInButton() {
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

     
      console.log("Google Sign-In Success:", user);
      navigate("/dashboard"); // 🔁 Redirect after login
    } catch (error) {
      console.error("Google Sign-In Failed:", error);
    }
  };

  return (
    <Button onClick={handleGoogleSignIn} className="w-full mt-4">
      Sign in with Google
    </Button>
  );
}

