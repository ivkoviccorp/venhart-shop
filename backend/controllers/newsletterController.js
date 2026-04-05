const NewsletterSubscriber = require('../models/NewsletterSubscriber');

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter
exports.subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email je obavezan'
      });
    }

    const existingSubscriber = await NewsletterSubscriber.findOne({ email });

    if (existingSubscriber) {
      return res.status(400).json({
        success: false,
        message: 'Ova email adresa je već prijavljena na newsletter'
      });
    }

    const subscriber = await NewsletterSubscriber.create({ email });

    res.status(201).json({
      success: true,
      message: 'Uspešno ste prijavljeni na newsletter',
      subscriber
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all newsletter subscribers (Admin)
// @route   GET /api/newsletter
exports.getSubscribers = async (req, res) => {
  try {
    const subscribers = await NewsletterSubscriber.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: subscribers.length,
      subscribers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete subscriber
// @route   DELETE /api/newsletter/:id
exports.deleteSubscriber = async (req, res) => {
  try {
    const subscriber = await NewsletterSubscriber.findById(req.params.id);

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Email nije pronađen'
      });
    }

    await NewsletterSubscriber.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Email obrisan iz newsletter liste'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};