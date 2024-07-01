# WH Aftekenen Concept App
Dit is een concept van een PWA Expo-app met gedeeltelijke ondersteuning voor Android en iOS, gericht op Aftekenen binnen HBO-ICT.

Een voorbeeld QR-code is te vinden [hier](./docs/voorbeeld.md).

Dit project maakt gebruik van Yarn workspaces. Zorg ervoor dat je eerst alle dependencies installeert door `yarn` uit te voeren in de hoofdmap van het project.

## SSL
Om de PWA-versie (web) te testen en de camera te laten werken, zijn SSL-certificaten vereist. Installeer openssl en voer vervolgens het volgende commando uit:

```bash
openssl req -nodes -new -x509 -keyout server.key -out server.cert -subj "/CN=localhost"
```

## Quickstart
Voer het bovenstaande SSL-commando uit en voer daarna het volgende uit:

```bash
yarn workspace aftekenen export-serve
```

De terminal geeft een localhost IP en een lokaal netwerk IP weer. Open het lokaal netwerk IP op je telefoon en negeer de SSL-waarschuwing om de PWA uit te voeren.

## Beschikbare scripts
Om een script uit te voeren, gebruik `yarn workspace aftekenen <script>`.

| Script          | Beschrijving                                              |
|-----------------|-----------------------------------------------------------|
| `start`         | Start de ontwikkelserver voor Expo.                       |
| `android`       | Start de ontwikkelserver voor Android.                    |
| `ios`           | Start de ontwikkelserver voor iOS.                        |
| `web`           | Start de ontwikkelserver voor web.                        |
| `test`          | Voert Jest uit in watch mode voor tests.                  |
| `lint`          | Voert linting uit met Expo CLI.                           |
| `export:web`    | Exporteert het project voor web met Expo.                 |
| `serve`         | Serveert de `dist` map met HTTP.                          |
| `serve:https`   | Serveert de `dist` map met HTTPS.                         |
| `export-serve`  | Voert 'yarn export:web' uit en serveert daarna met HTTPS. |
