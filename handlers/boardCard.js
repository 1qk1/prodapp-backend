const Board = require("../models/board"),
  BoardCard = require("../models/boardCard"),
  { ObjectId } = require("mongoose").Types;

const getCardHandler = (req, res) => {
  BoardCard.findOne({
    $and: [
      // get the card that matches the id in the parameter
      { _id: req.params.cardId },
      // and is owned by the logged in user
      { owner: req.user.id }
    ]
  }).then(card => {
    res.json({ card })
  }).catch(res.handleError);

}

const newCardHandler = (req, res) => {
  // deconstruct the data we need to make a card
  const { text, listId, boardId } = req.body;
  // create the card data
  const cardData = {
    text,
    owner: req.user.id,
    listId: listId
  };
  // create card
  BoardCard.create(cardData)
    .then(newCard => {
      // get the list to save the card
      Board.updateOne(
        { _id: boardId },
        // push the new card in the list's array of cards
        { $push: { "lists.$[listId].cards": newCard } },
        {
          arrayFilters: [{ "listId._id": new ObjectId(listId) }]
        }
      )
        .then(() => {
          // send the card back to the user
          res.json({ newCard });
        })
        .catch(res.handleError);
    })
    .catch(res.handleError);
};

const editCardHandler = (req, res) => {
  // filter properties to change
  const cardFields = Object.keys(BoardCard.schema.paths)
  delete cardFields._id
  delete cardFields.__v

  const propsToChange = Object.keys(req.body).reduce((sum, val) => {
    if (cardFields.includes(val)) {
      return {
        ...sum,
        [val]: req.body[val]
      }
    }
    return sum
  }, {});

  // find by id and update
  BoardCard.findOneAndUpdate(
    {
      $and: [
        // get the card that matches the id in the parameter
        { _id: req.body.cardId },
        // and is owned by the logged in user
        { owner: req.user.id }
      ]
    },
    // properties to change
    { $set: propsToChange },
    // don't use deprecated function
    { new: true }
  )
    .then(updatedCard => {
      // update the object to send it back to the user
      // found has the old text although it has been
      // updated in the database
      // send it back to the user
      res.json({
        updatedCard: { _id: updatedCard._id, ...propsToChange }
      });
    })
    .catch(res.handleError);
};

const moveCardHandler = (req, res) => {
  const { boardId, fromList, toList, cardId, toIndex } = req.body;

  const pullPromise = Board.findByIdAndUpdate(
    boardId,
    // pull cardId from fromList
    {
      $pull: { "lists.$[list].cards": new ObjectId(cardId) }
    },
    {
      arrayFilters: [{ "list._id": new ObjectId(fromList) }]
    }
  ).exec();
  const pushPromise = Board.findByIdAndUpdate(
    boardId,
    // add cardId to position
    {
      $push: {
        "lists.$[list].cards": {
          $each: [new ObjectId(cardId)],
          $position: toIndex
        }
      }
    },
    {
      arrayFilters: [{ "list._id": new ObjectId(toList) }]
    }
  ).exec();

  Promise.all([pullPromise, pushPromise])
    .then(() => res.sendStatus(200))
    .catch(res.handleError);
};

const deleteCardHandler = (req, res) => {
  // deconstruct the data we need to delete a card
  const { boardId, listId, cardId } = req.params;
  // delete card
  Board.findOneAndUpdate(
    {
      $and: [
        // get the board that matches the id in the parameter
        { _id: boardId },
        // and
        { owner: req.user.id }
      ]
    },
    {
      $pull: { "lists.$[list].cards": new ObjectId(cardId) }
    },
    {
      arrayFilters: [{ "list._id": new ObjectId(listId) }]
    }
  )
    .then(() => {
      // send reponse that everything was done
      BoardCard.deleteOne({ _id: cardId })
        .then(() => {
          // delete card reference from list entry
          res.sendStatus(200);
        })
        .catch(res.handleError);
    })
    .catch(res.handleError);
};

module.exports = {
  getCardHandler,
  newCardHandler,
  editCardHandler,
  deleteCardHandler,
  moveCardHandler
};
