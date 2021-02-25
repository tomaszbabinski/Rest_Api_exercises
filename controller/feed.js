exports.getPosts = (req, res, next) => {
    res.status(200).json({
        posts: [{title: 'sample data', content: 'Sample content'}]
    });
};

exports.createPost = (req, res, next) => {
    const title = req.body.title;
    const content = req.body.content;
    //Create post in db
    res.status(201).json({
        message: 'Post created successfuly',
        post: {
            id: new Date().toISOString(),
            title: title,
            content: content
        }
    });
};