let fxos = require('./fxos');

module.exports = async function device(req, res) {
  let adb = req.adb;

  if (req.params.id) {
    adb.options.serial = req.params.id;
  }

  let [gaiaCommit] = await Promise.all([
    fxos.readGaiaCommit(req.adb)
  ]);

  let result = Object.assign({}, {gaia: gaiaCommit});
  res.send(JSON.stringify(result));
};
