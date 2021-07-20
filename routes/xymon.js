const env = require('dotenv');
const express = require('express');
const debug = require('debug')('api:xymon');
const { Xymon } = require('xymon');
const { name, version } = require('../package.json');

env.config();

const xymon = new Xymon({
  host: process.env.XYMONDHOST,
  port: process.env.XYMONDPORT,
});

debug(`connecting to '${xymon.host}:${xymon.port}'`);

const router = express.Router();

/**
 * @swagger
 * paths:
 *   /board:
 *     get:
 *       summary: >
 *         Retrieves a summary of the status of all known tests available to the Xymon daemon.
 *       description: |-
 *         AKA `/xymondboard`
 *
 *         By default all status messages that are found in Xymon will be returned.
 *
 *         Because host filtration is done before test filtration, it's more efficient
 *         (with very large data sets) to use PAGEPATH, HOSTNAME, NETWORK, and other XMH_
 *         filters when possible, before globally filtering with COLOR, *MSG, *TIME, or TESTNAME.
 *       parameters:
 *         - in: query
 *           name: fields
 *           description: >
 *             Comma separated list of fields.
 *             If the "fields" parameter is omitted, a default set of
 *             hostname, testname, color, flags, lastchange, logtime, validtime,
 *             acktime, disabletime, sender, cookie, line1 is used.
 *           schema:
 *             type: string
 *           required: false
 *         - in: query
 *           name: page
 *           description: include only tests on PAGEPATH
 *           schema:
 *             type: string
 *           required: false
 *         - in: query
 *           name: net
 *           description: include only tests from hosts in NETWORK
 *           schema:
 *             type: string
 *           required: false
 *         - in: query
 *           name: ip
 *           description: include only tests from host with IP
 *           schema:
 *             type: string
 *           required: false
 *         - in: query
 *           name: host
 *           description: include only tests from HOSTNAME
 *           schema:
 *             type: string
 *           required: false
 *         - in: query
 *           name: test
 *           description: include only tests TESTNAME
 *           schema:
 *             type: string
 *           required: false
 *         - in: query
 *           name: color
 *           description: >
 *             Include only tests where status color is *COLORNAME*.
 *             Accepts multiple colors separated by commas.
 *           schema:
 *             type: string
 *             enum: ['green', 'yellow', 'red', 'blue', 'clear', 'purple']
 *           required: false
 *         - in: query
 *           name: tag
 *           description: include only tests with specified TAGNAME
 *           schema:
 *             type: string
 *           required: false
 *       responses:
 *         '200':
 *           description: Returns array of status objects.
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     hostname:
 *                       type: string
 *                     testname:
 *                       type: string
 *                     color:
 *                       type: string
 */
router.get(['/xymondboard', '/board'], (req, res) => {
  let message = 'xymondboard';
  const { query } = req;

  if (typeof query.fields === 'string') {
    query.fields = query.fields.split(',');
  }

  Object.keys(query).forEach((k) => {
    message += ` ${k}=${query[k]}`;
  });

  xymon.relay(message, 'json').pipe(res);
});

/**
 * @swagger
 * paths:
 *   /log/{hostname}/{testname}:
 *     get:
 *       summary: Retrieve the Xymon status-log for a single test.
 *       description: >
 *         AKA `/xymondlog`
 *       parameters:
 *         - name: hostname
 *           in: path
 *           description: the HOSTNAME
 *           required: true
 *           schema:
 *             type: string
 *         - name: testname
 *           in: path
 *           description: the TESTNAME
 *           required: true
 *           schema:
 *             type: string
 *       responses:
 *         '200':
 *           description: Successful operation
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   hostname:
 *                     type: string
 *                   testname:
 *                     type: string
 *                   color:
 *                     type: string
 *                   flags:
 *                     type: string
 *                   lastchange:
 *                     type: integer
 *                   logtime:
 *                     type: integer
 *                   validtime:
 *                     type: integer
 *                   acktime:
 *                     type: integer
 *                   disabletime:
 *                     type: integer
 *                   sender:
 *                     type: string
 *                   cookie:
 *                     type: integer
 *                   ackmsg:
 *                     type: string
 *                   dismsg:
 *                     type: string
 *                   client:
 *                     type: string
 *                   msg:
 *                     type: string
 */
router.get(['/xymondlog/:hostname/:testname', '/log/:hostname/:testname'], (req, res) => {
  xymon.relay(`xymondlog ${req.params.hostname}.${req.params.testname}`, 'json').pipe(res);
});

