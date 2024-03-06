import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";

const registerUser = asyncHandler(async (req, res) => {
  /*Steps
        Get user details from frontend 
        validation - not empty
        check if user already exists: email or username
        check for images
        upload them to cloudinary
        create user object -- create entry in DB
        remove password and refresh token field from response
        check for user creation
        retur res   
  */

  const { fullName, username, email, password } = req.body;
  console.log("Email ", email);

  //all fields to be filled
  if (
    [fullName, username, email, password].some((field) => {
      field?.trim === "";
    })
  ) {
    throw new apiError(400, "All fields are required");
  }

  //check existing user
  const existedUser = await User.findOne({
    $or: [{ email, username }],
  });

  if (existedUser) {
    throw new apiError(409, "Username or Email already exists");
  }

  //get images
  const avatarLocalPath = req.files?.avatar[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new apiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!avatar) {
    throw new apiError(400, "Avatar file is required");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    username: username.toLowerCase(),
    email,
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new apiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new apiResponse(200, createdUser, "User registered successfully"));
});

export { registerUser };
