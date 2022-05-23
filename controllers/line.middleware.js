const showInfo = async(req, res, next) => {
    console.log(req.body.events);
    next();
}

module.exports = {
    showInfo
}