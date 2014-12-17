var express = require('express'),
    bodyParser = require('body-parser'),
    app = express(),
    server;




/**
 * MODEL MOCKUP:
 * *************
 */
var model = {
  /**
   * PRIVATE DATA / METHODS:
   * ***********************
   */
  __data: [],
  __dataIndex: {},
  __getID: (function() {
    var i = 0;
    return function() {
      return (++i) + '';
    }
  })(),
  __refreshIndex: function() {
    this.__dataIndex = this.__data.reduce(function(index, row) {
      index[row.id] = row;
      return index;
    }, {});
  },


  /**
   * PUBLIC METHODS:
   * ***************
   */
  readData: function(id) {
    if (!arguments.length)
      return this.__data;

    if (typeof id !== 'string')
      throw new Error('Wrong type for model#readData argument');
    else
      return this.__dataIndex[id];
  },
  updateData: function(row) {
    if (!row || typeof row !== 'object')
      throw new Error('[0] Wrong type for model#updateData argument');
    if (typeof row.id !== 'string')
      throw new Error('[1] Row\'s ID must be a string');
    if (typeof row.data !== 'string')
      throw new Error('[2] Row\'s data must be a string');
    if (!this.__dataIndex[row.id])
      throw new Error('[3] Row "' + row.id + '" does not exist yet');

    this.__dataIndex[row.id].data = row.data;
    return this.__dataIndex[row.id];
  },
  createData: function(data) {
    if (typeof data !== 'string')
      throw new Error('Data must be a string');

    var row = { id: this.__getID(), data: data }
    this.__data.push(row);
    this.__refreshIndex();

    return row;
  },
  deleteData: function(id) {
    if (typeof id !== 'string')
      throw new Error('Wrong type for model#deleteData argument');

    if (this.__dataIndex[id]) {
      this.__data = this.__data.filter(function(row) {
        return row.id !== id;
      });
      this.__refreshIndex();
      return true
    }

    return false;
  }
};




/**
 * CONTROLLER MOCKUP:
 * ******************
 */
var controller = {
  getAll: function(req, res) {
    res.send({ result: model.readData() });
  },
  getRow: function(req, res) {
    var result;

    try {
      result = model.readData(req.param('id'));
    } catch (e) {
      return res.status(400).send('Bad request');
    }

    if (result)
      res.send({ result: result });
    else
      res.status(404).send('Row not found');
  },
  postRow: function(req, res) {
    var result,
        row = {
          id: req.param('id'),
          data: req.param('data')
        };

    try {
      result = model.updateData(row);
    } catch (e) {
      if (e.message.match(/^[3]/))
        return res.status(404).send('Data not found');
      else
        return res.status(400).send('Bad request');
    }

    res.send({ result: result });
  },
  putRow: function(req, res) {
    var result,
        data = req.param('data');

    try {
      result = model.createData(data);
    } catch (e) {
      return res.status(400).send('Bad request');
    }

    res.send({ result: result });
  },
  deleteRow: function(req, res) {
    var result,
        id = req.param('id');

    try {
      result = model.deleteData(id);
    } catch (e) {
      return res.status(400).send('Bad request');
    }

    if (result)
      res.send({ ok: 1, id: id });
    else
      res.status(404).send('Data not found');
  }
};




/**
 * MIDDLEWARES:
 * ************
 */
app.use(bodyParser.json())




/**
 * ROUTES:
 * *******
 */
app.get('/data/', controller.getAll);
app.get('/data/:id', controller.getRow);
app.post('/data/:id', controller.postRow);
app.put('/data/', controller.putRow);
app.delete('/data/:id', controller.deleteRow);

app.use('/api/*', function(req, res) {
  res.send({
    ok: 1,
    data: req.body,
    type: req.method,
    url: req.originalUrl
  });
});

app.get('/*', express.static(__dirname));




/**
 * EXPORTING:
 * **********
 */
module.exports = app;
