import { User } from "../entities/user";
import { usertModel } from "./userModel";

export async function saveUser(user: User) {

    return usertModel.create(user);

}

export async function findUserById(id: String): Promise<User | null> {

    return usertModel.findById(id).exec;

}

export async function findAllUsers(): Promise<User[]> {

    return usertModel.find().sort({name: 1}).exec();

}

export async function updateUser(id: String, UserUp: User): Promise<User | false> {

    let user = await usertModel.findById(id).exec();

    if(!user){

        return false;

    }

    user.name = UserUp.name;

    return user.save();

} 

export async function deleteUsers(ids: String[]): Promise<Number| void> {

    const res = await usertModel.deleteMany({ _id: {$in: ids}}).exec();
    return res.n;

}
