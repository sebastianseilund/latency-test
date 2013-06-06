var http = require('http'),
    async = require('async');

var servers = [
    'ec2-23-22-37-17.compute-1.amazonaws.com',
    'ec2-54-215-89-128.us-west-1.compute.amazonaws.com',
    'ec2-54-216-71-82.eu-west-1.compute.amazonaws.com',
    'ec2-54-250-0-81.ap-northeast-1.compute.amazonaws.com'
];

var requestCount = 100;

var results = {};

var queue = async.queue(worker);
queue.drain = finish;

pushTasks();

function pushTasks() {
    servers.forEach(function(server) {
        results[server] = [];
        for (var i = 0; i < requestCount; i++) {
            queue.push({
                server: server,
                i: i
            });
        }
    });
}

function worker(task, callback) {
    var server = task.server;
    var i = task.i;
    var start = Date.now();
    http.get('http://' + server + ':8012/'+i, function(res) {
        var t = Date.now() - start;
        results[server].push(t);
        console.log(server + ' #' + i+ ": " + t);
        callback();
    }).on('error', function(err) {
        throw err;
    });
}

function finish() {
    console.log('\n\n\n');
    console.log(pad('Server', 60, '.', STR_PAD_RIGHT) + pad('Average', 10, ' ', STR_PAD_LEFT));
    servers.forEach(function(server) {
        var ts = results[server];
        ts.sort(function(a, b) {
            return a - b;
        });
        var sum = ts.reduce(function(rest, t) {
            return rest + t;
        }, 0);
        var average = sum / ts.length;
        console.log(pad(server, 60, '.', STR_PAD_RIGHT) + pad(Math.round(average)+'', 10, ' ', STR_PAD_LEFT));
    });
}


var STR_PAD_LEFT = 1;
var STR_PAD_RIGHT = 2;
var STR_PAD_BOTH = 3;
function pad(str, len, pad, dir) {

    if (typeof(len) == "undefined") { var len = 0; }
    if (typeof(pad) == "undefined") { var pad = ' '; }
    if (typeof(dir) == "undefined") { var dir = STR_PAD_RIGHT; }

    if (len + 1 >= str.length) {

        switch (dir){

            case STR_PAD_LEFT:
                str = Array(len + 1 - str.length).join(pad) + str;
                break;

            case STR_PAD_BOTH:
                var right = Math.ceil((padlen = len - str.length) / 2);
                var left = padlen - right;
                str = Array(left+1).join(pad) + str + Array(right+1).join(pad);
                break;

            default:
                str = str + Array(len + 1 - str.length).join(pad);
                break;

        } // switch

    }

    return str;

}