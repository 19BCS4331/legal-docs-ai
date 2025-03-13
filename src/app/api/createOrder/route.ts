import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

const key_id = process.env.RAZORPAY_KEY_ID as string;
const key_secret = process.env.RAZORPAY_KEY_SECRET as string;

if (!key_id || !key_secret) {
    throw new Error("Razorpay keys are missing");
}

const razorpay = new Razorpay({
    key_id,
    key_secret
});

export type OrderBody = {
    amount: number;
    currency: string;
    planId?: string;
    receipt?: string;
    notes?: Record<string, any>;
};

export async function POST(request: NextRequest) {
    try {
        const { amount, currency, planId, receipt, notes }: OrderBody = await request.json();
        if (!amount) {
            return NextResponse.json({ message: `Amount is required` }, { status: 400 })
        }

        const options = {
            amount: amount * 100, // Convert to paise
            currency: currency || "INR",
            receipt: receipt || `receipt_${planId || 'credit'}_${Date.now()}`,
            notes: notes || (planId ? { planId } : {})
        }

        const order = await razorpay.orders.create(options);
        console.log("Order Created Successfully:", order);

        return NextResponse.json({ id: order.id }, { status: 200 })

    } catch (error) {
        console.error("Error creating order:", error);
        return NextResponse.json({ message: "Server Error", error }, { status: 500 })
    }
}
