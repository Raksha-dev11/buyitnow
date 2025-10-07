import getRawBody from "raw-body";
import Stripe from "stripe";
import Order from "../models/order";
import APIFilters from "../utils/APIFilters";
import ErrorHandler from "../utils/errorHandler";
const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY);

export const getOrders = async (req, res) => {
  const resPerPage = 2;
  const ordersCount = await Order.countDocuments();

  const apiFilters = new APIFilters(Order.find(), req.query).pagination(
    resPerPage
  );

  const orders = await apiFilters.query.find().populate("shippingInfo user");

  res.status(200).json({
    ordersCount,
    resPerPage,
    orders,
  });
};

export const getOrder = async (req, res) => {
  const order = await Order.findById(req.query.id).populate(
    "shippingInfo user"
  );

  if (!order) {
    return next(new ErrorHandler("No Order found with this ID", 404));
  }

  res.status(200).json({
    order,
  });
};

export const myOrders = async (req, res) => {
  const resPerPage = 2;
  const ordersCount = await Order.countDocuments();

  const apiFilters = new APIFilters(Order.find(), req.query).pagination(
    resPerPage
  );

  const orders = await apiFilters.query
    .find({ user: req.user._id })
    .populate("shippingInfo user");

  res.status(200).json({
    ordersCount,
    resPerPage,
    orders,
  });
};

export const updateOrder = async (req, res) => {
  let order = await Order.findById(req.query.id);

  if (!order) {
    return next(new ErrorHandler("No Order found with this ID", 404));
  }

  order = await Order.findByIdAndUpdate(req.query.id, {
    orderStatus: req.body.orderStatus,
  });

  res.status(200).json({
    success: true,
    order,
  });
};

export const deleteOrder = async (req, res) => {
  let order = await Order.findById(req.query.id);

  if (!order) {
    return next(new ErrorHandler("No Order found with this ID", 404));
  }

  await order.deleteOne();

  res.status(200).json({
    success: true,
  });
};

export const canReview = async (req, res) => {
  const productId = req.query.productId;

  const orders = await Order.find({
    user: req?.user?._id,
    "orderItems.product": productId,
  });

  let canReview = orders?.length >= 1 ? true : false;

  res.status(200).json({
    canReview,
  });
};

export const checkoutSession = async (req, res) => {
  try {
    const body = req.body;
    
    console.log('=== CHECKOUT SESSION START ===');
    console.log('User:', req?.user);
    console.log('Body:', JSON.stringify(body, null, 2));

    // Validate user
    if (!req?.user) {
      console.error('No user found in request');
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Validate cart items
    if (!body?.items || body.items.length === 0) {
      console.error('No items in cart');
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Validate shipping info
    if (!body?.shippingInfo) {
      console.error('No shipping info');
      return res.status(400).json({ message: "Shipping information is required" });
    }

    console.log('Creating line items...');
    
    // Use production URL directly
    const baseUrl = 'https://buyitnow.vercel.app';
    
    const line_items = body?.items?.map((item) => {
      // Convert relative image URLs to absolute URLs
      let imageUrl = item.image;
      if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
        imageUrl = `${baseUrl}${imageUrl}`;
      }
      
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            images: [imageUrl],
            metadata: { productId: item.product },
          },
          unit_amount: item.price * 100,
        },
        quantity: item.quantity,
      };
    });
    console.log('Line items created:', line_items.length);

    const shippingInfo = body?.shippingInfo;
    
    // Ensure _id is a string (handles both MongoDB ObjectId and string)
    const userId = req.user._id?.toString() || req.user._id;
    
    const sessionConfig = {
      payment_method_types: ["card"],
      success_url: `${baseUrl}/me/orders?order_success=true`,
      cancel_url: `${baseUrl}`,
      customer_email: req?.user?.email,
      client_reference_id: userId,
      mode: "payment",
      metadata: { shippingInfo: String(shippingInfo) },
      line_items,
    };
    
    console.log('Session config:', JSON.stringify(sessionConfig, null, 2));
    console.log('Creating Stripe session...');

    const session = await stripe.checkout.sessions.create(sessionConfig);
    
    console.log('Stripe session created successfully:', session.id);

    res.status(200).json({
      url: session.url,
    });
  } catch (error) {
    console.error("Checkout session error:", error);
    console.error("Error details:", {
      message: error.message,
      type: error.type,
      code: error.code,
      statusCode: error.statusCode,
    });
    res.status(500).json({ 
      message: "Failed to create checkout session",
      error: error.message,
      details: error.type || error.code
    });
  }
};


async function getCartItems(line_items) {
  return new Promise((resolve, reject) => {
    let cartItems = [];

    line_items?.data?.forEach(async (item) => {
      const product = await stripe.products.retrieve(item.price.product);
      const productId = product.metadata.productId;

      cartItems.push({
        product: productId,
        name: product.name,
        price: item.price.unit_amount_decimal / 100,
        quantity: item.quantity,
        image: product.images[0],
      });

      if (cartItems.length === line_items?.data.length) {
        resolve(cartItems);
      }
    });
  });
}


export const webhook = async (req, res) => {
  try {
    const rawBody = await getRawBody(req);
    const signature = req.headers["stripe-signature"];

    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const line_items = await stripe.checkout.sessions.listLineItems(
        event.data.object.id
      );

      console.log(line_items)

      const orderItems = await getCartItems(line_items);
      const userId = session.client_reference_id;
      const amountPaid = session.amount_total / 100;

      const paymentInfo = {
        id: session.payment_intent,
        status: session.payment_status,
        amountPaid,
        taxPaid: session.total_details.amount_tax / 100,
      };

      const orderData = {
        user: userId,
        shippingInfo: session.metadata.shippingInfo,
        paymentInfo,
        orderItems,
      };

      const order = await Order.create(orderData);
      res.status(201).json({ success: true });
    }
  } catch (error) {
    console.log(error);
  }
};
