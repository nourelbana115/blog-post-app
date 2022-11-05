const expres = require('express');
const router = expres.Router();
const User = require('../../models/User');
const Profile = require('../../models/Profile');
const Post = require('../../models/Post');
const auth = require('../../middleware/auth');
const { check, validationResult, body } = require('express-validator');
const request = require('request');
const config = require('config');
const { post } = require('./profile');

router.post(
  '/',
  [auth, [check('text', 'text is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user._id).select('-password');
      const newPost = new Post({
        text: req.body.text,
        user: user._id,
        avatar: user.avatar,
        name: user.name,
      });
      const post = await newPost.save();
      res.json(post);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('server error');
    }
  }
);

router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('server error');
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: 'post not found' });
    }
    res.json(post);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('server error');
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    if (post.user.toString() !== req.user._id) {
      return res.status(401).send({ msg: 'user not authorized' });
    }
    await post.remove();

    res.json({ msg: 'Post removed' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('server error');
  }
});

router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.likes.includes(req.user._id)) {
      return res.status(400).send({ msg: 'post already liked' });
    }
    post.likes.push(req.user._id);
    await post.save();

    res.json(post.likes);
  } catch (error) {
    console.log(error);
    res.status(500).send('server error');
  }
});

router.put('/unlike/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.user._id)) {
      return res.status(400).send({ msg: 'post has not been liked' });
    }
    const removeIndex = post.likes
      .map((like) => like.toString())
      .indexOf(req.user._id);
    post.likes.splice(removeIndex, 1);
    await post.save();
    res.json(post.likes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('server error');
  }
});

router.post(
  '/comment/:id',
  [auth, [check('text', 'text is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user._id).select('-password');
      const post = await Post.findById(req.params.id);

      const newComment = {
        text: req.body.text,
        user: user._id,
        avatar: user.avatar,
        name: user.name,
      };
      post.comments.unshift(newComment);
      await post.save();
      res.json(post.comments);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('server error');
    }
  }
);

router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Pull out comment
    const comment = post.comments.find(
      (comment) => comment.id === req.params.comment_id
    );
    // Make sure comment exists
    if (!comment) {
      return res.status(404).json({ msg: 'Comment does not exist' });
    }
    // Check user
    if (comment.user.toString() !== req.user._id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    post.comments = post.comments.filter(
      ({ id }) => id !== req.params.comment_id
    );

    await post.save();

    return res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
});

module.exports = router;
