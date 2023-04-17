'use strict';
require('dotenv').config();
var mongoose = require('mongoose'),
    Snap = mongoose.model('Snaps'),
    fs = require('fs');

const cron = require('node-cron');
const debug = process.env.REACT_APP_DEBUG;

const util = require('util');
const { spawn } = require('child_process');
var jobs = {};

exports.list_snaps = function (req, res) {
    Snap.find({}, function (err, snap) {
        if (err)
            res.send(err);
        res.json(snap);
    });
};


exports.create_snap = function (req, res) {
    (debug == 'true') ? console.log(req.body) : '';

    var new_snap = new Snap(req.body);

    new_snap.save(function (err, snap) {
        if (err) res.send(err);

        fs.mkdirSync(snap.folder_path + '/cron/' + snap._id, { recursive: true }, (err) => {
            if (err) throw err;
        });

        fs.mkdirSync(snap.folder_path + '/backup/' + snap._id, { recursive: true }, (err) => {
            if (err) throw err;
        });

        // check debug if true and print using console.log
        (debug == 'true') ? console.log('create_snap: ' + snap) : '';
        res.json({ message: 'Snap successfully created.' });

    });
};

exports.read_snap = function (req, res) {
    Snap.findById(req.params.snapId, function (err, snap) {
        if (err) res.send(err);
        res.json(snap);
    });
}

exports.update_snap = function (req, res) {
    Snap.findOneAndUpdate({ _id: req.params.snapId }, req.body, { new: true }, function (err, snap) {
        if (err) res.send(err);
        res.json({ message: 'Snap successfully updated.' });
    });
};

exports.delete_snap = function (req, res) {
    Snap.remove({
        _id: req.params.snapId
    }, function (err, snap) {
        if (err) res.send(err);
        // check if existing in jobs array based on snap id
        if (jobs[req.params.snapId] == null || jobs[req.params.snapId] == undefined) {
            res.json({ message: 'Snap successfully deleted.' });
        } else {
            // stop cron job
            jobs[req.params.snapId].task.stop();
            // remove job from jobs array
            delete jobs[req.params.snapId];
            res.json({ message: 'Snap successfully deleted.' });
        }
    });

};

exports.start_snap = function (req, res) {

    Snap.findById(req.params.snapId, function (err, snap) {
        if (err) res.status(400).json({ error: 'An error occured with your request.' });

        // check if snap is not empty
        if (snap == null) {
            res.status(500).json({ error: 'An error occurred while starting the snap. Snap not found' });
        } else {
            var content = "";
            var dateObj = new Date();
            // check job running status variable
            var jobRunning = false;

            // format dateObj to yyyy-MM-dd
            var dateStr1 = dateObj.getFullYear() + '-' + ('0' + (dateObj.getMonth() + 1)).slice(-2) + '-' + ('0' + dateObj.getDate()).slice(-2);

            // format dateObj to yyyymmddhhmmss
            var dateStr2 = dateObj.getFullYear() + ('0' + (dateObj.getMonth() + 1)).slice(-2) + ('0' + dateObj.getDate()).slice(-2) + ('0' + dateObj.getHours()).slice(-2) + ('0' + dateObj.getMinutes()).slice(-2) + ('0' + dateObj.getSeconds()).slice(-2);

            fs.mkdirSync(snap.folder_path + '/backup/' + snap._id + '/' + dateStr1 + '/', { recursive: true }, (err) => {
                if (err) throw err;
            });

            var filePath = snap.folder_path + '/cron/' + snap._id + '/' + snap._id + '-backup-job.txt';
            content += 'exportcfg "' + snap.folder_path + '/backup/' + snap._id + '/' + snap._id + '-' + dateStr2 + '-config.xml" \n';

            for (var i = 0; i < snap.channels.length; i++) {
                content += 'export ' + snap.channels[i].id + ' "' + snap.folder_path + '/backup/' + snap._id + '/' + dateStr1 + '/' + snap.channels[i].name + '-' + dateStr2 + '.xml" \n';
            }

            fs.writeFileSync(filePath, content);

            const job = cron.schedule(snap.cron_expression, async () => {
                const commandLine = spawn(snap.exec_path, ['-s', filePath]);
                let output = { message: '' };  // initialize output object

                commandLine.stdout.on('data', (data) => {
                    console.log(`Command Line stdout: ${data}`);
                });

                commandLine.stderr.on('data', (data) => {
                    console.error(`Command Line stderr: ${data}`);
                    output.message = `Error: Command Line stderr: ${data}`; // update message property
                    jobRunning = false;
                    callback(jobRunning);
                });

                commandLine.on('close', (code) => {
                    console.log(`Command Line exited with code ${code}`);
                    output.message = 'Snap successfully started.'; // update message property
                    jobRunning = true;
                    callback(jobRunning);
                });

                await new Promise(resolve => commandLine.on('close', resolve)); // wait until CLI is closed
                return output;
            }, {
                scheduled: false
            });

            jobs[snap._id.toString()] = { task: job, status: false };

            job.start();

            Snap.findOneAndUpdate({ _id: snap._id }, { $set: { status: 'active' } })
                .then(() => {
                    res.json({ message: 'Snap successfully set to active.' });
                })
                .catch(err => {
                    console.log('Error: ' + err);
                    res.status(500).json({ error: 'An error occurred while setting Snap to active.' });
                });

            function callback(i) {
                (debug ? console.log('callback: ' + i) : '');
                if (i) {
                    jobs[snap._id.toString()] = { task: job, status: true };
                    return;
                } else {
                    delete jobs[snap._id.toString()];
                    job.stop();
                    return;
                }
            }


        }
    });

}

