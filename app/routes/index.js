exports.userlist = function(db) {
    return function(req, res) {
        var collection = db.get('profiles');
        collection.find({},{},function(e,docs){
            res.send(docs);
        });
    };
};


