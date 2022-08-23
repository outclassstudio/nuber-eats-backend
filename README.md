# Nuber Eats

The backend of Nuber Eats

## User Entity:

- id
- createdAt
- updatedAt
- email
- password
- role(client|owner|delivery)

## User CRUD:

- Crreate Account
- Log In
- See Profile
- Edit Profile
- Verity Email

## Category

- See Categories
- See Restaurant by Category(with pagination)

## Restaurant Entity

- name
- category
- address
- coverImage

## Restaurant CRUD

- See Restaurnats(with pagination)
- See Restaurant
- Create Restaurant
- Edit Reestaurant
- Delete Restaurant

- Create Dish
- Edit Dish
- Delete Dish

## Order

- Orders Subscription:
  - Pending Orders(Owner) (t: createOrder(newOrder))
  - Order status(Customer, Delivery, Owner) (s: orderUpdate) (t: editOrder)
  - Pending Pickup Order(Delivery) (s: orderUpdate) (t: editOrder)

## Payments(CRON)
