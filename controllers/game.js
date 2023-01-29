const Game = require("../models/game");

module.exports.createGame = async (req, res) => {
  const { secondPlayerId } = req.body;
  if (!secondPlayerId) {
    return res.status(400).send("You need 2 players.");
  }
  const players = [req.user._id, secondPlayerId];
  try {
    const game = new Game({ players });
    await game.save();
    res.status(201).send(game);
  } catch (error) {
    throw error;
  }
};

module.exports.getGame = async (req, res) => {
  const { id } = req.params;
  try {
    const game = Game.findById(id);
    if (!game) return res.status(404).send("Game not found.");
    res.status(200).send(game);
  } catch (error) {
    throw error;
  }
};

module.exports.getGames = async (req, res) => {
  const currentUser = req.user;
  try {
    const games = await Game.find({
      players: { $in: [currentUser._id] },
    });
    res.status(200).send(games);
  } catch (error) {
    throw error;
  }
};
