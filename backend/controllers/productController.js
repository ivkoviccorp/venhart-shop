const Product = require('../models/Product');
const { cloudinary } = require('../middleware/upload');

// @desc    Get all products
// @route   GET /api/products
exports.getProducts = async (req, res) => {
  try {
    const {
      category,
      gender,
      featured,
      onSale,
      search,
      sort,
      page = 1,
      limit = 100
    } = req.query;

    let query = { active: true };

    if (category) query.category = category;
    if (gender) query.gender = gender;
    if (featured) query.featured = featured === 'true';
    if (onSale) query.onSale = onSale === 'true';

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };
    if (sort === 'newest') sortOption = { createdAt: -1 };
    if (sort === 'name') sortOption = { name: 1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Product.countDocuments(query);

    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Proizvod nije pronađen'
      });
    }

    res.json({
      success: true,
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create product (Admin)
// @route   POST /api/products
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      oldPrice,
      category,
      sizes,
      colors,
      featured,
      isNew,
      onSale,
      gender
    } = req.body;

    const images = req.files ? req.files.map(file => ({
      url: file.path,
      publicId: file.filename
    })) : [];

    let parsedSizes = sizes;
    let parsedColors = colors;

    if (typeof sizes === 'string') {
      parsedSizes = JSON.parse(sizes);
    }
    if (typeof colors === 'string') {
      parsedColors = JSON.parse(colors);
    }

    const product = await Product.create({
      name,
      description,
      price: parseFloat(price),
      oldPrice: oldPrice ? parseFloat(oldPrice) : null,
      images,
      category,
      sizes: parsedSizes,
      colors: parsedColors,
      gender,
      featured: featured === 'true' || featured === true,
      isNew: isNew === 'true' || isNew === true,
      onSale: onSale === 'true' || onSale === true
    });

    res.status(201).json({
      success: true,
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update product (Admin)
// @route   PUT /api/products/:id
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Proizvod nije pronađen'
      });
    }

    const updateData = { ...req.body };

    if (typeof updateData.sizes === 'string') {
      updateData.sizes = JSON.parse(updateData.sizes);
    }
    if (typeof updateData.colors === 'string') {
      updateData.colors = JSON.parse(updateData.colors);
    }
    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.oldPrice) updateData.oldPrice = parseFloat(updateData.oldPrice);

    ['featured', 'isNew', 'onSale', 'active'].forEach(field => {
      if (updateData[field] !== undefined) {
        updateData[field] = updateData[field] === 'true' || updateData[field] === true;
      }
    });

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => ({
        url: file.path,
        publicId: file.filename
      }));

      if (updateData.replaceImages === 'true') {
        for (const img of product.images) {
          await cloudinary.uploader.destroy(img.publicId);
        }
        updateData.images = newImages;
      } else {
        updateData.images = [...product.images, ...newImages];
      }
    }

    delete updateData.replaceImages;

    product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete product image (Admin)
// @route   DELETE /api/products/:id/image
exports.deleteProductImage = async (req, res) => {
  try {
    const { publicId } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Proizvod nije pronađen'
      });
    }

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID slike nije prosleđen'
      });
    }

    await cloudinary.uploader.destroy(publicId);

    product.images = product.images.filter(img => img.publicId !== publicId);
    await product.save();

    res.json({
      success: true,
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete product (Admin)
// @route   DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Proizvod nije pronađen'
      });
    }

    for (const img of product.images) {
      await cloudinary.uploader.destroy(img.publicId);
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Proizvod obrisan'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all products including inactive (Admin)
// @route   GET /api/products/admin/all
exports.getAllProductsAdmin = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};