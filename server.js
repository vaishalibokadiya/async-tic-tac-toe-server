require("dotenv").config();

const express = require("express");
const cors = require("cors");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const { getGame, getGames, createGame } = require("./services/game");
const { notFound, errorHandler } = require("./middleware/error");

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000","https://async-tic-tac-toee.netlify.app"],
    credentials: true,
  },
});

connectDB()
  .then(() => {
    app.use(express.json());
    app.use(
      cors({
        origin: ["http://localhost:3000","https://async-tic-tac-toee.netlify.app"],
        credentials: true,
      })
    );

    app.use("/api/users", require("./routes/user"));

    app.use(notFound);
    app.use(errorHandler);

    io.on("connection", (socket) => {
      socket.on("userConnected", (userId) => {
        socket.join(userId);
        socket.userId = userId;
      });
      socket.on("userDisconnected", socket.leave);

      // Game events

      // Send the list of games
      socket.on("listGames", async (userId) => {
        const games = await getGames(userId);
        io.to(userId).emit("listGames", { games });
      });

      // Create a new game
      socket.on("createGame", async ({ opponent }, callback) => {
        const game = await createGame(socket.userId, opponent);
        callback(game);
        game.players.forEach(async (player) => {
          const games = await getGames(player);
          io.to(player.toString()).emit("listGames", { games });
        });
      });

      // Mark a move
      socket.on("move", async ({ gameId, index }, callback) => {
        const game = await getGame(gameId);
        const player = game.turn;
        if (!game) return callback({ error: "Game not found" });

        const success = await game.move(index, player);
        if (!success) return callback({ error: "Invalid move" });

        if (game.checkWinner(player)) {
          game.status = "finished";
          game.winner = player;
          await game.save();

          game.players.forEach(async (player) => {
            const games = await getGames(player);
            io.to(player.toString()).emit("listGames", { games });
          });
        } else if (game.checkDraw()) {
          game.status = "finished";
          await game.save();
          game.players.forEach(async (player) => {
            const games = await getGames(player);
            io.to(player.toString()).emit("listGames", { games });
          });
        } else {
          await game.switchTurns();
          game.players.forEach(async (player) => {
            const games = await getGames(player);
            io.to(player.toString()).emit("listGames", { games });
          });
        }
      });

      // Reset a game
      socket.on("reset", async ({ gameId }, callback) => {
        const game = await getGame(gameId);
        if (!game) return callback({ error: "Game not found" });
        game.resetGame(socket.userId);
        game.players.forEach(async (player) => {
          const games = await getGames(player);
          io.to(player.toString()).emit("listGames", { games });
        });
      });
    });

    server.listen(process.env.PORT, () => {
      console.log(`listening on ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
