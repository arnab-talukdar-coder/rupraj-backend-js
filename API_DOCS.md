# Rupraj Jewellery E-commerce API Documentation

This documentation is designed to be comprehensive and "AI-friendly," providing explicit schemas, types, and example responses for seamless frontend integration.
##
## Table of Contents
- [General Information](#general-information)
- [Authentication](#authentication)
- [User Profile](#user-profile)
- [Categories](#categories)
- [Products](#products)
- [Cart](#cart)
- [Wishlist](#wishlist)
- [Addresses](#addresses)
- [Orders](#orders)
- [Reviews](#reviews)
- [Gold Rate](#gold-rate)
- [Data Models (Schemas)](#data-models-schemas)

---

## General Information

### Base URL
`http://localhost:5000/api`

### Global Response Format
Most endpoints return a JSON object with the following structure:
```json
{
  "success": true,
  "data": { ... }, // Can be an object or an array
  "message": "Optional message"
}
```

### Error Responses
Errors typically return a `4xx` or `5xx` status code with the following structure:
```json
{
  "success": false,
  "message": "Error description here"
}
```

---

## Authentication (`/api/auth`)

### 1. Register User
Create a new user account. Defaults to `USER` role.
- **Method**: `POST`
- **Endpoint**: `/auth/register`
- **Payload**:
  ```json
  {
    "name": "Arnab",
    "email": "arnab@example.com",
    "password": "securepassword123"
  }
  ```
- **Success Response (201)**:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "name": "Arnab",
      "email": "arnab@example.com",
      "role": "USER"
    }
  }
  ```

### 2. Login User
Authenticate and receive a JWT token.
- **Method**: `POST`
- **Endpoint**: `/auth/login`
- **Payload**:
  ```json
  {
    "email": "arnab@example.com",
    "password": "securepassword123"
  }
  ```
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": 1,
        "name": "Arnab",
        "email": "arnab@example.com",
        "role": "USER" // or "ADMIN"
      }
    }
  }
  ```

---

## User Profile

### 1. Get My Profile
Requires valid JWT token.
- **Method**: `GET`
- **Endpoint**: `/auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "name": "Arnab",
      "email": "arnab@example.com",
      "role": "USER"
    }
  }
  ```

---

## Categories (`/api/categories`)

### 1. Get All Categories
Retrieve a list of categories. Supports hierarchical tree structure.
- **Method**: `GET`
- **Endpoint**: `/categories`
- **Query Parameters**:
  - `tree`: (Boolean) If `true` (default), returns a nested tree structure. If `false`, returns a flat list.
- **Success Response (200 - Tree Mode)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "name": "Gold",
        "parentId": null,
        "children": [
          {
            "id": 2,
            "name": "Earring",
            "parentId": 1,
            "children": [
              { "id": 3, "name": "Pasa", "parentId": 2, "children": [] }
            ]
          }
        ]
      }
    ]
  }
  ```

### 2. Create Category (Admin Only)
- **Method**: `POST`
- **Endpoint**: `/categories`
- **Headers**: `Authorization: Bearer <admin_token>`
- **Payload**:
  ```json
  {
    "name": "Jhumka",
    "description": "Traditional gold jhumkas",
    "parentId": 2 // Optional: ID of the parent category
  }
  ```

---

## Products (`/api/products`)

### 1. Get All Products (With Filters)
- **Method**: `GET`
- **Endpoint**: `/products`
- **Query Parameters**:
  - `categoryId`: (Number) Filter by category. **Note**: This filter is recursive; selecting "Gold" will return products from all its subcategories (Earrings, Rings, etc.).
  - `search`: (String) Search in name/description (LIKE %...%)
  - `minWeight`: (Number) Minimum gold weight
  - `maxWeight`: (Number) Maximum gold weight
  - `sortBy`: `newest`, `oldest`, `weight_asc`, `weight_desc`, `price_asc`, `price_desc`
  - `page`: (Number) Default 1 (Offset pagination)
  - `limit`: (Number) Default 10
  - `cursor`: (Number) Product ID to start from (Cursor pagination - use `nextCursor` from meta)
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "data": [ ... ],
    "meta": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "totalPages": 5,
      "nextCursor": 11 // Use this for the next request's cursor param
    }
  }
  ```

### 2. Advanced Search (Full-Text)
Optimized search using database Full-Text search capabilities.
- **Method**: `GET`
- **Endpoint**: `/products/search`
- **Query Parameters**:
  - `q`: (String, Required) Search query (e.g., "Gold Ring 22k")
  - `limit`: (Number) Default 10
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "data": [ ... ]
  }
  ```

### 3. Get Product By ID
- **Method**: `GET`
- **Endpoint**: `/products/:id`
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "data": {
       "id": 1,
       "name": "Gold Ring",
       "finalPrice": 36050,
       "reviews": [ ... ],
       "category": { "name": "Rings" }
       // ... full product details
    }
  }
  ```

### 3. Create Product (Admin Only - Multipart)
Expects `multipart/form-data` for image uploads.
- **Method**: `POST`
- **Endpoint**: `/products`
- **Headers**: `Authorization: Bearer <admin_token>`
- **Fields**:
  - `name`: (String, Required)
  - `categoryId`: (Int, Required)
  - `weight`: (Float, Required)
  - `makingCharges`: (Float, Required)
  - `stock`: (Int, Required)
  - `description`: (String)
  - `purity`: (String, e.g., "22k")
  - `metalType`: (String, e.g., "Gold")
  - `metalColor`: (String, e.g., "Yellow")
  - `diamondWeight`: (Float)
  - `diamondColor`: (String)
  - `diamondClarity`: (String)
  - `basePrice`: (Float, optional - if set, dynamic gold price is ignored)
  - `images`: (Files, max 5)

---

## Cart (`/api/cart`)

### 1. Get My Cart
- **Method**: `GET`
- **Endpoint**: `/cart`
- **Headers**: `Authorization: Bearer <token>`
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "items": [
        {
          "id": 10,
          "productId": 1,
          "quantity": 2,
          "product": { "name": "Gold Ring", "finalPrice": 36050, "images": [...] }
        }
      ]
    }
  }
  ```

### 2. Add/Update Item
- **Method**: `POST` (Add new) | `PUT` `/cart/:id` (Update quantity)
- **Payload (POST)**: `{ "productId": 1, "quantity": 1 }`
- **Payload (PUT)**: `{ "quantity": 3 }`

---

## Wishlist (`/api/wishlist`)

### 1. Get My Wishlist
- **Method**: `GET`
- **Endpoint**: `/wishlist`
- **Headers**: `Authorization: Bearer <token>`

### 2. Add/Remove
- **POST** `/wishlist`: `{ "productId": 1 }`
- **DELETE** `/wishlist/:productId`: Remove item

---

## Addresses (`/api/addresses`)

### 1. Get/Add Addresses
- **GET** `/addresses`: List all my addresses
- **POST** `/addresses`: Add new
  ```json
  {
    "street": "123 MG Road",
    "city": "Mumbai",
    "state": "Maharashtra",
    "postalCode": "400001",
    "isDefault": true
  }
  ```

### 2. Manage Addresses
- **PUT** `/addresses/:id`: Update
- **PATCH** `/addresses/:id/set-default`: Make this the default address

---

## Orders (`/api/orders`)

### 1. Create Order (Checkout)
Creates a PENDING order from your current cart and sends the owner an order notification email. No online payment is collected.
- **Method**: `POST`
- **Endpoint**: `/orders`
- **Payload**: `{ "addressId": 5 }` // addressId is optional, uses default if omitted
- **Success Response**: Returns the created order and amount.

### 2. Get Orders
- **GET** `/orders/my-orders`: List my orders
- **GET** `/orders`: (Admin Only) List all orders

---

## Reviews (`/api/reviews`)

### 1. Get Product Reviews
- **Method**: `GET`
- **Endpoint**: `/reviews/product/:productId`

### 2. Add/Update Review
- **Method**: `POST`
- **Endpoint**: `/reviews`
- **Payload**: `{ "productId": 1, "rating": 5, "comment": "Beautiful!" }`

---

## Gold Rate (`/api/gold-rate`)

### 1. Get Current Gold Rate
- **Method**: `GET`
- **Endpoint**: `/gold-rate`
- **Success Response**: `{ "success": true, "data": { "rate": 7250 } }`

### 2. Update Gold Rate (Admin Only)
- **Method**: `PUT`
- **Endpoint**: `/gold-rate`
- **Payload**: `{ "rate": 7300.5 }`

---

## Data Models (Schemas)

### User
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | Int | Unique ID |
| `name` | String | Full name |
| `email` | String | Unique email |
| `role` | Enum | `USER`, `ADMIN` |

### Category
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | Int | Unique ID |
| `name` | String | Category Name |
| `description` | String | Description |
| `parentId` | Int | ID of the parent category (null for top-level) |
| `children` | Array | List of subcategories (when fetching tree) |

### Product
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | Int | Unique ID |
| `name` | String | Product Name |
| `description` | String | Long description |
| `purity` | String | e.g. "22k" |
| `metalType` | String | e.g. "Gold", "Silver", "Diamond" |
| `metalColor` | String | e.g. "Yellow", "Rose Gold", "White" |
| `diamondWeight`| Float | Total carat weight (if applicable) |
| `diamondColor` | String | Diamond color grade (e.g. "G-H") |
| `diamondClarity`| String | Diamond clarity grade (e.g. "VVS1") |
| `weight` | Float | Total weight in grams |
| `makingCharges` | Float | Labour cost |
| `goldRate` | Float | Rate used for calculation (if dynamic) |
| `finalPrice` | Float | **(Calculated)** Total price incl. GST (3%) |
| `stock` | Int | Available quantity |
| `images` | Array | List of image URLs/paths |

### Address
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | Int | Unique ID |
| `street` | String | Street address |
| `city` | String | City name |
| `state` | String | State/Region |
| `postalCode` | String | Zip/Postal code |
| `isDefault` | Boolean | Whether this is the primary address |

### Order
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | Int | Unique ID |
| `totalAmount` | Float | Grand total |
| `gstAmount` | Float | Tax component (3%) |
| `status` | Enum | `PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED` |
| `items` | Array | List of `OrderItem` objects |
| `address` | Object | The shipping `Address` object |

### OrderItem
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | Int | Unique ID |
| `productId` | Int | ID of the product |
| `quantity` | Int | Number of units |
| `priceAtTime` | Float | `finalPrice` at the time of purchase |
| `product` | Object | The `Product` object details |
