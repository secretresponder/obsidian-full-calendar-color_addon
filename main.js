'use strict';

var obsidian = require('obsidian');

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

class FullCalendarColorAddon extends obsidian.Plugin {
    onload() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Full Calendar Color Addon loaded");
            let config = {};
            let refreshInterval = 30000; // fallback по умолчанию
            try {
                const raw = yield this.app.vault.adapter.read(`${this.app.vault.configDir}/plugins/${this.manifest.id}/config.json`);
                config = JSON.parse(raw);
                // Забираем refreshInterval, если указан
                if ("refreshInterval" in config) {
                    const rawInterval = Number(config["refreshInterval"]);
                    if (!isNaN(rawInterval) && rawInterval >= 1000) {
                        refreshInterval = rawInterval;
                    }
                    delete config["refreshInterval"]; // Удалим, чтобы не обрабатывался как keyword
                }
            }
            catch (err) {
                console.error("Failed to load config:", err);
                return;
            }
            function classifyEvents() {
                document.querySelectorAll("a.fc-timegrid-event").forEach((el) => {
                    const titleEl = el.querySelector(".fc-event-title");
                    const title = ((titleEl === null || titleEl === void 0 ? void 0 : titleEl.textContent) || "").toLowerCase();
                    for (const keyword in config) {
                        if (title.includes(keyword.toLowerCase())) {
                            const color = config[keyword];
                            el.setAttribute("data-type", keyword);
                            el.style.setProperty("background-color", color, "important");
                            el.style.setProperty("border-color", "white", "important");
                            break;
                        }
                    }
                });
            }
            // Слежение за DOM-обновлениями
            const observer = new MutationObserver(classifyEvents);
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            // Повторная перекраска (на случай отложенной отрисовки)
            let attempts = 0;
            const interval = setInterval(() => {
                classifyEvents();
                if (++attempts > 20)
                    clearInterval(interval);
            }, 500);
            // Обновление событий Full Calendar с интервалом из конфига
            this.registerInterval(setInterval(() => {
                var _a;
                // @ts-ignore
                const plugin = app.plugins.plugins["obsidian-full-calendar"];
                (_a = plugin === null || plugin === void 0 ? void 0 : plugin.cache) === null || _a === void 0 ? void 0 : _a.revalidateRemoteCalendars(true);
            }, refreshInterval));
            console.log(`Revalidation every ${refreshInterval}ms`);
        });
    }
}

module.exports = FullCalendarColorAddon;
