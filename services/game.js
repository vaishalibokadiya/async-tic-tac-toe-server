const Game = require("../models/game");

module.exports.createGame = async (user, opponent) => {
  const players = [user, opponent];

  try {
    let game = await Game.findOne({ players: { $all: players } });
    if (!game) game = new Game({ players, turn: user });
    await game.save();
    return game;
  } catch (error) {
    throw error;
  }
};

module.exports.getGame = async (id) => {
  try {
    const game = await Game.findById(id);
    if (!game) throw new Error("Game not found.");
    return game;
  } catch (error) {
    throw error;
  }
};

module.exports.getGames = async (userId) => {
  try {
    const games = await Game.find({
      players: { $in: userId },
    })
      .sort({ updatedAt: -1 })
      .populate("players", "name");

    return games;
  } catch (error) {
    throw error;
  }
};
