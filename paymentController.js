const axios = require("axios");

let payments = {};

/**
 * INITIATE STK PUSH
 */
exports.initiatePayment = async (req, res) => {
    const { phone, amount, plan } = req.body;

    try {
        const response = await axios.post(
            `${process.env.PAYHERO_BASE_URL}`,
            {
                phone,
        amount,
        channel: "mpesa",

        // ✅ ADD THIS
        channel_id: process.env.PAYHERO_CHANNEL_ID,

        reference: plan,
        account_reference: plan,
        callback_url: `${process.env.BASE_URL}/api/payment/callback`   },
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYHERO_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        // IMPORTANT: PayHero usually returns a reference like checkoutRequestId
        const transactionId =
            response.data.checkoutRequestId ||
            response.data.reference ||
            Date.now().toString();

        payments[transactionId] = {
            phone,
            amount,
            plan,
            status: "pending"
        };

        res.json({
            success: true,
            transactionId
        });

    } catch (error) {
        console.log("INIT ERROR:", error.response?.data || error.message);
        console.log("FULL ERROR:", error.response?.data);
console.log("STATUS:", error.response?.status);
console.log("PAYLOAD:", {
    phone,
    amount,
    plan
});

        res.status(500).json({
            success: false,
            message: "STK push failed"
        });
    }
};

/**
 * CALLBACK FROM PAYHERO
 */
exports.paymentCallback = (req, res) => {
    const data = req.body;

    console.log("PAYHERO CALLBACK:", data);

    const transactionId =
        data.checkoutRequestId ||
        data.reference ||
        data.transaction_id;

    if (transactionId && payments[transactionId]) {
        payments[transactionId].status = "paid";
    }

    res.json({ ResultCode: 0, ResultDesc: "OK" });
};

/**
 * CHECK STATUS (ANDROID POLLING)
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
            transactionId
    });
};