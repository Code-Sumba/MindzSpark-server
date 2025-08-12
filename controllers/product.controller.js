import ProductModel from "../models/product.model.js";
import mongoose from 'mongoose';
import CategoryModel from '../models/category.model.js';
import SubCategoryModel from '../models/subCategory.model.js';

export const createProductController = async(request,response)=>{
    try {
        const { 
            name ,
            image ,
            category,
            subCategory,
            unit,
            stock,
            price,
            discount,
            description,
            more_details,
            seller
        } = request.body 

        if(!name || !image[0] || !category[0] || !subCategory[0] || !unit || !price || !description ){
            return response.status(400).json({
                message : "Enter required fields",
                error : true,
                success : false
            })
        }

        const product = new ProductModel({
            name ,
            image ,
            category,
            subCategory,
            unit,
            stock,
            price,
            discount,
            description,
            more_details,
            seller
        })
        const saveProduct = await product.save()

        return response.json({
            message : "Product Created Successfully",
            data : saveProduct,
            error : false,
            success : true
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const getProductController = async(request,response)=>{
    try {
        
        let { page, limit, search } = request.body 

        if(!page){
            page = 1
        }

        if(!limit){
            limit = 10
        }

        const query = search ? {
            $text : {
                $search : search
            }
        } : {}

        const skip = (page - 1) * limit

        const [data,totalCount] = await Promise.all([
            ProductModel.find(query).sort({createdAt : -1 }).skip(skip).limit(limit).populate('category subCategory'),
            ProductModel.countDocuments(query)
        ])

        return response.json({
            message : "Product data",
            error : false,
            success : true,
            totalCount : totalCount,
            totalNoPage : Math.ceil( totalCount / limit),
            data : data
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const getProductByCategory = async(request,response)=>{
    try {
        const { id } = request.body 

        if(!id){
            return response.status(400).json({
                message : "provide category id",
                error : true,
                success : false
            })
        }

        const product = await ProductModel.find({ 
            category : { $in : id }
        }).limit(15)

        return response.json({
            message : "category product list",
            data : product,
            error : false,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const getProductByCategoryAndSubCategory  = async(request,response)=>{
    try {
        const { categoryId,subCategoryId,page,limit } = request.body

        if(!categoryId || !subCategoryId){
            return response.status(400).json({
                message : "Provide categoryId and subCategoryId",
                error : true,
                success : false
            })
        }

        if(!page){
            page = 1
        }

        if(!limit){
            limit = 10
        }

        const query = {
            category : { $in :categoryId  },
            subCategory : { $in : subCategoryId }
        }

        const skip = (page - 1) * limit

        const [data,dataCount] = await Promise.all([
            ProductModel.find(query).sort({createdAt : -1 }).skip(skip).limit(limit),
            ProductModel.countDocuments(query)
        ])

        return response.json({
            message : "Product list",
            data : data,
            totalCount : dataCount,
            page : page,
            limit : limit,
            success : true,
            error : false
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const getProductDetails = async(request,response)=>{
    try {
        const { productId } = request.body 

        const product = await ProductModel.findOne({ _id : productId })
        console.log("product:", product)


        return response.json({
            message : "product details",
            data : product,
            error : false,
            success : true
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

//update product
export const updateProductDetails = async(request,response)=>{
    try {
        const { _id } = request.body 

        if(!_id){
            return response.status(400).json({
                message : "provide product _id",
                error : true,
                success : false
            })
        }

        const updateProduct = await ProductModel.updateOne({ _id : _id },{
            ...request.body
        })

        return response.json({
            message : "updated successfully",
            data : updateProduct,
            error : false,
            success : true
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

//delete product
export const deleteProductDetails = async(request,response)=>{
    try {
        const { _id } = request.body 

        if(!_id){
            return response.status(400).json({
                message : "provide _id ",
                error : true,
                success : false
            })
        }

        const deleteProduct = await ProductModel.deleteOne({_id : _id })

        return response.json({
            message : "Delete successfully",
            error : false,
            success : true,
            data : deleteProduct
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

//search product
export const searchProduct = async(request,response)=>{
    try {
        let { search, page , limit, sort, minPrice, maxPrice, category, subCategory, discount, inStock, newArrivals } = request.body 

        if(!page){
            page = 1
        }
        if(!limit){
            limit  = 10
        }

        // Build query object
        const query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        if (category) {
            query.category = { $in: [category] };
        }
        if (subCategory) {
            if (Array.isArray(subCategory)) {
                const validSubCats = subCategory.filter(id => mongoose.Types.ObjectId.isValid(id));
                if (validSubCats.length > 0) {
                    query.subCategory = { $in: validSubCats };
                }
            } else if (mongoose.Types.ObjectId.isValid(subCategory)) {
                query.subCategory = { $in: [subCategory] };
            }
        }
        if (minPrice) {
            query.price = { ...query.price, $gte: Number(minPrice) };
        }
        if (maxPrice) {
            query.price = { ...query.price, $lte: Number(maxPrice) };
        }
        if (discount) {
            query.discount = { $gte: Number(discount) };
        }
        if (inStock) {
            query.stock = { $gt: 0 };
        }
        if (newArrivals) {
            // Example: products created in the last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            query.createdAt = { $gte: thirtyDaysAgo };
        }

        // Sorting logic
        let sortOption = { createdAt: -1 };
        if (sort === 'priceLowToHigh') sortOption = { price: 1 };
        if (sort === 'priceHighToLow') sortOption = { price: -1 };
        if (sort === 'newest') sortOption = { createdAt: -1 };

        const skip = ( page - 1) * limit

        const [data,dataCount] = await Promise.all([
            ProductModel.find(query).sort(sortOption).skip(skip).limit(limit).populate('category subCategory'),
            ProductModel.countDocuments(query)
        ])
        console.log("Response form search product")

        return response.json({
            message : "Product data",
            error : false,
            success : true,
            data : data,
            totalCount :dataCount,
            totalPage : Math.ceil(dataCount/limit),
            page : page,
            limit : limit 
        })


    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export async function getAllProducts(req, res) {
    try {
        const products = await ProductModel.find();
        return res.json({
            message: "Products fetched successfully",
            data: products,
            error: false,
            success: true
        });
    } catch (error) {
        console.error("Error in getAllProducts:", error.message);
        console.error("Error in getAllProducts:", error);
        return res.status(500).json({
            message: "Something went wrong",
            error: true,
            success: false
        });
    }
}

export const bulkUploadProducts = async (req, res) => {
  try {
    const { products } = req.body;
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ success: false, message: 'No products provided', error: true });
    }
    const created = [];
    const errors = [];
    for (const prod of products) {
      try {
        // CATEGORY
        let categoryIds = [];
        if (Array.isArray(prod.category)) {
          for (const catName of prod.category) {
            let cat = await CategoryModel.findOne({ name: catName });
            if (!cat) {
              cat = await CategoryModel.create({ name: catName, image: 'https://via.placeholder.com/150' });
            }
            categoryIds.push(cat._id);
          }
        }
        // SUBCATEGORY
        let subCategoryIds = [];
        if (Array.isArray(prod.subCategory)) {
          for (const subCatName of prod.subCategory) {
            let subCat = await SubCategoryModel.findOne({ name: subCatName });
            if (!subCat) {
              // Link to first category if available
              subCat = await SubCategoryModel.create({ name: subCatName, image: 'https://via.placeholder.com/150', category: categoryIds.length ? [categoryIds[0]] : [] });
            }
            subCategoryIds.push(subCat._id);
          }
        }
        // PRODUCT
        const product = new ProductModel({
          ...prod,
          category: categoryIds,
          subCategory: subCategoryIds
        });
        await product.save();
        created.push(product);
      } catch (err) {
        errors.push({ product: prod.name, error: err.message });
      }
    }
    res.json({ success: true, createdCount: created.length, errorCount: errors.length, created, errors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || error, error: true });
  }
};

export const getProductsBySeller = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const products = await ProductModel.find({ seller: sellerId });
    return res.json({
      message: "Seller's products fetched successfully",
      data: products,
      error: false,
      success: true
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
};