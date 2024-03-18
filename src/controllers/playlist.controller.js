import { Playlist } from "../models/playlist.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user?._id;

  if (!name) {
    throw new apiError(404, "Name is required");
  }
  try {
    const newPlaylist = await Playlist.create({
      name,
      description,
      owner: userId,
      videos: [],
    });
    if (!newPlaylist) {
      throw new apiError(400, "Unable to create playlist");
    }

    return res
      .status(201)
      .json(
        new apiResponse(
          201,
          { newPlaylist },
          "New playlist created successfully"
        )
      );
  } catch (error) {
    throw new apiError(400, error.message);
  }
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.user?._id;

  if (!userId) {
    throw new apiError(404, "User does not exist");
  }
  try {
    const getPlaylists = await Playlist.find({ owner: userId });
    if (!getPlaylists.length) {
      throw new apiError(404, "User has no playlist");
    }
    return res
      .status(200)
      .json(
        new apiResponse(
          200,
          { getPlaylists },
          "User playlists fetched successfully"
        )
      );
  } catch (error) {
    throw new apiError(400, error.message);
  }
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  try {
    const getPlaylist = await Playlist.findById(playlistId);
    if (!getPlaylist) {
      throw new apiError(404, "Playlist not found");
    }
    return res
      .status(200)
      .json(
        new apiResponse(200, { getPlaylist }, "Playlist fetched successfully")
      );
  } catch (error) {
    throw new apiError(400, error.message);
  }
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.body;
  const { videoId } = req.params;

  try {
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      throw new apiError(400, "Playlist does not exist");
    }

    if (playlist.videos.includes(videoId)) {
      throw new apiError(400, "Video already exist in playlist");
    }

    playlist.videos.push(videoId);
    await playlist.save();

    return res
      .status(200)
      .json(
        new apiResponse(
          200,
          { playlist },
          "Video added to playlist successfully"
        )
      );
  } catch (error) {
    throw new apiError(400, error.message);
  }
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { videoId, playlistId } = req.params;

  try {
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      throw new apiError(400, "Playlist does not exist");
    }

    if (!playlist.videos.includes(videoId)) {
      throw new apiError(400, "Video does not exist in playlist");
    }

    playlist.videos.pull(videoId);
    await playlist.save();

    return res
      .status(200)
      .json(
        new apiResponse(
          200,
          { playlist },
          "Video removed from playlist successfully"
        )
      );
  } catch (error) {
    throw new apiError(400, error.message);
  }
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  try {
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      throw new apiError(400, "Playlist does not exist");
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
      throw new apiError(
        403,
        "Unauthorized: You are not the owner of this playlist"
      );
    }

    await Playlist.findByIdAndDelete(playlist);

    return res
      .status(200)
      .json(new apiResponse(200, {}, "Playlist deleted successfully"));
  } catch (error) {
    throw new apiError(400, error.message);
  }
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  if (!(name || description)) {
    throw new apiError(404, "Name and description is required");
  }

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new apiError(404, "Playlist does not exist");
  }

  if (playlist.owner.toString() !== req.user?._id.toString()) {
    throw new apiError(
      403,
      "Unauthorized: You are not the owner of this playlist"
    );
  }

  playlist.name = name;
  playlist.description = description;
  await playlist.save();

  return res
    .status(200)
    .json(new apiResponse(200, {}, "Playlist updated successfully"));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
