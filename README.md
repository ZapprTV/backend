Il backend/API di Zappr, per far riprodurre al frontend i canali Rai.

Forse in futuro servirà anche per altri canali, ma per adesso supporta gli URL mediapolis.rai.it, in questo formato specifico:
`https://mediapolis.rai.it/relinker/relinkerServlet.htm?cont=XXXXXXX`

Se l'URL ha il parametro `&output` alla fine, l'API non lo accetterà e restituirà un errore.
