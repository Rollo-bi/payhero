const axios = require("axios");

let payments = {};

/**
 * INITIATE STK PUSH
 */
exports.initiatePayment = async (req, res) => {
    const { phone, amount, plan } = req.body;

    try {

        // ✅ SINGLE SOURCE OF TRUTH
        const reference = "SUB-" + Date.now();

        const response = await axios.post(
            `${process.env.PAYHERO_BASE_URL}`,
            {
                amount: Number(amount),
                phone_number: phone,
                channel_id: 4643,
                provider: "m-pesa",
                external_reference: reference,
                Reference: plan,
                callback_url: "https://payhero-p673.onrender.com/api/payment/callback"
            },
            {
                headers: {
                    Authorization: process.env.PAYHERO_API_KEY,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("PAYHERO RESPONSE:", response.data);

        // ✅ STORE SAME REFERENCE
        payments[reference] = {
            phone,
            amount,
            plan,
            status: "pending"
        };

        res.json({
            success: true,
            transactionId: reference
        });

    } catch (error) {
        console.log("INIT ERROR:", error.response?.data || error.message);

        res.status(500).json({
            success: false,
            message: "STK push failed"
        });
    }
};

/**
 * CALLBACK
 */
exports.paymentCallback = (req, res) => {
    const data = req.body;

    console.log("🔥 CALLBACK RECEIVED:", JSON.stringify(data, null, 2));

    const reference = data?.response?.ExternalReference;

    if (reference && payments[reference]) {
        payments[reference].status = "paid";
        console.log("✅ PAYMENT UPDATED:", reference);
    } else {
        console.log("⚠️ No matching transaction found:", reference);
    }

    res.json({ success: true });
};

/**
 * CHECK STATUS
 */
exports.checkStatus = (req, res) => {
    const id = req.params.id;

    const payment = payments[id];

    if (!payment) {
        return res.json({
            success: false,
            status: "not_found"
        });
    }

    res.json({
        success: true,
        status: payment.status,
        plan: payment.plan
    });
};
