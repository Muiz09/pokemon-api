const axios = require('axios');
const { handleServerError, handleClientError } = require('../errorHandlers');
const BASE_API = "https://pokeapi.co/api/v2"
const database = "./db.json";
const fs = require('fs')
const joi = require('joi')
const data = JSON.parse(fs.readFileSync(database));
const { v4: uuidv4 } = require('uuid')

// GET POKEMON
const getPokemonList = async (req, res) => {
  try {
    const response = await axios.get(`${BASE_API}/pokemon`);
    const pokemonList = response.data.results;
    res.status(200).json({ data: pokemonList, status: 'Success' });
  } catch (err) {
    console.error("Error:", err);
    handleServerError(res);
  }
}

// GET DETAIL POKEMON
const getPokemonDetails = async (req, res) => {
  const { name } = req.params;
  try {
    const response = await axios.get(`${BASE_API}/pokemon/${name}`);
    if (response) {
      const pokemonDetails = response.data;
      res.status(200).json({ data: pokemonDetails, status: 'Success' });
    }
  } catch (err) {
    if (err?.response?.status == 404) {
      return handleClientError(res, 404, 'Data Not Found');
    } else {
      console.error("Error:", err.response.status);
      handleServerError(res);
    }
  }
}

// CATCH POKEMON
const catchPokemon = async (req, res) => {
  try {
    const { pokemonName } = req.params;
    const checkedPoke = await axios.get(`${BASE_API}/pokemon/${pokemonName.toLowerCase()}`);
    if (checkedPoke) {
      const randomValue = Math.floor(Math.random() * 20) + 1;
      const result = (randomValue % 2 === 0) ? 'lari' : 'ditangkap';
      if (result == 'ditangkap') {
        let jsonData = {};
        try {
          const fileContent = fs.readFileSync(database, 'utf-8');
          jsonData = JSON.parse(fileContent);
        } catch (err) {
          console.error("Error reading db.json:", err);
          jsonData = { myPokemon: [] };
        }

        jsonData.myPokemon.push({
          name: pokemonName,
          id: uuidv4(),
          number: 0
        });
        fs.writeFileSync(database, JSON.stringify(jsonData, null, 2), 'utf-8');
        res.status(200).json(`Successfully caught ${pokemonName}!`);
      }
    }
    res.status(200).json(`She run ${pokemonName}!`);
  } catch (err) {
    if (err?.response?.status == 404) {
      return handleClientError(res, 404, 'Data Not Found');
    } else {
      console.error("Error:", err.response.status);
      handleServerError(res);
    }
  }
}

// GET MYLISTPOKEMON
const getMyPokemonList = async (req, res) => {
  try {
    return res.status(200).json({ data: data, status: 'Success' });
  } catch {
    return handleServerError(res);
  }
}

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
function isPrime(number) {
  if (number <= 1) return false;
  for (let i = 2; i <= Math.sqrt(number); i++) {
    if (number % i === 0) return false;
  }
  return true;
}
//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

// RELEASE MYLISTPOKEMON
const releasePokemon = async (req, res) => {
  try {
    const { pokemonId } = req.params;
    const foundPokemon = data.myPokemon.find((el) => el.id.toLowerCase() === pokemonId.toLowerCase());

    if (!foundPokemon) {
      return handleClientError(res, 404, 'Data Not Found');
    }

    const isNumberPrime = isPrime(foundPokemon.number);

    if (isNumberPrime) {
      data.myPokemon = data.myPokemon.filter((el) => el.id.toLowerCase() !== pokemonId.toLowerCase());
      fs.writeFileSync(database, JSON.stringify(data));
      return res.status(200).json({ result: 'Release successful. The number is prime.' });
    } else {
      return handleClientError(res, 400, 'Release failed. The number is not prime.');
    }
  } catch (err) {
    console.error("Error:", err);
    return handleServerError(res);
  }
};

// RENAME POKEMON
const renamePokemon = async (req, res) => {
  try {
    const { pokemonId } = req.params;
    const newData = req.body;
    const scheme = joi.object({
      name: joi.string().required(),
    })

    const { error } = scheme.validate(newData);

    if (error) {
      return res.status(400).json({ status: 'Validation Failed', message: error.details[0].message })
    }


    const foundPokemonIndex = data.myPokemon.findIndex((el) => el.id.toLowerCase() === pokemonId.toLowerCase());

    if (foundPokemonIndex === -1) {
      return handleClientError(res, 404, 'Data Not Found');
    }

    const foundPokemon = data.myPokemon[foundPokemonIndex];

    const fibonacci = (n) => {
      if (n <= 1) {
        return n;
      }
      return fibonacci(n - 1) + fibonacci(n - 2);
    };

    const nameParts = foundPokemon.name.split('-');
    const number = foundPokemon.number || 0;

    const generateName = newData.name ? newData.name : `${nameParts[0]}-${nameParts[1]}`;

    const newName = `${generateName}-${fibonacci(number)}`;

    foundPokemon.name = newName;
    foundPokemon.number = number + 1;

    data.myPokemon[foundPokemonIndex] = foundPokemon;
    fs.writeFileSync(database, JSON.stringify(data, null, 2), 'utf-8');

    return res.status(200).json({ data: data, message: 'Success' });
  } catch (err) {
    console.error("Error:", err);
    return handleServerError(res);
  }
};
module.exports = {
  getPokemonList,
  getPokemonDetails,
  catchPokemon,
  getMyPokemonList,
  releasePokemon,
  renamePokemon
};
