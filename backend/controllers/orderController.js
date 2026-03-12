const Order = require('../models/Order');
const { sendOrderConfirmation, sendAdminNotification, sendOrderAccepted, sendOrderRejected } = require('../utils/sendEmail');

// @desc    Create new order
// @route   POST /api/orders
exports.createOrder = async (req, res) => {
  try {
    console.log('=== NOVA PORUDŽBINA ===');
    console.log('Body:', JSON.stringify(req.body, null, 2));
    
    const { customer, items, deliveryMethod, shippingAddress, shippingCost, totalAmount, giftWrap } = req.body;

    console.log('Kreiranje porudžbine...');
    
    const order = await Order.create({
      customer,
      items,
      deliveryMethod,
      shippingAddress: deliveryMethod === 'delivery' ? shippingAddress : undefined,
      shippingCost: shippingCost || 0,
      giftWrap: giftWrap || false,
      totalAmount
    });

    console.log('Porudžbina kreirana:', order.orderNumber);

    // Pošalji emailove
    try {
      console.log('Slanje emaila kupcu...');
      await sendOrderConfirmation(order);
      console.log('Email kupcu poslat!');
      
      console.log('Slanje emaila adminu...');
      await sendAdminNotification(order);
      console.log('Email adminu poslat!');
    } catch (emailError) {
      console.error('Email error:', emailError.message);
    }

    res.status(201).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('=== GREŠKA PRI KREIRANJU PORUDŽBINE ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
exports.getOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    let query = {};
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Order.countDocuments(query);

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('items.product', 'name images');

    const pendingCount = await Order.countDocuments({ status: 'pending' });

    res.json({
      success: true,
      count: orders.length,
      total,
      pendingCount,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single order (Admin)
// @route   GET /api/orders/:id
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name images price');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Porudžbina nije pronađena'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, rejectionReason, adminNote } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Porudžbina nije pronađena'
      });
    }

    order.status = status;
    if (rejectionReason) order.rejectionReason = rejectionReason;
    if (adminNote) order.adminNote = adminNote;

    await order.save();

    try {
      if (status === 'accepted') {
        await sendOrderAccepted(order);
      } else if (status === 'rejected') {
        await sendOrderRejected(order);
      }
    } catch (emailError) {
      console.error('Email error:', emailError);
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get order by order number (for customer tracking)
// @route   GET /api/orders/track/:orderNumber
exports.trackOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Porudžbina nije pronađena'
      });
    }

    res.json({
      success: true,
      order: {
        orderNumber: order.orderNumber,
        status: order.status,
        items: order.items,
        totalAmount: order.totalAmount,
        deliveryMethod: order.deliveryMethod,
        createdAt: order.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get dashboard stats (Admin)
// @route   GET /api/orders/admin/stats
exports.getDashboardStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const acceptedOrders = await Order.countDocuments({ status: 'accepted' });
    const rejectedOrders = await Order.countDocuments({ status: 'rejected' });

    const revenueResult = await Order.aggregate([
      { $match: { status: { $in: ['accepted', 'shipped', 'delivered'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        acceptedOrders,
        rejectedOrders,
        totalRevenue,
        recentOrders
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete single order (Admin)
// @route   DELETE /api/orders/:id
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Porudžbina nije pronađena'
      });
    }

    await Order.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Porudžbina obrisana'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete all orders (Admin) - RESET
// @route   DELETE /api/orders/admin/reset-all
exports.deleteAllOrders = async (req, res) => {
  try {
    await Order.deleteMany({});

    res.json({
      success: true,
      message: 'Sve porudžbine su obrisane'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};