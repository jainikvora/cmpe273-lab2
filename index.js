var connect = require('connect');
var login = require('./login');

var app = connect();

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var qs = require('qs');


app.use(bodyParser.json()); // Parse JSON request body into `request.body`
app.use(bodyParser.urlencoded({extended: true})); // Parse form in request body into `request.body`
app.use(cookieParser()); // Parse cookies in the request headers into `request.cookies`
//app.use(qs.query()); // Parse query string into `request.query`

app.use('/', main);

function main(request, response, next) {
	switch (request.method) {
		case 'GET': get(request, response); break;
		case 'POST': post(request, response); break;
		case 'DELETE': del(request, response); break;
		case 'PUT': put(request, response); break;
	}
};

function get(request, response) {
	var cookies = request.cookies;
	console.log(cookies);
	if ('session_id' in cookies) {
		var sid = cookies['session_id'];
		if ( login.isLoggedIn(sid) ) {
			response.setHeader('Set-Cookie', 'session_id=' + sid);
			response.end(login.hello(sid));	
		} else {
			response.end("Invalid session_id! Please login again\n");
		}
	} else {
		response.end("Please login via HTTP POST\n");
	}
};

function post(request, response) {
	var name = request.body.name;
	var email = request.body.email;

	if(name && email) {
		var newSessionId = login.login(name, email);
			
		response.writeHead(200, {
			'Set-Cookie':'session_id='+newSessionId,
			'Content-Type': 'text/html'
		});
		
		response.end(login.hello(newSessionId));		
	} else {
		response.end("Name or email is missing! Please login again");
	}


};

function del(request, response) {
	console.log("DELETE:: Logout from the server");
 	var cookies = request.cookies;
	console.log(cookies);
	if ('session_id' in cookies) {
		var sid = cookies['session_id'];
		login.logout(sid);
	  	response.end('Logged out from the server\n');
	} else {
		response.end('Session not found! Please login via HTTP POST');
	}
 	
};

function put(request, response) {
	console.log("PUT:: Re-generate new seesion_id for the same user");
	var cookies = request.cookies;
	if ('session_id' in cookies) {
		var sid = cookies['session_id'];
		// generate a new session id for the user
		var newSessionId = login.refreshId(sid);
		
		// set the cookine in the response header
		response.writeHead(200, {
			'Set-Cookie':'session_id='+newSessionId,
			'Content-Type': 'text/html'
		});
		response.end(login.hello(newSessionId));
	} else {
		response.end("Session not found! Please login via HTTP POST");
	}

};

app.listen(8000);

console.log("Node.JS server running at 8000...");