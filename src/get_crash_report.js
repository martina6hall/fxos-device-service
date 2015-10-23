module.exports = async function getCrashReport(req, res) {
  // First we want to figure out whether the thing
  // is pending or submitted.
  let id = req.params.id;
  let adb = req.adb;
  let [pending, submitted] = await Promise.all([
    adb.shell('ls /data/b2g/mozilla/Crash\\ Reports/pending'),
    adb.shell('ls /data/b2g/mozilla/Crash\\ Reports/submitted')
  ]);

  pending = pending[0];
  submitted = submitted[0];
  let folder;
  if (pending.includes(id)) {
    folder = 'pending';
  } else if (submitted.includes(id)) {
    folder = 'submitted';
  } else {
    return res.status(404).send('404 Not Found');
  }

  // Now stream the thing.
  let cat = adb.spawn([
    'shell',
    `"cat /data/b2g/mozilla/Crash\\ Reports/${folder}/${id}.dmp"`
  ]);

  cat.output.pipe(res);

  // Handle the case where the client disconnects while
  // we're still writing crash data.
  req.socket.on('close', () => {
    cat.output.unpipe(res);
    cat.proc.kill();
  });
};
