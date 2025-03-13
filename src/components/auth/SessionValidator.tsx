"use client";

import { useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

export function SessionValidator() {
  const router = useRouter();
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // If the user is signed out or the session is null, redirect to auth page
        if (event === 'SIGNED_OUT' || !session) {
          router.push('/auth');
        }
      }
    );

    // Periodically validate the session
    const validateSession = async () => {
      try {
        // Get the current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/auth');
          return;
        }

        // Check if the user still exists
        const { error } = await supabase.auth.getUser();
        
        if (error) {
          console.log("Session invalid or user deleted:", error.message);
          await supabase.auth.signOut();
          router.push('/auth');
        }
      } catch (error) {
        console.error("Error validating session:", error);
      }
    };

    // Run validation immediately and then every minute
    validateSession();
    const interval = setInterval(validateSession, 60000);

    // Clean up subscription and interval when component unmounts
    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, [router, supabase]);

  // This component doesn't render anything
  return null;
}
