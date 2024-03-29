import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Raw, Repository } from 'typeorm';
import { AllCategoriesOutput } from './dtos/all-categories.dto';
import { CategoryInput, CategoryOutput } from './dtos/category.dto';
import { CreateDishInput, CreateDishOutput } from './dtos/create-dish.dto';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { DeleteDishInput, DeleteDishOutput } from './dtos/delete-dish.dto';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './dtos/delete-restaurant.dto';
import { EditDishInput, EditDishOutput } from './dtos/edit-dish.dto';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit-restaurant.dto.';
import { RestaurantInput, RestaurantOutput } from './dtos/restaurant.dto';
import { RestaurantsInput, RestaurantsOutput } from './dtos/restaurants.dto';
import {
  SearchRestaurantInput,
  SearchRestaurantOutput,
} from './dtos/search-restaurant.dto';
import { Category } from './entities/category.entity';
import { Dish } from './entities/dish.entity';
import { Restaurant } from './entities/restaurant.entity';

@Injectable()
export class RestaurantsService {
  constructor(
    //레포지토리를 주입
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
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
      let category: Category = null;
      if (editRestaurnatInput.categoryName) {
        await this.getOrCreateCategory(editRestaurnatInput.categoryName);
      }

      await this.restaurants.save([
        //?id값은 반드시 있어야 하며, 나머지는 optional하게
        {
          id: editRestaurnatInput.restaurantId,
          ...editRestaurnatInput,
          ...(category && { category }),
        },
      ]);
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

  async deleteRestaurant(
    owner: User,
    deleteRestaurantInput: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    try {
      //?restaurant의 인스턴스를 생성하지만, DB에 저장하지는 않는다
      const restaurant = await this.restaurants.findOne({
        where: { id: deleteRestaurantInput.restaurantId },
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
          error: '식당을 삭제할 수 없어요',
        };
      }
      await this.restaurants.remove(restaurant);
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

  async allCategories(): Promise<AllCategoriesOutput> {
    try {
      const categories = await this.categories.find();
      if (!categories) {
        return {
          ok: false,
          error: '카테고리를 찾을 수 없어요',
        };
      }
      return {
        ok: true,
        categories,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  countRestaurant(category: Category) {
    //?where 명시해줘야 함
    //!문법 변경된 부분 필히 체크
    return this.restaurants.count({ where: { category: { id: category.id } } });
  }

  async findCategoryBySlug({
    slug,
    page,
  }: CategoryInput): Promise<CategoryOutput> {
    try {
      const category = await this.categories.findOne({
        where: { slug },
        relations: ['restaurants'],
      });
      if (!category) {
        return {
          ok: false,
          error: '카테고리를 찾지 못했어요',
        };
      }
      //!페이지네이션 로직 구현
      const restaurants = await this.restaurants.find({
        where: { category: { id: category.id } },
        take: 10,
        skip: (page - 1) * 10,
        order: {
          isPromoted: 'DESC',
        },
      });
      category.restaurants = restaurants;
      const totlaResults = await this.countRestaurant(category);
      return {
        ok: true,
        category,
        totalPages: Math.ceil(totlaResults / 10),
      };
    } catch {
      return {
        ok: false,
        error: '카테고리를 불러올 수 없어요',
      };
    }
  }

  async allRestaurants({ page }: RestaurantsInput): Promise<RestaurantsOutput> {
    try {
      const [restaurants, results] = await this.restaurants.findAndCount({
        take: 10,
        skip: (page - 1) * 10,
        order: {
          isPromoted: 'DESC',
        },
      });
      if (!restaurants) {
        return {
          ok: false,
          error: '레스토랑을 찾을 수 없어요',
        };
      }
      return {
        ok: true,
        restaurants,
        totalPages: Math.ceil(results / 10),
        results,
      };
    } catch (error) {
      return {
        ok: false,
        error: '레스토랑을 찾을 수 없어요',
      };
    }
  }

  async findRestaurantById({
    restaurantId,
  }: RestaurantInput): Promise<RestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne({
        where: { id: restaurantId },
        relations: ['menu'],
      });
      if (!restaurant) {
        return {
          ok: false,
          error: '레스토랑을 찾을 수 없어요',
        };
      }
      return {
        ok: true,
        restaurant,
      };
    } catch (error) {
      return {
        ok: false,
        error: '레스토랑을 찾을 수 없어요',
      };
    }
  }

  async searchRestaurant({
    query,
    page,
  }: SearchRestaurantInput): Promise<SearchRestaurantOutput> {
    try {
      const [restaurant, results] = await this.restaurants.findAndCount({
        //!조건부 검색
        //? Raw외에도 Like사용가능
        where: { name: Raw((name) => `${name} ILIKE '%${query}%'`) },
        take: 10,
        skip: (page - 1) * 10,
      });
      if (!restaurant) {
        return {
          ok: false,
          error: '레스토랑을 찾을 수 없어요',
        };
      }
      return {
        ok: true,
        restaurant,
        totalPages: Math.ceil(results / 10),
        results,
      };
    } catch (error) {
      return {
        ok: false,
        error: '레스토랑을 찾을 수 없어요',
      };
    }
  }

  async createDish(
    owner: User,
    createDishInput: CreateDishInput,
  ): Promise<CreateDishOutput> {
    try {
      const restaurant = await this.restaurants.findOne({
        where: { id: createDishInput.restaurantId },
      });
      if (!restaurant) {
        return {
          ok: false,
          error: '가게를 찾지 못했어요',
        };
      }
      if (restaurant.ownerId !== owner.id) {
        return {
          ok: false,
          error: '사장님이 일치하지 않아요',
        };
      }
      this.dishes.save(this.dishes.create({ ...createDishInput, restaurant }));
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: '메뉴를 만들지 못했어요',
      };
    }
  }

  async editDish(
    owner: User,
    editDishInput: EditDishInput,
  ): Promise<EditDishOutput> {
    try {
      const dish = await this.dishes.findOne({
        where: { id: editDishInput.dishId },
        relations: ['restaurant'],
      });
      if (!dish) {
        return {
          ok: false,
          error: '메뉴가 존재하지 않아요',
        };
      }
      if (dish.restaurant.ownerId !== owner.id) {
        return {
          ok: false,
          error: '사장님이 일치하지 않네요',
        };
      }
      await this.dishes.save({ id: editDishInput.dishId, ...editDishInput });
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: '메뉴를 수정하지 못했어요',
      };
    }
  }

  async deleteDish(
    owner: User,
    { dishId }: DeleteDishInput,
  ): Promise<DeleteDishOutput> {
    try {
      const dish = await this.dishes.findOne({
        where: { id: dishId },
        relations: ['restaurant'],
      });
      if (!dish) {
        return {
          ok: false,
          error: '메뉴가 존재하지 않네요',
        };
      }
      if (dish.restaurant.ownerId !== owner.id) {
        return {
          ok: false,
          error: '사장님이 일치하지 않네요',
        };
      }
      await this.dishes.remove(dish);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: '메뉴를 삭제할 수 없어요',
      };
    }
  }
}
