exports.userlist = function(db) {
    return function(req, res) {
        var collection = db.get('auth');
        collection.find({},{},function(e,docs){
            res.send(docs);
        });
    };
};


