var express = require("express");
var router = express.Router();
const { CheckLogin } = require("../utils/authHandler");

// Dashboard
router.get("/", CheckLogin, async function (req, res) {
  res.render("index", {
    title: "Bang dieu khien",
    active: "dashboard",
    user: req.user
  });
});

// Repair Tickets
router.get("/admin/repair-tickets", CheckLogin, async function (req, res) {
  res.render("admin/repair-tickets", {
    title: "Quan ly phieu sua chua",
    active: "tickets",
    user: req.user
  });
});

// Components (Inventory)
router.get("/admin/inventory", CheckLogin, async function (req, res) {
  res.render("admin/inventory/index", {
    title: "Kho linh kien",
    active: "inventory",
    user: req.user
  });
});

// Warranty
router.get("/admin/warranty", CheckLogin, async function (req, res) {
  res.render("admin/warranty/index", {
    title: "Quan ly bao hanh",
    active: "warranty",
    user: req.user
  });
});

// Profile
router.get("/profile", CheckLogin, async function (req, res) {
  res.render("profile", {
    title: "Ho so ca nhan",
    active: "profile",
    user: req.user
  });
});

// Auth
router.get("/auth/login", function (req, res) {
  res.render("auth/login", { title: "Dang nhap" });
});

router.get("/auth/register", function (req, res) {
  res.render("auth/register", { title: "Dang ky" });
});

module.exports = router;