/**
 * @swagger
 * paths:
 *   /hostinfo:
 *     get:
 *       summary: Retrieves the current configuration of host(s).
 *       parameters:
 *         - in: query
 *           name: page
 *           description: include only tests on PAGE
 *           schema:
 *             type: string
 *           required: false
 *         - in: query
 *           name: net
 *           description: include only tests from hosts in NET
 *           schema:
 *             type: string
 *           required: false
 *         - in: query
 *           name: ip
 *           description: include only tests from hosts IP
 *           schema:
 *             type: string
 *           required: false
 *         - in: query
 *           name: host
 *           description: include only tests from host HOST
 *           schema:
 *             type: string
 *           required: false
 *         - in: query
 *           name: tag
 *           description: include only tests with specified TAG
 *           schema:
 *             type: string
 *           required: false
 *       responses:
 *         '200':
 *           description: >
 *             Returns array of objects.
 *             Attribues starting with **field** are the various *TAG*(s) (if any) defined
 *             for a host in hosts.cfg.
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     hostname:
 *                       type: string
 *                     ip:
 *                       type: string
 *                     field3:
 *                       type: string
 */
router.get(['/hostinfo'], (req, res) => {
  let message = 'hostinfo';

  Object.keys(req.query).forEach((k) => {
    message += ` ${k}=${req.query[k]}`;
  });

  xymon.relay(message, 'json').pipe(res);
});

/**
 * @swagger
 * paths:
 *   /ghosts:
 *     get:
 *       summary: Report a list of ghost clients seen by the Xymon server.
 *       description: >
 *         AKA `/ghostlist`
 *         Ghosts are systems that report data to the Xymon server,
 *         but are not listed in the hosts.cfg file.
 *       tags:
 *         - Server
 *       responses:
 *         '200':
 *           description: Successful operation
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     hostname:
 *                       type: string
 *                     ip:
 *                       type: string
 *                     lastchange:
 *                       type: integer
 */
router.get(['/ghostlist', '/ghosts'], (req, res) => {
  xymon.relay('ghostlist', 'json').pipe(res);
});

/**
 * @swagger
 * paths:
 *   /ping:
 *     get:
 *       summary: >
 *         Attempts to contact the Xymon server.
 *         If successful, the Xymon server version ID is reported.
 *       tags:
 *         - Server
 *       responses:
 *         '200':
 *           description: Successful operation
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   result:
 *                     type: string
 */
router.get('/ping', (req, res) => {
  xymon.relay('ping', 'json').pipe(res);
});

/**
 * @swagger
 * paths:
 *   /clientlog/{hostname}/{section}:
 *     get:
 *       summary: >
 *         Retrieves particular section of the current raw client message last sent by HOSTNAME.
 *       parameters:
 *         - name: hostname
 *           in: path
 *           description: the HOSTNAME
 *           required: true
 *           schema:
 *             type: string
 *         - name: section
 *           in: path
 *           description: >
 *             The SECTION.
 *             Custom sections are supported outside of swagger doc just be sure to
 *             urlencode the section.
 *             Example:
 *               `msgs%3A%2Fvar%2Flog%2Fmessages`
 *             Multiple sections are supported. Separate with a comma (,).
 *           required: true
 *           schema:
 *             type: string
 *             enum:
 *               - 'collector:'
 *               - date
 *               - uname
 *               - osversion
 *               - uptime
 *               - who
 *               - df
 *               - inode
 *               - mount
 *               - free
 *               - ifconfig
 *               - route
 *               - netstat
 *               - ports
 *               - ifstat
 *               - ps
 *               - nproc
 *               - top
 *               - vmstat
 *               - clientversion
 *               - ipcs
 *               - meminfo
 *               - mounts
 *               - vmstats
 *               - clock
 *               - 'msgs:/var/log/messages'
 *               - 'logfile:/var/log/messages'
 *             default: 'collector:'
 *       responses:
 *         '200':
 *           description: Successful operation
 *           content:
 *             text/plain:
 *               schema:
 *                 type: string
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   result:
 *                     type: string
 *   /clientlog/{hostname}:
 *     get:
 *       summary: Retrieves the current full raw client message last sent by HOSTNAME.
 *       parameters:
 *         - name: hostname
 *           in: path
 *           description: the HOSTNAME
 *           required: true
 *           schema:
 *             type: string
 *       responses:
 *         '200':
 *           description: Successful operation
 *           content:
 *             text/plain:
 *               schema:
 *                 type: string
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   result:
 *                     type: string
 */
