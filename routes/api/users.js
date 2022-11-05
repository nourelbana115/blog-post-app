const expres = require('express');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const router = expres.Router();
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');

router.post(
  '/',
  [
    check('name', 'name is required').not().isEmpty(),
    check('email', 'please, enter a valid Email').isEmail(),
    check('password', 'please enter a valid password').isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }
    const { name, email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .send({ errors: [{ msg: 'user already exists' }] });
      }
      const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm',
      });
      const newUser = new User({
        name,
        email,
        password,
        avatar,
      });
      const salt = await bcrypt.genSalt(10);
      newUser.password = await bcrypt.hash(password, salt);
      await newUser.save();
      const payload = {
        user: newUser,
      };
      jwt.sign(
        payload,
        config.get('jwtToken'),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json(token);
        }
      );
    } catch (error) {
      res.status(500).send('server error');
    }
  }
);

module.exports = router;
