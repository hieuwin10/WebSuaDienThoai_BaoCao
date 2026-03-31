const mongoose = require('mongoose');
const categoryModel = require('./schemas/categories');
const productModel = require('./schemas/products');
const inventoryModel = require('./schemas/inventories');
require('dotenv').config();

async function test() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // 1. Tạo Category test
    console.log('--- Testing Category ---');
    const existingCat = await categoryModel.findOne({ name: 'Dien Thoai Test' });
    if (existingCat) await categoryModel.deleteOne({ _id: existingCat._id });
    
    const newCat = new categoryModel({
      name: 'Dien Thoai Test',
      slug: 'dien-thoai-test',
      description: 'Mo ta dien thoai test'
    });
    await newCat.save();
    console.log('Created Category:', newCat.name);

    // 2. Tạo Product test
    console.log('\n--- Testing Product & Inventory ---');
    const existingProd = await productModel.findOne({ sku: 'PROD-TEST-001' });
    if (existingProd) {
       await productModel.deleteOne({ _id: existingProd._id });
       await inventoryModel.deleteOne({ product: existingProd._id });
    }

    const newProd = new productModel({
      sku: 'PROD-TEST-001',
      title: 'iPhone Test Edition',
      price: 10000000,
      category: newCat._id
    });
    await newProd.save();
    console.log('Created Product:', newProd.title);

    const newInv = new inventoryModel({
      product: newProd._id,
      quantity: 50
    });
    await newInv.save();
    console.log('Created Inventory for Product, Quantity:', newInv.quantity);

    // 3. Verify Populate
    const populatedProd = await productModel.findById(newProd._id).populate('category');
    console.log('\n--- Product Population Check ---');
    console.log('Product Category Name:', populatedProd.category.name);

    await mongoose.connection.close();
    console.log('\nTest completed successfully');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

test();
