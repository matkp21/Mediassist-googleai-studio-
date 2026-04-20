"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { HeartHandshake, LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Login Successful!",
        description: "Welcome back to MediAssistant.",
      });
      router.push("/"); // Redirect to homepage or dashboard
    } catch (err: any) {
      let errorMessage = "Failed to log in. Please check your credentials.";
      if (err && err.code) {
        switch (err.code) {
          case "auth/user-not-found":
          case "auth/wrong-password":
          case "auth/invalid-credential":
            errorMessage = "Invalid email or password.";
            break;
          case "auth/invalid-email":
            errorMessage = "Please enter a valid email address.";
            break;
          default:
            errorMessage = "An unexpected error occurred. Please try again.";
            break;
        }
      }
      console.error("Firebase login error:", err);
      setError(errorMessage);
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background relative overflow-hidden p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-card p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-sm z-10 border"
      >
        <div className="flex flex-col items-center mb-6">
          <motion.div
            animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            className="text-primary mb-3 p-3 bg-primary/10 rounded-full"
          >
            <HeartHandshake size={40} />
          </motion.div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Welcome Back</h2>
          <p className="text-sm text-muted-foreground mt-1">Log in to MediAssistant</p>
        </div>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4 text-center"
          >
            {error}
          </motion.div>
        )}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 rounded-lg"
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 rounded-lg"
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full rounded-lg py-3 group" disabled={isLoading}>
            {isLoading ? "Logging In..." : "Login"}
            {!isLoading && <LogIn className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account?{" "}
          <Link href="/signup" className="text-primary hover:underline font-medium">
            Sign Up
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
