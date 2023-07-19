import express, {Request, Response} from "express";
import { Product, UnitProduct } from "./product.interface";
import * as database from "./product.database";
import { StatusCodes } from "http-status-codes";

export const productRouter = express.Router();

//retrieve all products
productRouter.get("/products", async(req: Request, res: Response) => {
    try{
        const allProducts = await database.findAll();
        if(!allProducts){
            return res.status(StatusCodes.NOT_FOUND).json({error: `No products found!`});
        }
        return res.status(StatusCodes.OK).json({total: allProducts.length, allProducts});
    }catch(error){
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error});
    };
});

//retrieve one specific product according to id
productRouter.get("/product/:id", async(req : Request, res : Response) => {
    try{
        const product = await database.findOne(req.params.id);
        if(!product){
            return res.status(StatusCodes.NOT_FOUND).json({error: "Product does not exist"});
        }
        return res.status(StatusCodes.OK).json({product})
    }catch(error){
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error})
    };
});

//creates a new product and adds it to the database
productRouter.post("/product", async(req : Request, res : Response) => {
    try{
        const {name, price, quantity, image} = req.body;
        if(!name || !price || !quantity || !image){
            return res.status(StatusCodes.BAD_REQUEST).json({error: `Please complete all required fields`});
        }
        const newProduct = await database.create({...req.body});
        return res.status(StatusCodes.CREATED).json({newProduct});
    }catch(error){
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error})
    };
});

//updates a specified product according to id
productRouter.put("/product/:id", async(req : Request, res : Response) => {
    try{
        const id = req.params.id;
        const newProduct = req.body;
        const findProduct = await database.findOne(id);
        if(!findProduct){
            return res.status(StatusCodes.NOT_FOUND).json({error: `Product not found`});
        }
        const updateProduct = await database.update(id, newProduct);
        return res.status(StatusCodes.OK).json({updateProduct});
    }catch(error){
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error});
    };
});

//deletes a specified product according to id
productRouter.delete("/product/:id", async(req : Request, res : Response) => {
    try{
        const getProduct = await database.findOne(req.params.id);
        if(!getProduct){
            return res.status(StatusCodes.NOT_FOUND).json({error: `No product with ID ${req.params.id}`});
        }
        await database.remove(req.params.id);
        return res.status(StatusCodes.OK).json({msg: `Product has been deleted`});
    }catch(error){
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error})
    };
});