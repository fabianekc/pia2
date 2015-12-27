/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/data/              ->  index
 * POST    /api/data/              ->  create
 * GET     /api/data//:id          ->  show
 * PUT     /api/data//:id          ->  update
 * DELETE  /api/data//:id          ->  destroy
 */

'use strict';

var _Promise = require('babel-runtime/core-js/promise')['default'];

var _ = require('lodash');
var Data = require('./data.model');
var mongoose = require('mongoose');

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    res.status(statusCode).send(err);
  };
}

function responseWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function (entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function handleEntityNotFound(res) {
  return function (entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function saveUpdates(updates) {
  return function (entity) {
    var updated = _.merge(entity, updates);
    return updated.saveAsync().spread(function (updated) {
      return updated;
    });
  };
}

function removeEntity(res) {
  return function (entity) {
    if (entity) {
      return entity.removeAsync().then(function () {
        res.status(204).end();
      });
    }
  };
}

function openNativeConnection() {
  return new _Promise(function (resolve, reject) {
    if (mongoose.connection.readyState === 1) {
      resolve(mongoose.connection.db);
    } else {
      mongoose.connection.once('open', function () {
        resolve(mongoose.connection.db);
      });
    }
  });
}

function createNativeEntity(data, res) {
  return function (db) {
    db.collection(data.type).insertOne(data, function (err, entity) {
      if (err) res.status(500).send(err);
      res.status(201).json(data);
    });
  };
}

// Gets a list of Datas
exports.index = function (req, res) {
  Data.findAsync().then(responseWithResult(res))['catch'](handleError(res));
};

// Gets a single Data from the DB
exports.show = function (req, res) {
  var type = req.params.type;

  openNativeConnection().then(function (db) {
    db.collection(type).find({}).toArray(function (err, docs) {
      res.status(200).json(docs);
    });
  });
};

// Creates a new Data in the DB
exports.create = function (req, res) {
  var data = req.body;

  // Change this to promises
  if (data.type) {
    openNativeConnection().then(createNativeEntity(data, res));
  } else {
    handleError('no data type specified');
  }
};

// Updates an existing Data in the DB
exports.update = function (req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  Data.findByIdAsync(req.params.id).then(handleEntityNotFound(res)).then(saveUpdates(req.body)).then(responseWithResult(res))['catch'](handleError(res));
};

// Deletes a Data from the DB
exports.destroy = function (req, res) {
  Data.findByIdAsync(req.params.id).then(handleEntityNotFound(res)).then(removeEntity(res))['catch'](handleError(res));
};
//# sourceMappingURL=data.controller.js.map
