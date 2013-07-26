module.exports = function(sails) {


	/**
	 * Module dependencies.
	 */

	var interpret	= require('./interpreter/interpret')(sails),
		getVerb		= require('./interpreter/getVerb');



	/**
	 * Fired after a socket is connected
	 */

	return function onConnect (socket) {
		sails.log.info('A socket.io client ('+ socket.id + ') connected successfully!');

		// Legacy support of `message`
		mapRoute('message');

		// Verb support
		mapRoute('get');
		mapRoute('post');
		mapRoute('put');
		mapRoute('delete');

		// Map a socket message to the router
		function mapRoute (messageName) {
			socket.on(messageName, function (socketReq, callback) {

				var verb = getVerb(socketReq, messageName);
				sails.log.info('Routing message over socket ['+socket.flags.endpoint+']: ', socketReq, verb);

				callback = callback || function noCallback(body, status) {
					sails.log.error('No callback specified!');
				};

				// Translate socket.io message to an Express-looking request
				interpret(socketReq, callback, socket, verb, function requestBuilt (err, request) {
					//sails.log.verbose("Interpret", err, request);
					if (err) {
						sails.log.error(err);
						return;
					}

					// Route socket.io request
					sails.emit('router:request', request.req, request.res);
				});

			});
		}
	};

};
