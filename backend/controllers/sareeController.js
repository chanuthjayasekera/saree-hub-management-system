const Saree = require('../models/sareeModel');

function normalizeColors(colors){
  if(!colors) return [];
  if(Array.isArray(colors)){
    const arr = colors.map(c => String(c).trim()).filter(Boolean);
    // Fix legacy bug: ['R','e','d'] => ['Red']
    if(arr.length > 1 && arr.every(x => x.length === 1)) return [arr.join('')];
    return arr;
  }
  const s = String(colors);
  // if client sends "Red,Blue"
  if(s.includes(',')) return s.split(',').map(x => x.trim()).filter(Boolean);
  return [s.trim()].filter(Boolean);
}

// ✅ Add a new saree (ADMIN)
const addSaree = async (req, res) => {
  try {
    const { description, colors, dimensions, weight, blouseLength, marketedBy, price, inStock } = req.body;

    const colorArray = normalizeColors(colors);
    const photos = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    if(!description || !dimensions || !weight || !blouseLength || !marketedBy) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if(colorArray.length === 0) return res.status(400).json({ message: 'At least one color is required' });
    if(photos.length === 0) return res.status(400).json({ message: 'At least one photo is required' });

    const p = Number(price);
    if(!Number.isFinite(p) || p < 0) return res.status(400).json({ message: 'Price must be a valid number and cannot be negative' });

    const saree = new Saree({
      description: String(description).trim(),
      colors: [...new Set(colorArray)],
      dimensions: String(dimensions).trim(),
      weight: String(weight).trim(),
      blouseLength: String(blouseLength).trim(),
      marketedBy: String(marketedBy).trim(),
      price: p,
      inStock: String(inStock) === 'false' ? false : (inStock ?? true),
      photos,
    });

    await saree.save();
    res.status(201).json(saree);

  } catch (error) {
    console.error('addSaree error', error);
    res.status(500).json({ message: 'Error creating saree' });
  }
};

// ✅ Get all sarees (PUBLIC)
const getAllSarees = async (req, res) => {
  try {
    const sarees = await Saree.find({}, 'description colors dimensions weight blouseLength marketedBy price inStock photos createdAt updatedAt')
      .sort({ createdAt: -1 });

    if (!sarees || sarees.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(sarees);
  } catch (error) {
    console.error('❌ Error fetching sarees:', error);
    res.status(500).json({ message: 'Error fetching sarees', error: error.message });
  }
};

// ✅ Get saree by ID (PUBLIC)
const getSareeById = async (req, res) => {
  try {
    const saree = await Saree.findById(req.params.id);
    if (!saree) {
      return res.status(404).json({ message: 'Saree not found' });
    }
    res.status(200).json(saree);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching saree details', error: error.message });
  }
};

// ✅ Update saree (ADMIN)
const updateSaree = async (req, res) => {
  try {
    const { sareeId } = req.params;
    const updateData = { ...req.body };

    const saree = await Saree.findById(sareeId);
    if (!saree) {
      return res.status(404).json({ message: 'Saree not found' });
    }

    if (updateData.price !== undefined) {
      const p = Number(updateData.price);
      if (!Number.isFinite(p) || p < 0) return res.status(400).json({ message: 'Price must be a valid number and cannot be negative' });
      updateData.price = p;
    }

    if (updateData.colors !== undefined) {
      updateData.colors = [...new Set(normalizeColors(updateData.colors))];
      if(updateData.colors.length === 0) return res.status(400).json({ message: 'At least one color is required' });
    }

    if (updateData.inStock !== undefined) {
      updateData.inStock = String(updateData.inStock) === 'false' ? false : true;
    }

    if (req.files && req.files.length > 0) {
      if (req.files.length > 3) {
        return res.status(400).json({ message: 'You can upload up to 3 photos only' });
      }
      updateData.photos = req.files.map(file => `/uploads/${file.filename}`);
    }

    const updatedSaree = await Saree.findByIdAndUpdate(sareeId, updateData, { new: true });
    res.status(200).json(updatedSaree);
  } catch (error) {
    res.status(500).json({ message: 'Error updating saree', error: error.message });
  }
};

// ✅ Delete saree (ADMIN)
const deleteSaree = async (req, res) => {
  try {
    const { sareeId } = req.params;
    const saree = await Saree.findByIdAndDelete(sareeId);
    if (!saree) {
      return res.status(404).json({ message: 'Saree not found' });
    }
    res.status(200).json({ message: 'Saree deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting saree', error: error.message });
  }
};

module.exports = {
  addSaree,
  getAllSarees,
  getSareeById,
  updateSaree,
  deleteSaree
};
