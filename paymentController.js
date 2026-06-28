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
                
   
            amount: Number(amount),
            phone_number: phone,
            channel_id: 4643,                       // your STK Push channel
            provider: "m-pesa",
            external_reference : "SUB-" + Date.now(), // unique reference
            Reference: plan,
            callback_url: "https://TALAkash.online/callback",
            description: description || "Subscription Payment"

              
            },
            {
                headers: {
                    Authorization: process.env.PAYHERO_API_KEY,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("PAYHERO RESPONSE:", response.data);

        const transactionId =
            response.data.transaction_id ||
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

    console.log("PAYHERO CALLBACK:", data);

    const transactionId =
        data.transaction_id ||
        data.checkoutRequestId ||
        data.MerchantRequestID;

    if (transactionId && payments[transactionId]) {
        payments[transactionId].status = "paid";
    }

    res.json({ ResultCode: 0, ResultDesc: "OK" });
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
