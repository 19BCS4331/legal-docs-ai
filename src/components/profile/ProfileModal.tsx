"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, PencilIcon } from "@heroicons/react/24/outline";
import { SupabaseClient } from "@supabase/supabase-js";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  profile: any;
  credits?: { amount: number };
  subscription?: { plan_type: string };
  supabase: SupabaseClient;
}

export function ProfileModal({ isOpen, onClose, user, profile, credits, subscription, supabase }: ProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [isSaving, setIsSaving] = useState(false);
  const planType = subscription?.plan_type || "free";
  const isUpgradeable = planType === "free" || planType === "pro";
  const creditBalance = credits?.amount || 0;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div>
                  <div className="mt-3 text-center sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className="text-2xl font-semibold leading-6 text-gray-900 mb-8">
                      Profile
                    </Dialog.Title>
                    <div className="mt-2 space-y-6">
                      <div className="rounded-lg bg-gray-50 p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-grow">
                            <p className="text-sm font-medium text-gray-500">Full Name</p>
                            {isEditing ? (
                              <div className="mt-1 flex items-center gap-2">
                                <input
                                  type="text"
                                  value={fullName}
                                  onChange={(e) => setFullName(e.target.value)}
                                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                  placeholder="Enter your full name"
                                />
                                <button
                                  onClick={handleSave}
                                  disabled={isSaving}
                                  className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
                                >
                                  {isSaving ? "Saving..." : "Save"}
                                </button>
                                <button
                                  onClick={() => setIsEditing(false)}
                                  className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <p className="text-lg font-semibold text-gray-900">
                                  {profile?.full_name || "Not set"}
                                </p>
                                <button
                                  onClick={() => setIsEditing(true)}
                                  className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                                >
                                  <PencilIcon className="h-5 w-5" aria-hidden="true" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg bg-gray-50 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Email</p>
                            <p className="text-lg font-semibold text-gray-900">{user?.email}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Member Since</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {new Date(profile?.created_at || user?.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg bg-gray-50 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Current Plan</p>
                            <p className="text-lg font-semibold text-indigo-600 capitalize">{planType}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Credits Available</p>
                            <p className="text-lg font-semibold text-indigo-600">{creditBalance}</p>
                          </div>
                        </div>
                      </div>

                      {isUpgradeable && (
                        <div className="mt-8">
                          <Link
                            href="/pricing"
                            onClick={onClose}
                            className="block w-full rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                          >
                            Upgrade Plan
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
