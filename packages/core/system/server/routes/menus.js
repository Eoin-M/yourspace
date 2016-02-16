'use strict';

var mean = require('meanio');

module.exports = function(System, app, auth, database) {

    app.route('/api/admin/menu/:name')
        .get(function(req, res) {
			debugger
			console.log("-------------------------------------");
			if (req.session.user != null) req.user = req.session.user;
			//console.log(req.user);
			var roles = req.user ? JSON.parse(JSON.stringify(req.user.roles)) : ['anonymous'],
            menu = req.params.name || 'main',
            defaultMenu = req.query.defaultMenu || [],
            itemsRes = [],
            tmpMenu;
			
			console.log("0");

            if (menu === 'main' && roles.indexOf('admin') !== -1) {
                roles.splice(roles.indexOf('admin'), 1);
            } else if (menu === 'modules') {
                menu = 'main'
                tmpMenu = 'modules';
            };
			console.log("1");

            if (!Array.isArray(defaultMenu)) defaultMenu = [defaultMenu];

            var items = mean.menus.get({
                roles: roles,
                menu: menu,
                defaultMenu: defaultMenu.map(function(item) {
                    return JSON.parse(item);
                })
            });
			console.log("2");
            if (menu !== 'main') return res.json(items);


            items.forEach(function(item) {
                if (tmpMenu && tmpMenu === 'modules' && item.roles.indexOf('admin') > -1) itemsRes.push(item);
                else if (!tmpMenu && menu === 'main' && item.roles.indexOf('admin') < 0) itemsRes.push(item);
            });
			console.log("3");

            res.json(itemsRes);
        });
};
