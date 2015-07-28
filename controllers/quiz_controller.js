var models = require('../models/models.js');

// POST /quizes/create
exports.create = function (req, res) {
	var quiz = models.Quiz.build(req.body.quiz);
	quiz.tema = req.body.tema;
	console.log("entra" + quiz);
	quiz.validate().then(
		function (err) {
			if (err) {
			console.log("err" + err);
				res.render('quizes/new',{
					quiz:quiz, 
					errors:err.errors}
					);
			}else{
				console.log("else" );
				quiz.save({fields:["pregunta","respuesta","tema"]}).then(function () {
					res.redirect('/quizes');
				});
			}
		}
	);

};


// GET /quizes/new
exports.new = function(req, res) {
	var quiz = models.Quiz.build(
	{
		pregunta: "Pregunta", 
		respuesta: "Respuesta", 
		tema: "Tema"
	}
	);
	res.render('quizes/new', 
	{
		quiz : quiz,
		errors: []
	}
	);
};

// GET /quizes/:quizId
exports.show = function(req, res) {
  res.render('quizes/show', {
    quiz: req.quiz,
    errors: []
  });
};

// GET /quizes/:quizId/answer
exports.answer = function(req, res) {
  if (req.query.respuesta === req.quiz.respuesta) {
    res.render('quizes/answer', {
      quiz: req.quiz,
      respuesta: 'Correcto',
      errors: []
    });
  }
  else {
    res.render('quizes/answer', {
      quiz: req.quiz,
      respuesta: 'Incorrecto'
    });
  }
}


// GET /quizes
exports.index = function(req, res, next) {
  var search = ("%" + (req.query.search || "") + "%").replace(' ', '%');
  models.Quiz.findAll({
    where: ['pregunta like ?', search]
  }).then(function(quizes) {
    res.render('quizes/index.ejs', {
      // devuelve una lista ordenada si se ha realizado una busqueda
      quizes: (req.query.search) ? quizes.sort(function(a, b) {
        return a.pregunta > b.pregunta;
      }) : quizes,
      errors: []
    })
  }).catch(function(error) {
    next(error);
  });
}

// Autoload - factoriza el codigo si ruta incluye :quizId
exports.load = function(req, res, next, quizId) {
  models.Quiz.find(quizId).then(
    function(quiz) {
      if (quiz) {
        req.quiz = quiz;
        next();
      }
      else {
        next(new Error('No existe quizId=' + quizId));
      }
    });
}
