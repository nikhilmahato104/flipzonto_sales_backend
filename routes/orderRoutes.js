const Order = require('./models/Order'); // Import the Order model

app.post("/api/orders", async (req, res) => {
  try {
    const orderDetails = req.body; // Get order details from request body

    // Create a new order
    const newOrder = new Order(orderDetails);

    // Save the order to the database
    await newOrder.save();

    // Respond with success
    res.json({ success: true });
  } catch (error) {
    console.error("Order Error:", error);
    res.status(500).json({ success: false, message: 'Error placing the order. Please try again.' });
  }
});

