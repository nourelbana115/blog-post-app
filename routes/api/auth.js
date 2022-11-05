const expres = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const router = expres.Router();

router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).send('server error');
  }
});

// User login

router.post(
  '/',
  [
    check('email', 'please, enter a valid Email').isEmail(),
    check('password', 'please enter a valid password').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .send({ errors: [{ msg: 'invalid credentials' }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .send({ errors: [{ msg: 'Invalid credentials' }] });
      }

      const payload = {
        user: user,
      };
      jwt.sign(
        payload,
        process.env.jwtToken,
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json(token);
        }
      );
    } catch (error) {
      console.log(error);
      res.status(500).send('server error');
    }
  }
);
module.exports = router;
