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
                
    PhoneNumber: phone,
    Provider: "mpesa",
    Amount: amount,
    Reference: plan,
    CallbackURL: `${process.env.BASE_URL}/api/payment/callback`

              
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