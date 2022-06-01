on("ready", function () {
    on("chat:message", function (msg) {
        if (msg.type == "api" && msg.content.indexOf("!exportMacros") == 0) {
            var existingMacros = findObjs({ type: "character", name: "MacroMover" });
            if (existingMacros !== undefined) {
                _.each(existingMacros, function (macroMover) {
                    macroMover.remove();
                })
            }

            var macroMover = createObj("character", {
                name: "MacroMover",
                controlledby: msg.playerid
            });

            var macroList = findObjs({ type: "macro" });
            _.each(macroList, function (macro) {
                createObj("ability", {
                    characterid: macroMover.get("id"),
                    name: macro.get("name"),
                    action: macro.get("action"),
                    istokenaction: macro.get("istokenaction"),
                    description: macro.get("visibleto")
                });
            });
        }
    });

    on("chat:message", function (msg) {
        if (msg.type == "api" && msg.content.indexOf("!importMacros") == 0) {
            var macroMover = findObjs({ type: "character", name: "MacroMover" })[0];
            if (macroMover === undefined) {
                sendChat("API", "Please import MacroMover");
                return;
            }

            var abilityList = findObjs({ type: "ability", characterid: macroMover.get("id") });
            _.each(abilityList, function (ability) {
                createObj("macro", {
                    name: ability.get("name"),
                    action: ability.get("action"),
                    istokenaction: ability.get("istokenaction"),
                    visibleto: ability.get("description"),
                    playerid: msg.playerid
                })
            });
            macroMover.remove();
        }
    });
});