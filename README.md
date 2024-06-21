# WH Aftekenen Concept App
Dit is een concept Expo React Native app voor Aftekenen binnen HBO-ICT.

Een voorbeeld QR-code is te vinden [hier](./docs/voorbeeld.md).

Dit project maakt gebruik van Yarn workspaces. Zorg ervoor dat je eerst alle dependencies installeert door `yarn` uit te voeren in de hoofdmap van het project.

## SSL
Voor het uitproberen van de PWA-versie (web), zijn SSL certificaten verplicht om de camera te laten werken. Installeer openssl en voer dan de volgende command uit:

```bash
openssl req -nodes -new -x509 -keyout server.key -out server.cert -subj "/CN=localhost"
```

## Beschikbare scripts
Om een script uit te voeren, gebruik `yarn workspace aftekenen <script>`.

| Script          | Beschrijving                            |
|-----------------|-----------------------------------------|
| `start`         | Start de ontwikkelserver voor Expo.     |
| `reset-project` | Voert een reset uit van het project.    |
| `android`       | Start de ontwikkelserver voor Android.  |
| `ios`           | Start de ontwikkelserver voor iOS.      |
| `web`           | Start de ontwikkelserver voor web.      |
| `test`          | Voert Jest uit in watch mode voor tests.|
| `lint`          | Voert linting uit met Expo CLI.         |
