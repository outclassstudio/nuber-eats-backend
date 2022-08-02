import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit-restaurant.dto.';
import { Category } from './entities/category.entity';
import { Restaurant } from './entities/restaurant.entity';

@Injectable()
export class RestaurantsService {
  constructor(
    //레포지토리를 주입
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
  ) {}
  async getOrCreateCategory(name: string): Promise<Category> {
    const categoryName = name.trim().toLocaleLowerCase();
    const categorySlug = categoryName.replace(/ /g, '-');
    let category = await this.categories.findOne({
      where: { slug: categorySlug },
    });
    if (!category) {
      category = await this.categories.save(
        this.categories.create({ slug: categorySlug, name: categoryName }),
      );
    }
    return category;
  }

  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      //?restaurant의 인스턴스를 생성하지만, DB에 저장하지는 않는다
      const newRestaurant = await this.restaurants.create(
        createRestaurantInput,
      );
      newRestaurant.owner = owner;
      //?slug pattern
      const category = await this.getOrCreateCategory(
        createRestaurantInput.categoryName,
      );
      newRestaurant.category = category;
      await this.restaurants.save(newRestaurant);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: '레스토랑을 만들지 못했어요',
      };
    }
  }

  async editRestaurant(
    owner: User,
    editRestaurnatInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    try {
      //?restaurant의 인스턴스를 생성하지만, DB에 저장하지는 않는다
      const restaurant = await this.restaurants.findOne({
        where: { id: editRestaurnatInput.restaurantId },
        loadRelationIds: true,
      });
      if (!restaurant) {
        return {
          ok: false,
          error: '식당을 찾을 수 없어요',
        };
      }
      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: '식당을 수정할 수 없어요',
        };
      }
      const category = await this.getOrCreateCategory(
        editRestaurnatInput.categoryName,
      );
      restaurant.category = category;
      await this.restaurants.save(restaurant);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: '레스토랑을 만들지 못했어요',
      };
    }
  }
}
