"use client";

import { Fragment, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dialog, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  DocumentTextIcon,
  HomeIcon,
  TagIcon,
  XMarkIcon,
  UserCircleIcon,
  ArrowLeftOnRectangleIcon,
  DocumentDuplicateIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";
import { createBrowserClient } from "@supabase/ssr";
import { ProfileModal } from "@/components/profile/ProfileModal";
import Image from "next/image";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { name: "Documents", href: "/documents", icon: DocumentTextIcon },
  { name: "Templates", href: "/templates", icon: DocumentDuplicateIcon },
  { name: "Tags", href: "/tags", icon: TagIcon },
  { name: "Transactions", href: "/dashboard/transactions", icon: CreditCardIcon },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export function SideNav() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSignOutOpen, setIsSignOutOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [credits, setCredits] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch user data function that can be reused
  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      if (!user) return;
      
      setUser(user);

      // Use Promise.all to fetch all data in parallel
      const [profileResult, creditsResult, subscriptionResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single(),
        supabase
          .from("credits")
          .select("*")
          .eq("user_id", user.id)
          .single(),
        supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "active")
          .order("subscription_end_date", { ascending: false })
          .limit(1)
          .single()
      ]);

      setProfile(profileResult.data);
      setCredits(creditsResult.data);
      setSubscription(subscriptionResult.data);
      
      // Cache the data in localStorage with timestamp
      const cacheData = {
        user,
        profile: profileResult.data,
        credits: creditsResult.data,
        subscription: subscriptionResult.data,
        timestamp: Date.now()
      };
      localStorage.setItem('userProfileCache', JSON.stringify(cacheData));
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Load cached data on initial render and set up background refresh
  useEffect(() => {
    // Try to load from cache first
    const cachedData = localStorage.getItem('userProfileCache');
    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData);
        const cacheAge = Date.now() - parsedData.timestamp;
        
        // Use cache if it's less than 5 minutes old
        if (cacheAge < 5 * 60 * 1000) {
          setUser(parsedData.user);
          setProfile(parsedData.profile);
          setCredits(parsedData.credits);
          setSubscription(parsedData.subscription);
        }
      } catch (e) {
        console.error("Error parsing cached data:", e);
      }
    }
    
    // Fetch fresh data in the background
    fetchUserData();
    
    // Set up a refresh interval (every 5 minutes)
    const intervalId = setInterval(fetchUserData, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [fetchUserData]);

  const handleSignOut = async () => {
    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();

    // Clear all cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    // Sign out from Supabase
    await supabase.auth.signOut();

    // Hard redirect to auth page
    window.location.href = "/auth";
  };

  const handleProfileClick = () => {
    // Just open the modal immediately - data is already loaded or loading in background
    setIsProfileOpen(true);
    
    // If we don't have data yet or it's stale, refresh in background
    if (!user || loading) {
      fetchUserData();
    }
  };

  return (
    <>
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50 lg:hidden"
          onClose={setSidebarOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button
                      type="button"
                      className="-m-2.5 p-2.5"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon
                        className="h-6 w-6 text-white"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </Transition.Child>
                {/* Sidebar component for mobile */}
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                  <div className="flex h-16 shrink-0 items-center">
                    <Link
                      href="/"
                      className="text-xl font-bold text-indigo-600"
                    >
                      <Image
                        src="/images/website_logo_no_bg.png"
                        alt="Legal Docs AI"
                        width={150}
                        height={40}
                        className="text-indigo-600"
                        priority
                      />
                    </Link>
                  </div>
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                      <li>
                        <ul role="list" className="-mx-2 space-y-1">
                          {navigation.map((item) => (
                            <li key={item.name}>
                              <Link
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={classNames(
                                  pathname === item.href
                                    ? "bg-gray-50 text-indigo-600"
                                    : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50",
                                  "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                                )}
                              >
                                <item.icon
                                  className={classNames(
                                    pathname === item.href
                                      ? "text-indigo-600"
                                      : "text-gray-400 group-hover:text-indigo-600",
                                    "h-6 w-6 shrink-0"
                                  )}
                                  aria-hidden="true"
                                />
                                {item.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </li>
                      <li className="mt-auto">
                        <button
                          onClick={handleProfileClick}
                          className="group -mx-2 flex w-full gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                        >
                          <UserCircleIcon
                            className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-indigo-600"
                            aria-hidden="true"
                          />
                          Profile
                        </button>
                        <button
                          onClick={() => setIsSignOutOpen(true)}
                          className="-mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-50"
                        >
                          <ArrowLeftOnRectangleIcon
                            className="h-6 w-6 text-gray-400"
                            aria-hidden="true"
                          />
                          Sign Out
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center self-center mt-5">
            <Link href="/" className="text-xl font-bold text-indigo-600">
              <Image
                src="/images/website_logo_no_bg.png"
                alt="Legal Docs AI"
                width={120}
                height={30}
                className="text-indigo-600"
                priority
              />
            </Link>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={classNames(
                          pathname === item.href
                            ? "bg-gray-50 text-indigo-600"
                            : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50",
                          "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                        )}
                      >
                        <item.icon
                          className={classNames(
                            pathname === item.href
                              ? "text-indigo-600"
                              : "text-gray-400 group-hover:text-indigo-600",
                            "h-6 w-6 shrink-0"
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              <li className="mt-auto">
                <div className="space-y-1">
                  <button
                    onClick={handleProfileClick}
                    className={classNames(
                      "text-gray-700 hover:text-indigo-600 hover:bg-gray-50",
                      "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold w-full"
                    )}
                  >
                    <UserCircleIcon
                      className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-indigo-600"
                      aria-hidden="true"
                    />
                    Profile
                  </button>
                  <button
                    onClick={() => setIsSignOutOpen(true)}
                    className="group flex w-full gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                  >
                    <ArrowLeftOnRectangleIcon
                      className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-indigo-600"
                      aria-hidden="true"
                    />
                    Sign out
                  </button>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-white px-4 py-4 shadow-sm sm:px-6 lg:hidden">
        <button
          type="button"
          className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <span className="sr-only">Open sidebar</span>
          <Bars3Icon className="h-6 w-6" aria-hidden="true" />
        </button>
        <div className="flex-1">
          <Link href="/" className="text-xl font-bold text-indigo-600">
            Legal Docs AI
          </Link>
        </div>
      </div>

      {/* Sign Out Confirmation Modal */}
      <Transition.Root show={isSignOutOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={setIsSignOutOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                  <div>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                      <ArrowLeftOnRectangleIcon
                        className="h-6 w-6 text-red-600"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="mt-3 text-center sm:mt-5">
                      <Dialog.Title
                        as="h3"
                        className="text-base font-semibold leading-6 text-gray-900"
                      >
                        Sign Out Confirmation
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to sign out? You will need to
                          sign in again to access your documents.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 sm:col-start-2"
                      onClick={() => {
                        setIsSignOutOpen(false);
                        handleSignOut();
                      }}
                    >
                      Sign Out
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                      onClick={() => setIsSignOutOpen(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {loading && <div className="loader" />}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        profile={profile}
        setProfile={setProfile}
        credits={credits}
        subscription={subscription}
        supabase={supabase}
        setCredits={setCredits}
      />
    </>
  );
}
