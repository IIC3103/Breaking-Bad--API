const { all } = require('../Data/url');
const moment = require('moment');
const { capitalizeFirstLetter } = require('../utils/character');

let occ = [],
  app = [],
  betterApp = [];
const aMap = (arr) => {
  return arr ? arr.map((el) => +el) : [];
};

const getPeople = (req, res) => {
  const db = req.app.get('db');
  const { limit, name, offset, category } = req.query;

  if (category) {
    db.characters.get_char_by_category([`%${category}%`]).then((response) => {
      res
        .status(200)
        .send(limit || offset ? response.splice(offset || 0, limit) : response);
    });
    occ = [];
    app = [];
    betterApp = [];
    return;
  }

  let newName =
    name &&
    name
      .split(' ')
      .map((e) => {
        return e.charAt(0).toUpperCase() + e.slice(1);
      })
      .join(' ');

  !name
    ? db.characters.get_characters().then((response) => {
        res
          .status(200)
          .send(
            limit || offset ? response.splice(offset || 0, limit) : response
          );
      })
    : db.characters.get_char_by_name([newName]).then((response) => {
        if (!response.length) {
          const percentName = newName
            ? `%${capitalizeFirstLetter(newName)}%`
            : '%%';
          db.characters.get_char_closest(percentName).then((secondResponse) => {
            res.status(200).send(
              limit || offset
                ? secondResponse.splice(offset || 0, limit)
                : secondResponse
            );
          });
          return;

        } else {
          res.status(200).send(response);
          return;
        }
      });
  occ = [];
  app = [];
  betterApp = [];
};

const getPeopleFooter = (req, res) => {
  const db = req.app.get('db');
  const { limit, name, offset } = req.query;

  let newName =
    name &&
    name
      .split(' ')
      .map((e) => {
        return e.charAt(0).toUpperCase() + e.slice(1);
      })
      .join(' ');

  !name
    ? db.characters.get_characters().then((response) => {
        res
          .status(200)
          .send(
            limit || offset ? response.splice(offset || 0, limit) : response
          );
      })
    : db.characters.get_char_by_name([newName]).then((response) => {
        res.status(200).send(response);
      });
  occ = [];
  app = [];
  betterApp = [];
};

const getPeopleById = (req, res) => {
  const db = req.app.get('db');
  const { id } = req.params;

  db.characters
    .get_char_by_id([id])
    .then((resp) => {
      res.status(200).send(resp);
    })
    .catch((err) => {
      res.status(500).send(err);
    });

  occ = [];
  app = [];
  betterApp = [];
};

const getRandomChar = (req, res) => {
  const db = req.app.get('db');
  const { limit } = req.query;
  const o = [];
  const a = [];

  db.characters
    .get_random_char([limit || 1])
    .then((resp) => {
      resp.map((e, i) => {
        e.occupation && o.push(e.occupation.split(','));
        e.appearance && a.push(e.appearance.split(','));

        e.occupation = o[i];
        if (e.appearance) {
          e.appearance = aMap(a[i]);
        }
      });
      res.status(200).send(resp);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
};

const getHomePage = (req, res) => {
  const db = req.app.get('db');
  const { limit, category, offset } = req.query;
  const o = [];
  const a = [];
  const betterCallA = [];

  if (category) {
    db.characters
      .get_char_by_category_homepage([`%${category}%`, limit || 1])
      .then((resp) => {

        res
          .status(200)
          .send(limit || offset ? resp.splice(offset || 0, limit) : resp);
      });
    // .then(response => {
    //   charactersFunc(response);
    //   res.status(200)
    //   .send(
    //     limit || offset ? response.splice(offset || 0, limit) : response
    //   )
    // })
    return;
  }

  db.characters
    .get_random_char([limit || 1])
    .then((resp) => {
      res.status(200).send(resp);
    })
    .catch((err) => {
      res.status(500).send(err);
    });

  return;
};

const getAll = (req, res) => {
  res.status(200).json(all);
};

const getEverything = async (req, res) => {
  const db = req.app.get('db');
  let everything = [];

  await db.characters.get_characters().then((resp) => {
    everything.push(...resp);
  });
  await db.episodes.get_episodes().then((resp) => {
    everything.push(...resp);
  });
  await db.quotes.get_quotes().then((resp) => {
    everything.push(...resp);
  });
  // await db.death.get_deaths().then((resp) => {
  //   everything.push(...resp);
  // });

  await res.status(200).send(everything);
};

module.exports = {
  getPeople,
  getPeopleById,
  getRandomChar,
  getHomePage,
  getAll,
  getEverything,
  getPeopleFooter,
};
