import { Router } from "express";
import auth from "../middleware/auth.js";
import { addToCartItemController, deleteCartItemQtyController, getCartItemController, updateCartItemQtyController, addToSaveForLaterController, removeFromSaveForLaterController, getSaveForLaterController } from "../controllers/cart.controller.js";

const cartRouter = Router()

cartRouter.post('/create',auth,addToCartItemController)
cartRouter.get("/get",auth,getCartItemController)
cartRouter.put('/update-qty',auth,updateCartItemQtyController)
cartRouter.delete('/delete-cart-item',auth,deleteCartItemQtyController)

// Save for Later routes
cartRouter.post('/save-for-later/add', auth, addToSaveForLaterController);
cartRouter.delete('/save-for-later/remove', auth, removeFromSaveForLaterController);
cartRouter.get('/save-for-later/get', auth, getSaveForLaterController);

export default cartRouter