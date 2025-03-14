"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, PencilIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import { SupabaseClient } from "@supabase/supabase-js";
import { PurchaseCreditsModal } from "../credits/PurchaseCreditsModal";
import { PurchasePlanModal } from "../pricing/PurchasePlanModal";
import { useRouter } from "next/navigation";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  profile: any;
  setProfile: (profile: any) => void;
  credits?: { amount: number };
  subscription?: { plan_type: string };
  supabase: SupabaseClient;
  setCredits?: (credits: any) => void;
}

export function ProfileModal({ isOpen, onClose, user, profile, setProfile, credits, subscription, supabase, setCredits }: ProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [localSubscription, setLocalSubscription] = useState(subscription);
  const [localCredits, setLocalCredits] = useState(credits);
  const planType = subscription?.plan_type || localSubscription?.plan_type || "free";
  const isUpgradeable = planType === "free" || planType === "pro";
  const creditBalance = credits?.amount || localCredits?.amount || 0;
  const router = useRouter();

  const handleSave = async () => {
    setIsSaving(true);
    setIsFetching(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(updatedProfile);
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsFetching(false);
      setIsSaving(false);
    }
  };

  const handlePurchaseSuccess = async () => {
    // Fetch updated credits data
    if (user && setCredits) {
      try {
        const { data: creditsData } = await supabase
          .from("credits")
          .select("*")
          .eq("user_id", user.id)
          .single();
        
        if (creditsData) {
          setLocalCredits(creditsData);
          setCredits(creditsData);
        }
      } catch (error) {
        console.error("Error fetching updated credits:", error);
      }
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 w-full sm:max-w-lg sm:p-6">
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
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex-grow">
                            <p className="text-sm font-medium text-gray-500">Full Name</p>
                            {isEditing ? (
                              <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center">
                                <input
                                  type="text"
                                  value={fullName}
                                  onChange={(e) => setFullName(e.target.value)}
                                  className="block w-full rounded-md border-0 py-1.5 pl-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                  placeholder={profile?.full_name || "Enter your full name"}
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
                                {isFetching && <div className="loader" />}
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
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Email</p>
                            <p className="text-lg font-semibold text-gray-900">{user?.email}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Member Since</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {new Date(profile?.created_at || user?.created_at).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg bg-gray-50 p-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Current Plan</p>
                            <p className="text-lg font-semibold text-indigo-600 capitalize">{planType}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Credits Available</p>
                            <p className="text-lg font-semibold text-indigo-600">{creditBalance}</p>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <button
                            onClick={() => setShowPurchaseModal(true)}
                            className="w-full flex items-center justify-center py-2 px-4 border border-indigo-600 rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            <PlusCircleIcon className="h-4 w-4 mr-1" />
                            Buy Additional Credits
                          </button>
                        </div>
                      </div>

                      {isUpgradeable && (
                        <div className="mt-8">
                          <button
                            onClick={() => setShowPlanModal(true)}
                            className="block w-full rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                          >
                            Upgrade Plan
                          </button>
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
      
      {/* Purchase Credits Modal */}
      <PurchaseCreditsModal 
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        onSuccess={() => {
          handlePurchaseSuccess();
        }}
      />
      
      {/* Purchase Plan Modal */}
      <PurchasePlanModal 
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        currentPlan={planType}
        onSuccess={(newPlan) => {
          setLocalSubscription(newPlan);
          handlePurchaseSuccess();
          router.refresh();
        }}
      />
    </Transition.Root>
  );
}
