var express = require('express');
var app = express();
var Q = require("q");

app.use("/eap/", express.static('public'));

const pythonShell = require('python-shell');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

const mustache = require('mustache-express');
app.engine('mustache', mustache());
app.set('view engine', 'mustache');


var testing = true;

var last_trial_id = 0;
var trials = {};

function getPoem(type) {
  var toR = Q.defer();
  var options = { pythonPath: 'python3'};

  if (type =="rnn") {
    pythonShell.run('pick_selection_rnn.py', options, function (err, poem) {
      if (poem == null) {
        poem = "of his elect content,<br>conform my soul as t were a church<br><br>unto her sacrament<br><br>love<br><br>love is anterior to life,<br><br>posterior to death,<br><br>initial of creation, and<br><br>the exponent of breath<br><br>satisfied<br><br>one blessing had i, than the rest<br><br>so larger to my eyes<br><br>that i stopped gauging, satisfied,<br><br>for this enchanted size<br><br>it was the limit of my dream,<br><br>the focus of my prayer, --<br><br>a perfect, paralyzing bliss<br><br>contented as despair<br><br>i knew no more of want or cold,<br>";
        toR.resolve(poem);
        return;
      }
      poem = poem.join("<br />");
      toR.resolve(poem);
    });
  } else if (type == "human") {
    pythonShell.run('pick_selection_human.py', options, function (err, poem) {
      if (poem == null) {
        poem = "of his elect content,<br>conform my soul as t were a church<br><br>unto her sacrament<br><br>love<br><br>love is anterior to life,<br><br>posterior to death,<br><br>initial of creation, and<br><br>the exponent of breath<br><br>satisfied<br><br>one blessing had i, than the rest<br><br>so larger to my eyes<br><br>that i stopped gauging, satisfied,<br><br>for this enchanted size<br><br>it was the limit of my dream,<br><br>the focus of my prayer, --<br><br>a perfect, paralyzing bliss<br><br>contented as despair<br><br>i knew no more of want or cold,<br>";
        toR.resolve(poem);
        return;
      }
      poem = poem.join("<br />");
      toR.resolve(poem);
    });
  }
  return toR.promise;
}

function generateTrial() {
  var toR = Q.defer();

  // pick if we are using RNN or human
  // fake_id True: rnn, False: human
  // kinda redundant but I am lazy to change it due to legacy code
  var fake_id = flip() == 0;
  var type = fake_id? "rnn": "human";
  var trial_id = last_trial_id++;

  trials[trial_id] = {
    "fake_poem": fake_id,
    "type": type,
    "answer": false
  };

  var poem = getPoem(type);

  return poem.then(function (poem) {
    return Q.all([0.35, 0.35])
      .then(function (sent) {
        return {
          "poem": poem,
          "trial_id": trial_id,
          "poem1sentiment": sentToColor(sent[0]),
          "poem1textcolor": textColor(sent[0])
        };
      });
  });
}

function sentToColor(num) {
  if (num < .25) {
    return ("#2E3E56");
  } else if (num > .25 && num < .45) {
    return ("#174D6B");
  } else if (num > .45 && num < .55) {
    return ("#4E8981");
  } else if (num > .55 && num < .75) {
    return ("#91C6B2");
  } else if (num > .75) {
    return ("#FCEDC9");
  } else {
    return ("#FCEDC9");
  }
}

function textColor(num) {
  if (num < .25) {
    return ("#F2F1EF");
  } else if (num > .25 && num < .45) {
    return ("#F2F1EF");
  } else if (num > .45 && num < .55) {
    return ("#F2F1EF");
  } else if (num > .55 && num < .75) {
    return ("#2E3E56");
  } else if (num > .75) {
    return ("#2E3E56");
  } else {
    return ("#2E3E56");
  }
}

function flip() {
  return Math.floor((Math.random() * 2));
}

function tallyResults() {
  var rnnTotal = 0;
  var humanTotal = 0;
  var rnnRight = 0;
  var humanRight = 0;

  for (var key in trials) {
    var trial = trials[key];
    // if (!trial.answer)
    //   continue;

    // fake_poem == true if it is from human
    // answer == true if the user click humanButton
    if (trial.type == "rnn") {
      rnnTotal++;
      // fake_poem will be true
      // people got it right if the pick compubterButton (answer = false)
      if (trial.fake_poem != trial.answer) {
        rnnRight++;
      }
    } else if (trial.type == "human") {
      humanTotal++;
      // fake_poem will be false
      // people got it right if the pick humanButton (answer = true)
      if (trial.fake_poem != trial.answer) {
        humanRight++;
      }
    }
  }

  return {"rnnTotal": rnnTotal,
    "humanTotal": humanTotal,
    "rnnRight": rnnRight,
    "humanRight": humanRight};
}

app.get('/eap/charts', function(req, res) {
  res.render('charts');
});

app.get('/eap/chartInfo', function(req, res){
  var results = tallyResults();
  results.humanRight += 1;
  results.humanTotal += 1;
  results.rnnRight +=1;
  results.rnnTotal +=1;
  res.send(results);
});

app.get('/eap/', function (req, res) {
  generateTrial().then(function (trial) {
    res.render('turing',
      { "poem1": trial.poem,
        "trial_id": trial.trial_id,
        "poem1sentiment": trial.poem1sentiment,
        "poem1textcolor": trial.poem1textcolor,
      });
  });
});

// humanButton: 'answer': true
// computerButton: 'answer': false
app.post('/eap/ajaxSendData', function(req, res) {
  if (!(req.body.trial_id in trials)) {
    res.send({"result": false});
    return;
  }
  trials[req.body.trial_id].answer = req.body.answer === "true";

  // return true if correct
  // correct: answer (true if clicked humanButton) != fake_poem (not from human)
  res.send({"result": trials[req.body.trial_id].answer != trials[req.body.trial_id].fake_poem});
});

app.get('/eap/ajaxGetData', function(req, res){
  generateTrial().then(function (trial) {
    res.send({ "poem1": trial.poem,
      "trial_id": trial.trial_id,
      "poem1color": trial.poem1sentiment,
      "poem1textcolor": trial.poem1textcolor
    });
  });
});

app.get('/eap/scores', function(req, res) {
  res.render("leaderboard", {});
});

app.get('/eap/scoreboard', function (req, res) {
  var people = [
    { "name": "John", "correct": 5, "incorrect": 5, "percent correct": "50%"},
    { "name": "Some other guy", "correct": 100, "incorrect": 25, "percent correct": "asfa$%"},
    { "name": "mmmhmmm", "correct": 22, "incorrect": 2, "percent correct": "%gds%"}
  ]
  res.render('scoreboard', {"people": people});
});

app.listen(3001, "127.0.0.1", function () {
  console.log("Running");
});
