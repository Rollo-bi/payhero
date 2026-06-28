const express = require("express");
const router = express.Router();

const {
    initiatePayment,
    paymentCallback,
    checkStatus
} = require("../controllers/paymentController");

router.post("/initiate", initiatePayment);
router.post("/callback", paymentCallback);
router.get("/status/:id", checkStatus);

module.exports = router;
