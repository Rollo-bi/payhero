const axios = require("axios");

// temporary storage (replace with DB later)
let payments = {};

/**
 * INITIATE PAYMENT (STK PUSH)
 */
exports.initiatePayment = async (req, res) => {

    const { phone, amount, plan } = req.body;

    try {
        // Call PayHero API (example format - adjust to real PayHero docs)
        const response = await axios.post(
            `${process.env.PAYHERO_BASE_URL}/payments/initiate`,
            {
                phone,
                amount,
                channel: "mpesa",
                reference: plan
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYHERO_API_KEY}`
                }
            }
        );

        const transactionId = response.data.transaction_id || Date.now().toString();

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
        console.log(error.message);

        res.status(500).json({
            success: false,
            message: "Payment initiation failed"
        });
    }
};


/**
 * CALLBACK FROM PAYHERO
 */
exports.paymentCallback = (req, res) => {

    const data = req.body;

    console.log("Callback received:", data);

    const transactionId = data.transaction_id;

    if (payments[transactionId]) {
        payments[transactionId].status = "paid";
    }

    res.json({ status: "ok" });
};


/**
 * CHECK PAYMENT STATUS (ANDROID CALLS THIS)
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