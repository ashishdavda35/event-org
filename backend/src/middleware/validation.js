const Joi = require('joi');

const validatePoll = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().min(1).max(200).required(),
    description: Joi.string().max(500).allow('').optional(),
    questions: Joi.array().items(
      Joi.object({
        _id: Joi.string().optional(), // Allow _id for existing questions
        type: Joi.string().valid('multiple-choice', 'rating', 'open-ended', 'word-cloud', 'ranking').required(),
        question: Joi.string().min(1).max(500).required(),
        options: Joi.array().items(
          Joi.object({
            _id: Joi.string().optional(), // Allow _id for existing options
            text: Joi.string().min(1).required(),
            value: Joi.string().min(1).required()
          })
        ).when('type', {
          is: Joi.string().valid('multiple-choice', 'ranking'),
          then: Joi.array().min(2).required(),
          otherwise: Joi.optional()
        }),
        required: Joi.boolean().default(true),
        settings: Joi.object({
          allowMultiple: Joi.boolean().default(false),
          minRating: Joi.number().min(1).max(10).default(1).optional(),
          maxRating: Joi.number().min(1).max(10).default(5).optional(),
          maxWords: Joi.number().min(1).max(10).default(3).optional()
        }).optional().default({})
      })
    ).min(1).required(),
    settings: Joi.object({
      allowAnonymous: Joi.boolean().default(true),
      showResults: Joi.boolean().default(true),
      allowMultipleSubmissions: Joi.boolean().default(false),
      isActive: Joi.boolean().default(true),
      endDate: Joi.date().allow('').optional()
    }).optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

const validateResponse = (req, res, next) => {
  const schema = Joi.object({
    participantName: Joi.string().min(1).max(100).required(),
    participantEmail: Joi.string().email().optional(),
    answers: Joi.array().items(
      Joi.object({
        questionId: Joi.string().required(),
        answer: Joi.alternatives().try(
          Joi.string(),
          Joi.number(),
          Joi.array(),
          Joi.object()
        ).required()
      })
    ).min(1).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

module.exports = { validatePoll, validateResponse };
