const Order = require('../models/orderModel');
const Saree = require('../models/sareeModel');
const User = require('../models/userModel');

function normalizeItems(items){
  if(!Array.isArray(items) || items.length === 0) return [];
  return items
    .map(it => ({
      sareeId: it.sareeId || it.saree || it._id,
      qty: Number(it.qty || 1)
    }))
    .filter(it => it.sareeId && Number.isFinite(it.qty) && it.qty > 0);
}

// USER: create order (cash or card mock)
async function createOrder(req, res){
  try{
    const { items, paymentMethod, card } = req.body || {};
    const method = String(paymentMethod || '').toUpperCase();

    if(!['CASH','CARD'].includes(method)) return res.status(400).json({ message: 'Invalid payment method' });

    const norm = normalizeItems(items);
    if(norm.length === 0) return res.status(400).json({ message: 'Cart is empty' });

    // fetch sarees and compute total from DB prices (prevents tampering)
    const ids = norm.map(i => i.sareeId);
    const sarees = await Saree.find({ _id: { $in: ids } });
    const map = new Map(sarees.map(s => [s._id.toString(), s]));

    const orderItems = [];
    let total = 0;

    for(const it of norm){
      const s = map.get(String(it.sareeId));
      if(!s) return res.status(400).json({ message: 'One or more sarees not found' });
      if(!s.inStock) return res.status(400).json({ message: `Saree out of stock: ${s.description}` });
      const line = s.price * it.qty;
      total += line;
      orderItems.push({
        saree: s._id,
        qty: it.qty,
        priceAtPurchase: s.price,
        title: s.description
      });
    }

    let paymentStatus = 'PENDING';
    let cardLast4 = '';

    if(method === 'CARD'){
      const number = String(card?.number || '').replace(/\s+/g,'');
      const exp = String(card?.exp || '');
      const cvc = String(card?.cvc || '');

      // mock validation (no real processing)
      if(number.length < 12 || number.length > 19) return res.status(400).json({ message: 'Invalid card number' });
      if(!/^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/.test(exp)) return res.status(400).json({ message: 'Invalid expiry (MM/YY)' });
      if(cvc.length < 3 || cvc.length > 4) return res.status(400).json({ message: 'Invalid CVC' });

      cardLast4 = number.slice(-4);
      paymentStatus = 'PAID';
    }

        // snapshot delivery location from user profile
    const me = await User.findById(req.user.id).select('location');
    const deliveryLocation = String(me?.location || '').trim();
    if(!deliveryLocation){
      return res.status(400).json({ message: 'Please add your delivery location in Profile before placing an order.' });
    }
const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      total,
      paymentMethod: method,
      paymentStatus,
      cardLast4,
      status: 'PENDING',
      deliveryLocation,
      deliveryEtaDays: 3
    });

    res.status(201).json(order);
  }catch(e){
    console.error('createOrder error', e);
    res.status(500).json({ message: 'Server error' });
  }
}

// USER: my orders
async function listMyOrders(req, res){
  try{
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('items.saree', 'photos description price');
    res.json(orders);
  }catch(e){
    console.error('listMyOrders error', e);
    res.status(500).json({ message: 'Server error' });
  }
}

// ADMIN: list all orders
async function listAllOrders(req, res){
  try{
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .populate('user', 'name email role location')
      .populate('items.saree', 'photos description price');
    res.json(orders);
  }catch(e){
    console.error('listAllOrders error', e);
    res.status(500).json({ message: 'Server error' });
  }
}

// ADMIN: update status
async function updateOrderStatus(req, res){
  try{
    const { id } = req.params;
    const { status, note } = req.body || {};
    const s = String(status || '').toUpperCase();
    if(!['PENDING','VERIFYING','ACCEPTED','DONE','REJECTED'].includes(s)) return res.status(400).json({ message: 'Invalid status' });

    const order = await Order.findByIdAndUpdate(
      id,
      { status: s, note: String(note || '').slice(0, 300) },
      { new: true }
    )
      .populate('user', 'name email role location')
      .populate('items.saree', 'photos description price');

    if(!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  }catch(e){
    console.error('updateOrderStatus error', e);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { createOrder, listMyOrders, listAllOrders, updateOrderStatus };
