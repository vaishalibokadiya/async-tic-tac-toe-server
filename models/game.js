const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const gameSchema = new Schema(
  {
    status: { type: String, enum: ["playing", "finished"], default: "playing" },
    players: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    winner: { type: Schema.Types.ObjectId, ref: "User" },
    board: { type: Array, default: new Array(9).fill(null) },
    turn: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

gameSchema.methods.checkWinner = function (player) {
  const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  return winningCombinations.some((state) =>
    state.every(
      (position) => this.board[position]?.toString() === player.toString()
    )
  );
};

gameSchema.methods.checkDraw = function () {
  return this.board.every((position) => position !== null);
};

gameSchema.methods.switchTurns = async function () {
  this.turn = this.players.find((p) => p.toString() !== this.turn.toString());
  await this.save();
};

gameSchema.methods.move = async function (index, player) {
  if (this.board[index] || this.status === "finished") return false;
  if (this.turn.toString() !== player.toString()) return false;

  this.board[index] = player;
  await this.save();
  return true;
};

gameSchema.methods.resetGame = async function (player) {
  this.board = new Array(9).fill(null);
  this.status = "playing";
  this.winner = null;
  this.turn = player;
  await this.save();
};

const Game = mongoose.model("Game", gameSchema);

module.exports = Game;
