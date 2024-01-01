Il backend/API di Zappr, per far riprodurre al [frontend](https://github.com/ZapprTV/frontend) i canali Rai. Forse in futuro servirà anche per altri canali, ma per adesso funziona solo per gli URL dei canali Rai. 

Questa API usa Deno, sia per il codice che per il deploying, che avviene su [Deno Deploy](https://deno.com/deploy). È ospitata su [api.zappr.stream](https://api.zappr.stream).

L'unico endpoint è `/`, e prende come unico parametro, tramite query string, l'URL che si vuole "trasformare".

Come già detto, per adesso supporta solo gli URL dei canali Rai (mediapolis.rai.it), in questo formato specifico: `https://mediapolis.rai.it/relinker/relinkerServlet.htm?cont=XXXXXXX`. Se l'URL ha il parametro `&output` alla fine, non verrà accettato e verrà restituito un errore.

Ecco quindi un esempio di richiesta all'API, con l'URL di Rai News 24:<br>
`https://api.zappr.stream/?https://mediapolis.rai.it/relinker/relinkerServlet.htm?cont=1`

Se la richiesta è valida, avviene un redirect all'URL non CORS della stream del canale richiesto. Nel caso di Rai News 24 è `https://rainews1-live.akamaized.net/hls/live/598326/rainews1/rainews1/playlist.m3u8?hdnea=st=...`.

Se non è valida, invece, viene restituito un errore in formato JSON, con le key `error` e `info`. Ecco, per esempio, l'errore che viene restituito se viene fatta una richiesta a un endpoint invalido (`/endpointInvalido` in questo esempio):<br>
```json
{
  "error": "Metodo o endpoint invalido.",
  "info": "https://api.zappr.stream/endpointInvalido"
}
```

Queste due key vengono mostrate nel frontend in una finestra d'errore (`info` viene mostrata come "Informazioni tecniche"), così da poter segnalare il problema tramite issue su GitHub.<br>
![Finestra d'errore del frontend, contenente i valori delle key "error" e "info" ("informazioni tecniche")](https://github.com/ZapprTV/backend/assets/52544979/b0adc172-2313-4819-a7cb-2219d0884d77)