// start all snaps when server is deployed
exports.start_all_snaps_auto = function () {
    Snap.find({ status: 'active' }, function (err, snaps) {
        if (err) console.log('Error: ' + err);
        snaps.forEach(snap => {
            var content = "";
            var dateObj = new Date();
            // check job running status variable
            var jobRunning = false;

            // format dateObj to yyyy-MM-dd
            var dateStr1 = dateObj.getFullYear() + '-' + ('0' + (dateObj.getMonth() + 1)).slice(-2) + '-' + ('0' + dateObj.getDate()).slice(-2);

            // format dateObj to yyyymmddhhmmss
            var dateStr2 = dateObj.getFullYear() + ('0' + (dateObj.getMonth() + 1)).slice(-2) + ('0' + dateObj.getDate()).slice(-2) + ('0' + dateObj.getHours()).slice(-2) + ('0' + dateObj.getMinutes()).slice(-2) + ('0' + dateObj.getSeconds()).slice(-2);

            fs.mkdirSync(snap.folder_path + '/backup/' + snap._id + '/' + dateStr1 + '/', { recursive: true }, (err) => {
                if (err) throw err;
            });

            var filePath = snap.folder_path + '/cron/' + snap._id + '/' + snap._id + '-backup-job.txt';
            content += 'exportcfg "' + snap.folder_path + '/backup/' + snap._id + '/' + snap._id + '-' + dateStr2 + '-config.xml" \n';

            for (var i = 0; i < snap.channels.length; i++) {
                content += 'export ' + snap.channels[i].id + ' "' + snap.folder_path + '/backup/' + snap._id + '/' + dateStr1 + '/' + snap.channels[i].name + '-' + dateStr2 + '.xml" \n';
            }

            // check if snap.channels.length is greater than 0
            if (snap.channels.length == 0) {
                content += 'export * "' + snap.folder_path + '/backup/' + snap._id + '/' + dateStr1 + '/"';
            }
            fs.writeFileSync(filePath, content);

            const job = cron.schedule(snap.cron_expression, async () => {
                const commandLine = spawn(snap.exec_path, ['-s', filePath]);
                let output = { message: '' };  // initialize output object

                commandLine.stdout.on('data', (data) => {
                    console.log(`Command Line stdout: ${data}`);
                });

                commandLine.stderr.on('data', (data) => {
                    console.error(`Command Line stderr: ${data}`);
                    output.message = `Error: Command Line stderr: ${data}`; // update message property
                    jobRunning = false;
                    callback(jobRunning);
                });

                commandLine.on('close', (code) => {
                    console.log(`Command Line exited with code ${code}`);
                    output.message = 'Snap successfully set to active.'; // update message property
                    jobRunning = true;
                    callback(jobRunning);
                });

                await new Promise(resolve => commandLine.on('close', resolve)); // wait until CLI is closed
                return output;
            }, {
                scheduled: false
            });

            jobs[snap._id.toString()] = { task: job, status: false };

            // check debug if true and print using console.log
            (debug ? console.log('start_all_snaps_auto: ' + JSON.stringify(job)) : '');
            job.start();
            // callback function to add job in jobs object array when cron async is done
            function callback(i) {
                (debug ? console.log('callback: ' + i) : '');
                if (i) {
                    jobs[snap._id.toString()] = { id: snap._id.toString(), task: job, status: true, content: JSON.stringify(snap) };
                    return;
                } else {
                    delete jobs[snap._id.toString()];
                    job.stop();
                    return;
                }
            }
        });
    });
}

