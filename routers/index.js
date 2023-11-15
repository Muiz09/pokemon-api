const express = require('express');
const router = express.Router();
const Controller = require('../controllers/index');
const { handleServerError, handleClientError } = require('../errorHandlers');


// GET POKEMON
router.get('/pokemon', Controller.getPokemonList);

// GET DETAIL POKEMON
router.get('/pokemon/:name', Controller.getPokemonDetails);

// CATCH POKEMON
router.post('/catch/:pokemonName', Controller.catchPokemon);

// GET MYLISTPOKEMON
router.get('/mypokemon', Controller.getMyPokemonList);

// RELEASE MYLISTPOKEMON
router.delete('/release/:pokemonId', Controller.releasePokemon);

// RENAME POKEMON
router.put('/rename/:pokemonId', Controller.renamePokemon);

// Handling 404 Not Found
router.use((req, res) => {
  handleClientError(res, 404, 'Not Found');
});

// Handling other errors
router.use((err, req, res, next) => {
  console.error(err.stack);
  handleServerError(res);
});

module.exports = router;
