'use strict';

var express = require('express'),
    router = express.Router(),
    httpProxy = require('http-proxy'),
    authentication = require('../util/authentication'),
    util = require('util'),
    proxyOptions = {},
    proxy = httpProxy.createProxyServer(proxyOptions);

var startsWith = function (source, str) {
    return source.slice(0, str.length) === str;
};

var endsWith = function (source, str) {
    return source.slice(-str.length) === str;
};

/**
 * @api {post} /proxy/:prefix* Proxy everything that goes after :prefix to the application registered with the given prefix.
 * @apiName Proxy
 * @apiGroup Proxy
 *
 * @apiParam {String} prefix The unique prefix of a previously registered application.
 * @apiParam {String} ANY_ROUTE Relevant for the API this request will be forwarded to. The target API will receive this route.
 *
 * @apiParamExample {json} Request-Example:
 *
 *      Asuming we already have a registered application with the following data:
 *
 *          prefix: gleaner
 *          host: localhost:3300
 *          name: Gleaner App.
 *
 *      Given the following request GET /api/gleaner/traces/:traceId where:
 *
 *          gleaner is the prefix for the Gleaner App.
 *          /traces/:traceId is the extracted route from the request.
 *
 *      This request will be forwarded to the following address:
 *
 *          http://localhost:3300/traces:traceId
 *
 *      with...
 *
 *      {
 *          ...data relevant to the parameter that goes after prefix...
 *      }
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          ...data provided by the application this request was forwarded to...
 *      }
 *
 * @apiError(400) InvalidPrefix You must provide a valid prefix!
 *
 * @apiError(400) ApplicationNotFound No application found with the given prefix: <prefix>
 *
 * @apiError(400) UndefinedHost It seems that the application <appName> has an undefined host.
 *
 */
router.all('/:prefix*', authentication.authenticated, function (req, res, next) {
    var prefix = req.params.prefix;

    if (prefix) {
        req.app.db.model('application').findByPrefix(prefix, function (err, application) {
            if (err) {
                return next(err);
            }
            if (!application) {
                err = new Error('No application found with the given prefix: ' + prefix);
                err.status = 400;
                return next(err);
            }
            var host = application.host;
            if (host) {

                if (!startsWith(host, 'http')) {
                    host = 'http://' + host;
                }

                if (endsWith(host, '/')) {
                    host = host.slice(0, host.length - 1);
                }

                var resource =  prefix+req.params[0];
                var action = req.method.toLowerCase();
                var userId = req.user.username;

                req.app.acl.isAllowed(userId, resource, action, function (err, allowed) {
                    if (err) {
                        return next(err);
                    } else if (allowed === false) {
                        if (req.app.acl.logger) {
                            req.app.acl.logger.debug('Not allowed ' + action + ' on ' + resource + ' by user ' + userId);
                        }
                        req.app.acl.allowedPermissions(req.method.toLowerCase(), resource, function (err, obj) {
                            if (req.app.acl.logger) {
                                req.app.acl.logger.debug('Allowed permissions: ' + util.inspect(obj));
                            }
                        });
                        err = new Error('Insufficient permissions to access resource');
                        err.status = 403;
                        return next(err);
                    } else {
                        if (req.app.acl.logger) {
                            req.app.acl.logger.debug('Allowed ' + action + ' on ' + resource + ' by user ' + userId);
                        }

                        host += req.params[0];

                        if(req._parsedUrl.search) {
                            host += req._parsedUrl.search;
                        }

                        proxy.web(req, res, {
                            target: host,
                            ignorePath: true,
                            changeOrigin: true
                        }, function (err) {
                            if (err) {
                                err.status = 503;
                                return next(err);
                            }
                        });
                    }
                });
            } else {
                var appName = application.name;
                if (!appName) {
                    appName = prefix;
                } else {
                    appName += ' (' + prefix + ')';
                }
                err = new Error('It seems that the application ' + appName + ' has an undefined host.');
                err.status = 400;
                return next(err);
            }
        });
    } else {
        var err = new Error('You must provide a valid prefix!');
        err.status = 400;
        return next(err);
    }
});

module.exports = router;