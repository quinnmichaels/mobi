var loc = {
	newKey: function() {
		var crypto = require('crypto'),
			str = new Date().toString() + Math.floor(Math.random()*1000000).toString(),
			key = crypto.createHash('md5').update(str).digest('hex');
		return key;
	},
	profile: function() {
		return {
			auth: '',
			user: loc.newKey(),
			team: loc.newKey(),
			profile: {
				email: '',
				name: ''
			},
			projects: [loc.project()],
			statuses: [
				{name:'to-do',color:'red'},
				{name:'in-progress', color:'yellow'},
				{name:'on-hold', color:'green'},
				{name:'complete', color:'darkgray'},
				{name:'archive', color:'white'}
			]
		}
	},
	project: function() {
		return {
			title: 'blank',
			desc: 'blank project',
			url: 'blank.html',
			status: 'in-progress',
			notes: [],
			cards: [],
		}
	},
	card: function() {
		return {
			title:'',
			desc:'',
			due:'',
			issue:'',
			status:'',
			timer: [],
			checklist:[]
		};
	}
}


exports.newuser = function(db) {
	return function(req, res) {
		if (!req.query.code) res.redirect('/consent');
		var collection = db.get('profiles'),
			prof = loc.profile(); 		//crate new profile

		prof.auth = req.query.code;		// fill new profile with default values

		collection.find({auth:prof.auth}, function(err, doc) {
			// if user exists logic
			if (doc.length) {
				res.render('dupe', {layout: 'main',
					title: 'Already in System',
					data: doc
				});
			} else {
				collection.insert(prof, function (err, doc) {
					if (err) throw err;
					res.redirect('/app?auth='+prof.auth);
				});
			}
		});
	};
};



