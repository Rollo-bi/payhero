const express = require("express");
const router = express.Router();

const controller = require("../paymentController");

console.log("Controller:", controller);
console.log("initiatePayment =", typeof controller.initiatePayment);
console.log("paymentCallback =", typeof controller.paymentCallback);
console.log("checkStatus =", typeof controller.checkStatus);

router.post("/initiate", controller.initiatePayment);
router.post("/callback", controller.paymentCallback);
router.get("/status/:id", controller.checkStatus);

module.exports = router;
