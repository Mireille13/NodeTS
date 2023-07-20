import { User, UnitUser, Users } from "./user.interface";
import bcrypt from "bcryptjs";
import {v4 as random} from "uuid";
import fs from "fs";

//database logic

let users : Users = loadUsers();

//reads data from users.json
function loadUsers(): Users {
    try {
        const data = fs.readFileSync("./users.json", "utf-8");
        return JSON.parse(data);
    }catch(error) {
        console.log(`Error ${error}`);
        return {};
    }
}

//saves the users object to users.json
function saveUsers() {
    try {
        fs.writeFileSync("./users.json", JSON.stringify(users), "utf-8");
        console.log(`User saved successfully!`);
    }catch(error) {
        console.log(`Error : ${error}`);
    }
}

//promise resolves to an array of UnitUser objects. 
//Object.values(users) extracts users from users object
export const findAll = async (): Promise<UnitUser[]> => Object.values(users);

//promise resolves to UnitUser object corresponding w/ id in users object
export const findOne = async (id: string): Promise<UnitUser> => users[id];

//promise resolves to a newly created UnitUser object
export const create = async (userData: UnitUser): Promise<null | UnitUser> => {

    let id = random();
    let check_user = await findOne(id);
    while(check_user) {
        id = random();
        check_user = await findOne(id);
    };
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const user: UnitUser = {
        id: id,
        username: userData.username,
        email: userData.email,
        password: hashedPassword
    };
    users[id] = user;
    saveUsers();
    return user;
};

//promise resolves to a UnitUser object if a user w/ the specified email exists or not
export const findByEmail = async (user_email: string) : Promise<null | UnitUser> => {
    const allUsers = await findAll();
    const getUser = allUsers.find(result => user_email === result.email);
    if(!getUser){
        return null;
    };
    return getUser;
};

//checks to see if provided password matches user's stored password or not
export const comparePassword = async (email : string, supplied_password : string): Promise<null | UnitUser> => {
    const user = await findByEmail(email)
    const decryptPassword = await bcrypt.compare(supplied_password, user!.password);
    if(!decryptPassword){
        return null;
    }
    return user;
} 

//updates UnitUser object if user w/ specified id exists
export const update = async(id : string, updateValues : User): Promise<UnitUser | null> => {
    const userExists = await findOne(id);
    if(!userExists){
        return null;
    }
    if(updateValues.password){
        const salt = await bcrypt.genSalt(10);
        const newPass = await bcrypt.hash(updateValues.password, salt);

        updateValues.password = newPass
    }
    users[id] = {
        ...userExists,
        ...updateValues
    }
    saveUsers();
    return users[id];
}

//checks to see if user id exists and deletes user from users object
export const remove = async(id : string): Promise<null | void> => {
    const user = await findOne(id);
    if(!user){
        return null;
    }
    delete users[id];
    saveUsers();
}