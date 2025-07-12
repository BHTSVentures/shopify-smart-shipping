import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.json({ success: true, message: "Shipping app is online" });
});

app.post("/carrier-service", (req, res) => {
  const sharedSecret = process.env.SHARED_SECRET;
  const targetSku = process.env.TARGET_SKU || "5kg-box";
  const splitCost = parseFloat(process.env.SPLIT_COST || "8.00");
  const combinedCost = parseFloat(process.env.COMBINED_COST || "20.00");

  const items = req.body.rate.items || [];
  let quantity = 0;

  for (const item of items) {
    if (item.sku === targetSku) {
      quantity += item.quantity;
    }
  }

  if (quantity === 0) {
    return res.json({ rates: [] });
  }

  const splitShipping = quantity * splitCost;
  const cheapest = splitShipping < combinedCost ? splitShipping : combinedCost;

  const rate = {
    service_name: "Smart Split Shipping",
    service_code: "SMART_SPLIT",
    total_price: Math.round(cheapest * 100), // Shopify expects cents
    currency: "USD"
  };

  res.json({ rates: [rate] });
});

app.listen(port, () => {
  console.log(`Shipping app listening on port ${port}`);
});
