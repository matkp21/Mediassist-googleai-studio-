'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { HeartPulse, UserPlus } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";

const SignUpPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast({
        title: "Account Created!",
        description: "Welcome to MediAssistant. Please log in.",
      });
      router.push("/login"); // Redirect to login page after successful signup
    } catch (err: any) {
      let errorMessage = "Failed to create an account.";
      if (err && err.code) {
        switch (err.code) {
          case 'auth/email-already-in-use':
            errorMessage = "This email address is already in use.";
            break;
          case 'auth/invalid-email':
            errorMessage = "Please enter a valid email address.";
            break;
          case 'auth/weak-password':
            errorMessage = "The password is too weak. It must be at least 6 characters long.";
            break;
          default:
            errorMessage = "An unexpected error occurred. Please try again.";
            break;
        }
      }
      console.error("Firebase signup error:", err);
      setError(errorMessage);
      toast({
        title: "Sign Up Failed",
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
            <HeartPulse size={40} />
          </motion.div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Create Account</h2>
          <p className="text-sm text-muted-foreground mt-1">Join MediAssistant today</p>
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
        <form onSubmit={handleSignUp} className="space-y-4">
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
              placeholder="Create a password (min. 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 rounded-lg"
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="mt-1 rounded-lg"
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full rounded-lg py-3 group" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Sign Up"}
            {!isLoading && <UserPlus className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:scale-110" />}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Log In
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default SignUpPage;