router.get(['/clientlog/:hostname/:section', '/clientlog/:hostname'], (req, res) => {
  let message = `clientlog ${req.params.hostname}`;

  if (req.params.section) {
    message += ` section=${req.params.section}`;
  }

  const format = req.accepts('text') ? 'text' : 'json';

  xymon.relay(message, format).pipe(res);
});

/**
 * @swagger
 * paths:
 *   /query/{hostname}/{testname}:
 *     get:
 *       summary: Query the Xymon server for the latest status reported for this particular test.
 *       parameters:
 *         - name: hostname
 *           in: path
 *           description: the HOSTNAME
 *           required: true
 *           schema:
 *             type: string
 *         - name: testname
 *           in: path
 *           description: the TESTNAME
 *           required: true
 *           schema:
 *             type: string
 *       responses:
 *         '200':
 *           description: Successful operation
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   result:
 *                     type: string
 */
router.get('/query/:hostname/:testname', (req, res) => {
  xymon.relay(`query ${req.params.hostname}.${req.params.testname}`, 'json').pipe(res);
});

/**
 * @swagger
 * paths:
 *   /enable/{hostname}/{testname}:
 *     post:
 *       summary: Re-enables a test that had been disabled.
 *       tags:
 *         - Admin
 *       parameters:
 *         - name: hostname
 *           in: path
 *           description: the HOSTNAME
 *           required: true
 *           schema:
 *             type: string
 *         - name: testname
 *           in: path
 *           description: the TESTNAME (use * for all)
 *           required: true
 *           schema:
 *             type: string
 *       responses:
 *         '200':
 *           description: Successful operation
 */
router.post('/enable/:hostname/:testname', (req, res) => {
  xymon.relay(`enable ${req.params.hostname}.${req.params.testname}`, 'json').pipe(res);
});

/**
 * @swagger
 * paths:
 *   /disable/{hostname}/{testname}:
 *     post:
 *       summary: Disables a specific test for DURATION minutes.
 *       tags:
 *         - Admin
 *       requestBody:
 *         description: Reason
 *         required: false
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               default: maintenance
 *       parameters:
 *         - name: hostname
 *           in: path
 *           description: the HOSTNAME
 *           required: true
 *           schema:
 *             type: string
 *         - name: testname
 *           in: path
 *           description: the TESTNAME (use * for all)
 *           required: true
 *           schema:
 *             type: string
 *         - in: query
 *           name: duration
 *           description: >
 *             The duration in minutes
 *             (s/m/h/d is interpreted as being in seconds/minutes/hours/days respectively).
 *             Default is "until OK"
 *           schema:
 *             type: string
 *           required: false
 *       responses:
 *         '200':
 *           description: Successful operation
 */
router.post('/disable/:hostname/:testname', (req, res) => {
  let duration = '-1';

  if (req.query.duration) {
    duration = req.query.duration;
  }

  const message = `disable ${req.params.hostname}.${req.params.testname} ${duration} ${req.body ?? ''}`;

  xymon.relay(message, 'json').pipe(res);
});

/**
 * @swagger
 * paths:
 *   /notify/{hostname}/{testname}:
 *     post:
 *       summary: This triggers an informational message to be sent.
 *       tags:
 *         - Admin
 *       description: >
 *         The message will go to those who receive alerts for this HOSTNAME+TESTNAME combination.
 *         Serves as a general way of notifying server administrators.
 *       requestBody:
 *         description: Informational message
 *         required: true
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               default: maintenance
 *       parameters:
 *         - name: hostname
 *           in: path
 *           description: the HOSTNAME
 *           required: true
 *           schema:
 *             type: string
 *         - name: testname
 *           in: path
 *           description: the TESTNAME
 *           required: true
 *           schema:
 *             type: string
 *       responses:
 *         '200':
 *           description: Successful operation
 */
router.post('/notify/:hostname/:testname', (req, res) => {
  const message = `notify ${req.params.hostname}.${req.params.testname} ${req.body}`;
  xymon.relay(message, 'json').pipe(res);
});

/**
 * @swagger
 * paths:
 *   /drop/{hostname}/{testname}:
 *     delete:
 *       summary: Remove data about a single test (column).
 *       tags:
 *         - Admin
 *       parameters:
 *         - name: hostname
 *           in: path
 *           description: the HOSTNAME
 *           required: true
 *           schema:
 *             type: string
 *         - name: testname
 *           in: path
 *           description: the TESTNAME
 *           required: true
 *           schema:
 *             type: string
 *       responses:
 *         '200':
 *           description: Successful operation
 *   /drop/{hostname}:
 *     delete:
 *       summary: Removes all data stored about the host HOSTNAME.
 *       description: >
 *         It is assumed that you have already deleted the host from the hosts.cfg
 *         configuration file.
 *       tags:
 *         - Admin
 *       parameters:
 *         - name: hostname
 *           in: path
 *           description: the HOSTNAME
 *           required: true
 *           schema:
 *             type: string
 *       responses:
 *         '200':
 *           description: Successful operation
 */
