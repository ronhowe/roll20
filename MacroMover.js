on('ready', function () {
    'use strict';

    var keyFormat = function (text) {
        return (text && text.toLowerCase().replace(/\s+/, '')) || undefined;
    },
        matchKey = function (keys, subject) {
            return subject && !_.isUndefined(_.find(keys, (o) => (-1 !== subject.indexOf(o))));
        },
        simpleObject = function (o) {
            return JSON.parse(JSON.stringify(o));
        },

        saveToHandout = function (name, data) {
            var handout = findObjs({
                type: 'handout',
                name: name
            })[0] || createObj('handout', {
                name: name
            });
            handout.set({ notes: data });
        },
        getFromHandout = function (name, callback) {
            var handout = findObjs({
                type: 'handout',
                name: name
            })[0];
            if (handout) {
                handout.get('notes', callback);
            } else {
                callback('');
            }
        },

        packForPlayer = function (player) {
            let mcount = 0,
                macros = Base64.encode(JSON.stringify(_.chain(findObjs({ type: 'macro', playerid: player.id }))
                    .tap((o) => { mcount = o.length; })
                    .map(simpleObject)
                    .map((m) => {
                        m.playerid = m._playerid;
                        m.type = m._type;
                        return _.omit(m, ['_type', '_playerid', '_id']);
                    })
                    .value()));
            sendChat('', `/w gm <div style="border: 1px solid #eee;background-color:white; border-radius:.25em; padding: .1em .25em;">Packing ${mcount} macros to handout: <b>Macros: ${player.get('displayname')}</b></div>`);
            saveToHandout(`Macros: ${player.get('displayname')}`, macros);
        },
        unpackForPlayer = function (player) {
            getFromHandout(`Macros: ${player.get('displayname')}`, (m) => {
                if (m.length) {
                    m = JSON.parse(Base64.decode(m));
                }
                let macros = _.isArray(m) ? m : [];

                sendChat('', `/w gm <div style="border: 1px solid #eee;background-color:white; border-radius:.25em; padding: .1em .25em;">Unpacking ${macros.length} macros from handout: <b>Macros: ${player.get('displayname')}</b></div>`);

                _.each(macros, (mdata) => {
                    mdata.playerid = player.id;
                    createObj('macro', mdata);
                });
            });
        };

    on('chat:message', function (msg) {
        if ('api' === msg.type && msg.content.match(/^!(?:pack|unpack)-macros/) && playerIsGM(msg.playerid)) {
            let op = msg.content.match(/^!pack/) ? packForPlayer : unpackForPlayer,
                args = _.map(_.rest(msg.content.split(/\s+--/)), (o) => o && o.toLowerCase()),
                keys = _.map(args, keyFormat);


            _.chain(findObjs({ type: 'player' }))
                .reject(_.isUndefined)
                .filter((o) => {
                    return matchKey(keys, keyFormat(o.get('displayname')));
                })
                .uniq()
                .each(op);
        }
    });
});