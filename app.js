var express = require('express');
var app     = express();
var Github = require('github-api');
var odk_token = process.env.ODK_TOKEN;
var github_token = process.env.GITHUB_TOKEN;

app.use(express.json());

var github =  new Github({token: github_token, auth: "oauth"});

// Receive webhook post
app.post('/:user/:repo/:branch', function(req, res) {

    var data = req.body;

    if (data.token !== odk_token) {
        res.send(403);
        return;
    }

    // Close connection
    res.send(202);

    var repo = github.getRepo(req.params.user, req.params.repo);
    var branch = req.params.branch;
    var uuid = data.data.instanceID.replace(/^uuid:/, "");
    var filename = data.formId + "/" + uuid + ".json";

    repo.write(branch, filename, JSON.stringify(data, null, "  "), "Added new form response " + uuid, function(err) { 
        if (err) {
            console.log(err);
        } else {
            console.log("commited form instance " + uuid);
        } 
    });

});

// Start server
var port = process.env.PORT || 8080;
app.listen(port);
console.log('Listening on port ' + port);
