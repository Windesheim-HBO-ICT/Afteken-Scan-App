# WH Aftekenen Concept App
Dit is een concept van een PWA Expo-app met gedeeltelijke ondersteuning voor Android en iOS, gericht op Aftekenen binnen HBO-ICT.

Een voorbeeld QR-code is te vinden [hier](./docs/voorbeeld.md).

## SSL
Om de PWA-versie (web) te testen en de camera te laten werken, zijn SSL-certificaten vereist. Zorg ervoor dat [OpenSSL](https://www.openssl.org/) is geïnstalleerd en voer vervolgens het volgende commando uit:

```bash
openssl req -nodes -new -x509 -keyout server.key -out server.cert -subj "/CN=localhost"
```

Dit genereert een `server.key` en `server.cert` bestand in de huidige map. Plaats deze bestanden in de root van het project. Deze bestanden zijn nodig om HTTPS te activeren.

## Quickstart
Voer het bovenstaande SSL-commando uit en voer daarna het volgende uit om de PWA-versie te starten:

```bash
cd aftekenen

npm install --legacy-peer-deps

npm run export-serve
```

De terminal geeft een localhost IP en een lokaal netwerk IP weer. Open het lokaal netwerk IP op je telefoon en negeer de SSL-waarschuwing om de PWA uit te voeren.

De PWA-versie update automatisch wanneer de code wordt gewijzigd.

## Development

Om de ontwikkelserver te starten, voer je het volgende uit:

```bash
cd aftekenen

npm install

npm start
```

De ontwikkelserver heeft geen werkende camera, dus gebruik de PWA-versie voor camerafunctionaliteit. Dit komt door een limitatie van browsers waarbij de camera alleen werkt met HTTPS.

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
| `export-serve`  | Voert `export:web` uit en daarna `serve:https`            |
