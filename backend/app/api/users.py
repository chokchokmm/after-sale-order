from fastapi import APIRouter, HTTPException, status
from typing import List
from bson import ObjectId
from datetime import datetime
from app.models.user import UserCreate, UserUpdate, UserResponse, UserRole
from app.database import get_collection

router = APIRouter()


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user_data: UserCreate):
    """Create a new user."""
    collection = await get_collection("users")

    # Check if email already exists
    existing = await collection.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists")

    user_dict = user_data.model_dump()
    user_dict["createdAt"] = datetime.utcnow()

    result = await collection.insert_one(user_dict)
    user_dict["id"] = str(result.inserted_id)

    return UserResponse(**user_dict)


@router.get("", response_model=List[UserResponse])
async def get_users():
    """Get all users."""
    collection = await get_collection("users")

    cursor = collection.find()
    users = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        users.append(UserResponse(**doc))

    return users


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str):
    """Get a user by ID."""
    collection = await get_collection("users")

    try:
        obj_id = ObjectId(user_id)
    except:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    doc = await collection.find_one({"_id": obj_id})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    doc["id"] = str(doc["_id"])
    return UserResponse(**doc)


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(user_id: str, user_data: UserUpdate):
    """Update a user."""
    collection = await get_collection("users")

    try:
        obj_id = ObjectId(user_id)
    except:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Build update dict with only non-None fields
    update_dict = {k: v for k, v in user_data.model_dump().items() if v is not None}

    if not update_dict:
        doc = await collection.find_one({"_id": obj_id})
        if not doc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        doc["id"] = str(doc["_id"])
        return UserResponse(**doc)

    result = await collection.update_one({"_id": obj_id}, {"$set": update_dict})

    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    doc = await collection.find_one({"_id": obj_id})
    doc["id"] = str(doc["_id"])
    return UserResponse(**doc)
