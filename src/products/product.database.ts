import { Product, Products, UnitProduct } from "./product.interface";
import { v4 as random } from "uuid";
import fs from "fs";

let products: Products = loadProducts();

//reads data from products.json
function loadProducts(): Products{
    try{
        const data = fs.readFileSync("./products.json", "utf-8");
        return JSON.parse(data);
    }catch(error){
        console.log(`Error ${error}`);
        return {};
    };
};

//saves product object to products.json
function saveProducts() {
    try{
        fs.writeFileSync("./products.json", JSON.stringify(products), "utf-8");
        console.log("Products saved successfully")
    }catch(error){
        console.log("Error", error)
    };
};

//promise resolves to an array of unitProduct objects
//extracts products from product object
export const findAll = async () : Promise<UnitProduct[]> => Object.values(products);

//promise resolves to UnitUser object corresponding w/ id in products object
export const findOne = async (id: string) : Promise<UnitProduct> => products[id];

//promise resolves to a newly created UnitUser object
export const create = async (productInfo : Product) : Promise< null | UnitProduct> => {
    let id = random();
    let product = await findOne(id);
    while(product){
        id = random();
        await findOne(id);
    }
    products[id] = {
        id: id,
        ...productInfo
    }
      saveProducts();
      return products[id];
}

export const remove = async(id: string) : Promise<null | void> => {
  const product = await findOne(id);
  if(!product){
    return null;
  }
  delete products[id];
  saveProducts();
}