router.delete([
  '/drop/:hostname/:testname',
  '/drop/:hostname'], (req, res) => {
  const message = `drop ${req.params.hostname} ${req.params.testname ?? ''}`;
  xymon.relay(message, 'json').pipe(res);
});

/**
 * @swagger
 * paths:
 *   /rename/{source}/{target}:
 *     post:
 *       summary: Rename all data for a host that has had its name changed.
 *       description: >
 *         You should do this after changing the hostname in the hosts.cfg configuration file.
 *       tags:
 *         - Admin
 *       parameters:
 *         - name: source
 *           in: path
 *           description: the source HOSTNAME
 *           required: true
 *           schema:
 *             type: string
 *         - name: target
 *           in: path
 *           description: the target HOSTNAME
 *           required: true
 *           schema:
 *             type: string
 *       responses:
 *         '200':
 *           description: Successful operation
 */
router.post(['/rename/:source/:target'], (req, res) => {
  const message = `rename ${req.params.source} ${req.params.target}`;
  xymon.relay(message, 'json').pipe(res);
});

/**
 * @swagger
 * paths:
 *   /rename/{hostname}/{source}/{target}:
 *     post:
 *       summary: Rename data about a single test (column).
 *       tags:
 *         - Admin
 *       parameters:
 *         - name: hostname
 *           in: path
 *           description: the HOSTNAME
 *           required: true
 *           schema:
 *             type: string
 *         - name: source
 *           in: path
 *           description: the source TESTNAME
 *           required: true
 *           schema:
 *             type: string
 *         - name: target
 *           in: path
 *           description: the target TESTNAME
 *           required: true
 *           schema:
 *             type: string
 *       responses:
 *         '200':
 *           description: Successful operation
 */
router.post(['/rename/:hostname/:source/:target'], (req, res) => {
  const message = `rename ${req.params.hostname} ${req.params.source} ${req.params.target}`;
  xymon.relay(message, 'json').pipe(res);
});

/**
 * @swagger
 * paths:
 *   /schedule:
 *     get:
 *       summary: Get the currently scheduled tasks.
 *       tags:
 *         - Schedule
 *       responses:
 *         '200':
 *           description: Returns array of objects
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     timestamp:
 *                       type: integer
 *                     sender:
 *                       type: string
 *                     command:
 *                       type: string
 *   /schedule/{id}:
 *     delete:
 *       summary: Delete scheduled task.
 *       tags:
 *         - Schedule
 *       parameters:
 *         - name: id
 *           in: path
 *           description: Job ID
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         '200':
 *           description: Successful operation
 *   /schedule/{timestamp}:
 *     post:
 *       summary: Schedules a command sent to the Xymon server for execution at a later time.
 *       tags:
 *         - Schedule
 *       parameters:
 *         - name: timestamp
 *           in: path
 *           description: >
 *             The Unix epoch time when the command will be executed.
 *             Use the following command to get the Unix epoch time an hour from now:
 *             `date --date="+1 hour" +%s`
 *           required: true
 *           schema:
 *             type: integer
 *           example: 1625670744
 *       requestBody:
 *         description: One of the Xymon commands.
 *         required: true
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *             examples:
 *               ping:
 *                 summary: ping
 *                 value: ping
 *               enable:
 *                 summary: enable
 *                 value: enable example.com.conn
 *               disable:
 *                 summary: disable
 *                 value: disable example.com.http 5 maintenance
 *       responses:
 *         '200':
 *           description: Successful operation
 */
router.get('/schedule', (req, res) => {
  xymon.relay('schedule', 'json').pipe(res);
});

router.delete('/schedule/:id', (req, res) => {
  xymon.relay(`schedule cancel ${req.params.id}`, 'json').pipe(res);
});

router.post('/schedule/:timestamp', (req, res) => {
  xymon.relay(`schedule ${req.params.timestamp} ${req.body}`, 'json').pipe(res);
});

/**
 * @swagger
 * paths:
 *   /version:
 *     get:
 *       summary: Get this API server details.
 *       tags:
 *         - Server
 *       responses:
 *         '200':
 *           description: Successful operation
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     version:
 *                       type: string
 */
router.get('/version', (req, res) => {
  res.json({ name, version });
});

module.exports = router;
