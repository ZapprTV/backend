Deno.serve(async (request) => {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type"
    };
    const paramsToObject = (entries) => {
        const result = {};
        for (const [key, value] of entries) {
            result[key] = value;
        };
        return result;
    };
    
    // https://uibakery.io/regex-library/url
    const urlRegex = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;
    const supportedURLRegexes = {
        rai: /^https?:\/\/mediapolis.rai.it\/relinker\/relinkerServlet.htm\?cont=[0-9]{1,}$/g,
        dailymotion: /^https?:\/\/(?:www\.)?dailymotion\.com\/video\/[a-zA-Z0-9]+$/g
    };
    const requestURL = new URL(request.url);
    const specifiedURL = requestURL.search.slice(1);

    window.testResults = { matched: false, matchedRegex: "" };
    const testURL = (url) => {
        if (urlRegex.test(url)) {
            for (const regex in supportedURLRegexes) {
                if (supportedURLRegexes[regex].test(url)) {
                    window.testResults = { matched: true, matchedRegex: regex };
                    break;
                };
            };
        };
    };

    const returnErrorHeaders = (errorStatus) => {
        return {
            headers: {
                ...headers,
                "Content-Type": "application/json"
            },
            status: errorStatus
        };
    };

    if (request.method === "GET" && requestURL.pathname === "/") {
        if (requestURL.search.length > 0) {
            testURL(specifiedURL);
            if (testResults.matched) {
                switch(testResults.matchedRegex) {
                    case "rai":
                        await fetch(`${specifiedURL}&output=62`)
                            .then(response => response.json())
                            .then(json => {
                                window.requestSucceeded = true;
                                window.redirectURL = json.video[0];
                            })
                            .catch(err => {
                                window.requestSucceeded = false;
                                window.errorJSON = JSON.stringify({
                                    error: "Impossibile recuperare l'URL della stream.",
                                    info: specifiedURL
                                });
                                window.errorStatus = 500;
                            });
                        break;

                    case "dailymotion":
                        await fetch(specifiedURL.replaceAll("/video/", "/player/metadata/video/"))
                            .then(response => response.json())
                            .then(json => {
                                window.requestSucceeded = true;
                                window.redirectURL = json.qualities.auto[0].url;
                            })
                            .catch(err => {
                                window.requestSucceeded = false;
                                window.errorJSON = JSON.stringify({
                                    error: "Impossibile recuperare l'URL della stream.",
                                    info: specifiedURL
                                });
                                window.errorStatus = 500;
                            });
                        break;
                };

                if (requestSucceeded) {
                    return new Response(null, {
                        status: 302,
                        headers: {
                            ...headers,
                            "location": redirectURL
                        }
                    });
                } else {
                    return new Response(errorJSON, returnErrorHeaders(errorStatus));
                };
            } else {
                return new Response(JSON.stringify({
                  error: "L'URL specificato non è valido, non è nel formato corretto oppure non è supportato dall'API di Zappr. Per vedere la lista di URL compatibili visita https://github.com/ZapprTV/backend#readme.",
                  info: specifiedURL
                }), returnErrorHeaders(400));
            }
        } else {
            return Response.redirect("https://github.com/ZapprTV/backend", 301);
        };
    } else if (request.method === "OPTIONS") {
        return new Response(null, {
            headers: headers
        });
    } else {
        return new Response(JSON.stringify({
            error: "Metodo o endpoint invalido.",
            info: request.url
        }), returnErrorHeaders(405));
    }
});