exports.start_all_snaps = function (req, res) {
    Snap.find({ status: 'active' }, function (err, snaps) {
        if (err) res.status(400).json({ error: 'An error occured with your request.' });

        // check snaps length
        if (snaps.length == 0) {
            res.status(500).json({ error: 'An error occurred while starting the snap. No active Snaps found.' });
        } else {
            // loop through snaps
            snaps.forEach(snap => {
                var content = "";
                var dateObj = new Date();

                // format dateObj to yyyy-MM-dd
                var dateStr1 = dateObj.getFullYear() + '-' + ('0' + (dateObj.getMonth() + 1)).slice(-2) + '-' + ('0' + dateObj.getDate()).slice(-2);

                // format dateObj to yyyymmddhhmmss
                var dateStr2 = dateObj.getFullYear() + ('0' + (dateObj.getMonth() + 1)).slice(-2) + ('0' + dateObj.getDate()).slice(-2) + ('0' + dateObj.getHours()).slice(-2) + ('0' + dateObj.getMinutes()).slice(-2) + ('0' + dateObj.getSeconds()).slice(-2);

                fs.mkdirSync(snap.folder_path + '/backup/' + snap._id + '/' + dateStr1 + '/', { recursive: true }, (err) => {
                    if (err) throw err;
                });

                var filePath = snap.folder_path + '/cron/' + snap._id + '/' + snap._id + '-backup-job.txt';
                content += 'exportcfg "' + snap.folder_path + '/backup/' + snap._id + '/' + snap._id + '-' + dateStr2 + '-config.xml" \n';

                for (var i = 0; i < snap.channels.length; i++) {
                    content += 'export ' + snap.channels[i].id + ' "' + snap.folder_path + '/backup/' + snap._id + '/' + dateStr1 + '/' + snap.channels[i].name + '-' + dateStr2 + '.xml" \n';
                }

                // check if snap.channels.length is 0 or undefined
                if (snap.channels.length == 0 || snap.channels == undefined || snap.channels == null) {
                    content += 'export * "' + snap.folder_path + '/backup/' + snap._id + '/' + dateStr1 + '/"';
                }
                fs.writeFileSync(filePath, content);

                const job = cron.schedule(snap.cron_expression, async () => {
                    const commandLine = spawn(snap.exec_path, ['-s', filePath]);
                    let output = { message: '' };  // initialize output object

                    commandLine.stdout.on('data', (data) => {
                        console.log(`Command Line stdout: ${data}`);
                    });

                    commandLine.stderr.on('data', (data) => {
                        console.error(`Command Line stderr: ${data}`);
                        output.message = `Error: Command Line stderr: ${data}`; // update message property
                        jobRunning = false;
                        callback(jobRunning);
                    });

                    commandLine.on('close', (code) => {
                        console.log(`Command Line exited with code ${code}`);
                        output.message = 'Snap successfully set to active.'; // update message property
                        jobRunning = true;
                        callback(jobRunning);
                    });

                    await new Promise(resolve => commandLine.on('close', resolve)); // wait until CLI is closed
                    return output;
                }, {
                    scheduled: false
                });

                jobs[snap._id.toString()] = { task: job, status: false };

                // check debug if true and print using console.log
                (debug ? console.log('start_all_snaps_auto: ' + JSON.stringify(job)) : '');
                job.start();
                // callback function to add job in jobs object array when cron async is done
                function callback(i) {
                    (debug ? console.log('callback: ' + i) : '');
                    if (i) {
                        jobs[snap._id.toString()] = { task: job, status: true };
                        return;
                    } else {
                        job.stop();
                        delete jobs[snap._id.toString()];
                        return;
                    }
                }

            });
        }
    });
}

exports.stop_snap = function (req, res) {
    Snap.findById(req.params.snapId, function (err, snap) {
        if (err) res.status(400).json({ error: 'An error occured with your request.' });

        if (snap == null) {
            res.status(500).json({ error: 'An error occurred while starting the snap. Snap not found' });
        } else {
            if (jobs[snap._id.toString()] == null) {
                res.json({ message: 'Snap successfully stopped.' });
            } else {
                jobs[snap._id.toString()].task.stop();
                // remove job from jobs array
                delete jobs[snap._id.toString()];

                Snap.findOneAndUpdate({ _id: snap._id }, { $set: { status: 'inactive' } })
                    .then(() => {
                        res.json({ message: 'Snap successfully stopped.' });
                    })
                    .catch(err => {
                        console.log('Error: ' + err);
                        res.status(500).json({ error: 'An error occurred while stopping the snap.' });
                    });
            }
        }
    });
}

// get all item in jobs array
exports.get_all_jobs = function (req, res) {
    // put all jobs in array
    var obj = {};
    for (var key in jobs) {
        obj[key] = jobs[key]['status'];
    }
    res.json(obj);
}