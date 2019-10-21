import { Restaurant } from "../entities/restaurant";
import { restaurantModel } from "./restaurantModel";

   export async function saveRestaurant(restaurant: Restaurant) {

        return restaurantModel.create(restaurant);

    }

    export async function findRestaurantById(id: String): Promise<Restaurant | null> {

        return restaurantModel.findById(id).exec;

    }

    export async function findAllRestaurants(): Promise<Restaurant[]> {

        return restaurantModel.find().sort({name: 1}).exec();

    }

    export async function updateRestaurant(id: String, restaurantUp: Restaurant): Promise<Restaurant | false> {

        let restaurant = await restaurantModel.findById(id).exec();

        if(!restaurant){

            return false;

        }

        restaurant.name = restaurantUp.name;

        return restaurant.save();

    } 

    export async function deleteRestaurants(ids: String[]): Promise<Number| void> {

        const res = await restaurantModel.deleteMany({ _id: {$in: ids}}).exec();
        return res.n;

    }
