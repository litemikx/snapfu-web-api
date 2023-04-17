'use strict';

module.exports = function (app) {
    var executeController = require('../controllers/mainController');
    var authController = require('../controllers/authController');
    var connectionController = require('../controllers/connectionController');
    var snapController = require('../controllers/snapController');

    app.route('/api/accounts')
        .post(authController.check_token)
        .get(executeController.list_all_accounts);

    app.route('/api/account/:accountId')
        .post(authController.check_token)
        .get(executeController.read_account)
        .put(executeController.update_account);

    app.route('/api/accounts/delete/all')
        .post(authController.check_token)
        .delete(executeController.delete_account);

    app.route('/api/register')
        .post(authController.register_account);

    app.route('/api/me')
        .post(authController.check_token)
        .get(authController.view_account);

    app.route('/api/login')
        .post(authController.check_login);

    app.route('/api/verify/:tokenId')
        .get(authController.verify_account);

    app.route('/')
        .get(executeController.direct_to_home);

    app.route('/api/send')
        .post(authController.send_email_verification);

    app.route('/api/connections/create')
        .post(authController.check_token)
        .post(connectionController.create_connection);

    app.route('/api/connections')
        .post(authController.check_token)
        .post(connectionController.list_connections);

    app.route('/api/connections/delete/:connectionId')
        .post(authController.check_token)
        .post(connectionController.delete_connection);

    app.route('/api/connections/update/:connectionId')
        .post(authController.check_token)
        .post(connectionController.update_connection);

    // Snap
    app.route('/api/snaps/create')
        .post(authController.check_token)
        .post(snapController.create_snap);

    app.route('/api/snaps')
        .post(authController.check_token)
        .post(snapController.list_snaps);

    app.route('/api/snaps/delete/:snapId')
        .post(authController.check_token)
        .post(snapController.delete_snap);

    app.route('/api/snaps/update/:snapId')
        .post(authController.check_token)
        .post(snapController.update_snap);

    app.route('/api/snaps/start/:snapId')
        .post(authController.check_token)
        .post(snapController.start_snap);
    
    app.route('/api/snaps/start')
        .post(authController.check_token)
        .post(snapController.start_all_snaps);

    app.route('/api/snaps/stop/:snapId')
        .post(authController.check_token)
        .post(snapController.stop_snap);

    // route to get all jobs
    app.route('/api/snaps/jobs')
        .post(authController.check_token)
        .post(snapController.get_all_jobs);

};

