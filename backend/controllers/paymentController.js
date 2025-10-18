import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Stripe from "stripe";
import ErrorHandler from "../utils/errorHandler.js";

// ✅ Use 'Order' model naming convention
import Order from "../models/orders.js"; 


// Initialize Stripe with the secret key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// --- HELPER FUNCTION: Get Order Items from Stripe Line Items (Kept as is - it's correct) ---
/**
 * Retrieves product details from Stripe Line Items for order creation.
 * NOTE: This is an expensive operation due to multiple API calls.
 * @param {object} line_items - The result from stripe.checkout.sessions.listLineItems()
 * @returns {Promise<Array<object>>} Array of formatted order items
 */
const getOrderItems = async (line_items) => {
    // Use Promise.all to fetch product details concurrently (much faster)
    const itemPromises = line_items.data.map(async (item) => {
        // Fetch product details using the product ID stored in the price object
        const product = await stripe.products.retrieve(item.price.product);
        const productId = product.metadata.productId;

        return {
            name: product.name, 
            quantity: item.quantity,
            image: product.images && product.images.length > 0 ? product.images[0] : 'default_image_url', 
            price: item.price.unit_amount / 100,
            product: productId, 
        };
    });

    return Promise.all(itemPromises);
};
// -----------------------------------------------------------------


// create payment Check session for stripe => api/v1/payment/checkout-session
export const StripecheckoutSession = catchAsyncErrors(async (req, res, next) => {
    // ... (StripecheckoutSession logic remains the same - it's correct) ...
    if (!req.user || !req.user.email || !req.user._id) {
        return next(new ErrorHandler("User not authenticated or session expired.", 401));
    }
    
    const body = req.body;

    if (!body || !body.orderItems || !Array.isArray(body.orderItems) || body.orderItems.length === 0) {
        return next(new ErrorHandler("Order items are missing or invalid.", 400));
    }

    const line_items = body.orderItems.map(item => {
        
        const imageURL = item.image; 
        let finalImageURL = imageURL;
        if (imageURL && imageURL.startsWith('/')) {
            finalImageURL = `${process.env.FRONTEND_URL}${imageURL}`; 
        }

        if (!item.price || typeof item.price !== 'number' || !item.quantity || item.quantity <= 0) {
            console.error(`Skipping item due to invalid data: ${item.name}`);
            return null; 
        }

        const imagesArray = finalImageURL && finalImageURL !== 'default_url_needed_by_schema' ? [finalImageURL] : [];

        return {
            price_data: {
                currency: 'usd', 
                product_data: {
                    name: item.name,
                    images: imagesArray,
                    metadata: { productId: item.product.toString() } 
                },
                unit_amount: Math.round(item.price * 100), 
            },
            tax_rates: ['txr_1SGh0aA7DmU5tXKVKMN8brN6'], 
            quantity: item.quantity,
        };
    }).filter(item => item !== null); 

    if (line_items.length === 0) {
        return next(new ErrorHandler("Failed to prepare any line items for Stripe checkout.", 400));
    }

    const shippingRate = body.itemsPrice >= 200 
        ? 'shr_1SGi2nA7DmU5tXKV100gzzNG' 
        : 'shr_1SGi3mA7DmU5tXKVSAhKMprx'; 

    const sessionParams = {
        payment_method_types: ['card'],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/me/orders?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/payment_method`, 
        customer_email: req.user.email,
        client_reference_id: req.user._id.toString(),
        
        metadata: { 
            ...body.shippingInfo, 
            itemsPrice: body.itemsPrice?.toString() || '0', 
            taxAmount: body.taxAmount?.toString() || '0', 
            shippingAmount: body.shippingAmount?.toString() || '0', 
            totalAmount: body.totalAmount?.toString() || '0',
            userId: req.user._id.toString(), 
        },
        
        shipping_options: [
            { shipping_rate: shippingRate },
        ],
        line_items,
    };
    
    const session = await stripe.checkout.sessions.create(sessionParams);

    res.status(200).json({
        url: session.url,
        sessionId: session.id,
    });
});


// create Stripe Checkout webhook to listen the checkout session status
export const stripeWebhook = catchAsyncErrors(async (req, res, next) => {

    try {
        const sig = req.headers['stripe-signature'];

        const event = stripe.webhooks.constructEvent(
            req.rawBody, 
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );

        const session = event.data.object; 

        if (event.type === 'checkout.session.completed') {
            console.log(`Checkout session completed for session ID: ${session.id}`);

            const line_items = await stripe.checkout.sessions.listLineItems(
                session.id
            );
            
            const orderItems = await getOrderItems(line_items);

            const user = session.client_reference_id;

            // ✅ FIX 2: Ensure itemsPrice is parsed to a number before being used in Mongoose
            // Stripe total details are in cents, but itemsPrice came from metadata as a string.
            const itemsPrice = parseFloat(session.metadata.itemsPrice); 
            
            // Stripe returns amounts in cents (integer). Divide by 100 for dollar/currency value.
            const totalAmount = session.amount_total / 100;
            const taxAmount = session.total_details.amount_tax / 100;
            const shippingAmount = session.total_details.amount_shipping / 100;
            
            const shippingInfo = {
                // The shipping fields are pulled from metadata since Stripe Shipping Address Collection
                // was not configured. This assumes the frontend sent all address fields in the body.
                address: session.metadata.address,
                city: session.metadata.city,
                state: session.metadata.state,  
                country: session.metadata.country,
                postalCode: session.metadata.postalCode,
                phoneNo: session.metadata.phoneNo,
            };
            const paymentInfo = {
                id: session.payment_intent,
                status: session.payment_status,
            };

            const orderData = {
                shippingInfo,
                orderItems, 
                itemsPrice,
                taxAmount,
                shippingAmount,
                totalAmount,
                paymentInfo,
                paymentMethod: 'Card', // Renamed to lowercase 'paymentMethod' for consistency
                user, // user ID
            };

            // ✅ Use the imported Order model
            await Order.create(orderData); 
            
            console.log("Order successfully created in database.");
        }
        
        // Must send a 200 response to Stripe to acknowledge the event
        res.status(200).json({ received: true });

    } catch (error) {
        console.error("Webhook processing failed:", error.message, error.stack); 
        return res.status(400).send(`Webhook Error: ${error.message}`);
    }
});