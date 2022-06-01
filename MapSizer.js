//usage - !mapSizer imageWidthInPixels imageHeightInPixels
on("ready", function () {
    on("chat:message", function (msg) {
        if (msg.type == "api" && msg.content.indexOf("!mapSizer") == 0) {
            var args = msg.content.split(" ");
            var mapWidth = Number(args[1]);
            var mapHeight = Number(args[2]);
            var selected = msg.selected;
            if (selected === undefined) {
                sendChat("API", "Please select a graphic");
                return;
            }
            if (isNaN(mapWidth) || isNaN(mapHeight)) {
                sendChat("API", "Please enter a valid number for width & height");
                return;
            }
            var map = getObj("graphic", selected[0]._id);
            var page = getObj("page", map.get("pageid"));

            page.set({
                width: mapWidth / 70,
                height: mapHeight / 70
            });

            map.set({
                width: mapWidth,
                height: mapHeight,
                top: mapHeight / 2,
                left: mapWidth / 2,
                layer: "map"
            });
        }
    });
});