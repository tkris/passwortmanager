<a id="deutsch"></a>

# 🔐 Passwort Manager 3.0

**Browser-Testversion · Deutsch / English**  
[🇩🇪 Deutsch](#deutsch) · [🇬🇧 English](#english)

> [!IMPORTANT]
> **Version 3.0 ist ein Prototyp und noch nicht für die alleinige Aufbewahrung wichtiger Passwörter vorgesehen.** Verwende zum Testen Kopien deiner `.enc`-Dateien und bewahre die Originale sicher auf. Version 2.0 bleibt separat nutzbar.

Ein clientseitiger Passwortmanager mit kompakter, dunkler Oberfläche. Die **`.enc`-Datei ist der verbindliche Tresor**; verschlüsselte Zwischenstände im Browser dienen ausschließlich der **Notfall-Wiederherstellung** ungespeicherter Änderungen. Für die Tresorverwaltung ist kein Benutzerkonto oder eigener Server erforderlich.

## 🚀 Schnellstart

1. Öffne die **3.0-Testversion** über die GitHub-Pages-Adresse deines Projekts mit dem Pfad `/v3/` (sofern du die Dateien dort veröffentlicht hast). Für lokale Tests verwende einen lokalen HTTP-Server.
2. Wähle **„📂 .enc-Datei öffnen“** und entsperre die Datei mit dem Master-Passwort oder erstelle über **„＋ Neuen Tresor anlegen“** einen neuen Tresor. Für einen neuen Tresor ist ein Master-Passwort mit mindestens zwölf Zeichen erforderlich.
3. Füge Einträge hinzu oder bearbeite vorhandene. Nutze Suche, Sortierung und die kompakten Aktionen direkt am Eintrag.
4. **Speichere die `.enc`-Datei ausdrücklich.** Bei unterstütztem direktem Dateizugriff kannst du **„💾 Tresor speichern“** verwenden; andernfalls wähle **„⬇ Als .enc-Datei exportieren“** und lege die heruntergeladene Datei selbst sicher ab.

## 💾 Speichern oder exportieren?

| Aktion | Bedeutung |
| --- | --- |
| **Tresor speichern** | Nur verfügbar, wenn der Browser einen beschreibbaren Dateizugriff bereitstellt. Die App vergleicht den ursprünglichen Dateistand vor dem Schreiben und prüft den geschriebenen Inhalt anschließend erneut. Erst danach gilt dieser Schreibvorgang als bestätigt. |
| **Als .enc-Datei exportieren** | Stellt eine verschlüsselte Datei zum Download bereit. Die App kann **nicht bestätigen**, ob du sie tatsächlich am gewünschten Ort abgelegt hast oder ob sie die ursprüngliche Datei ersetzt. Der Notfall-Zwischenstand bleibt deshalb erhalten. |
| **Tresor sperren** | Beendet die geöffnete Sitzung. Bei ungespeicherten Änderungen erscheint zuvor eine Warnung; ein Notfall-Zwischenstand ist kein Ersatz für eine gespeicherte Datei. |
| **Ohne Speichern schließen** | Fragt nach Bestätigung und entfernt den zugehörigen Notfall-Zwischenstand. Nicht gespeicherte Änderungen gehen verloren; vorhandene `.enc`-Dateien werden dadurch nicht verändert. |

**Wichtig:** Ein neuer Tresor besitzt zunächst noch keine dauerhaft abgelegte `.enc`-Datei. Exportiere ihn und überprüfe die Datei, bevor du dich darauf verlässt. Ein fehlgeschlagener Schreibvorgang oder eine Änderung der Datei außerhalb der App darf nicht stillschweigend als erfolgreiches Speichern behandelt werden.

## 🛟 Verschlüsselte Notfall-Wiederherstellung

- Version 3.0 verwaltet **getrennte verschlüsselte Zwischenstände pro Tresor-ID** in der IndexedDB des jeweiligen Browserprofils; es gibt nicht mehr nur einen gemeinsamen Zwischenstandplatz.
- Bei einer Unterbrechung kannst du auf der Startseite einen passenden Zwischenstand auswählen und mit dem zugehörigen Master-Passwort wiederherstellen. Wiederhergestellte Änderungen sind weiterhin **nicht in der `.enc`-Datei gespeichert**.
- Beim Öffnen einer 3.0-Datei kann die App einen passenden Zwischenstand anbieten. Stimmt der zugrunde liegende Dateistand nicht überein, wird er **nicht automatisch übernommen**.
- Nach bestätigtem direktem Speichern wird nur der Zwischenstand des betreffenden Tresors entfernt. Andere Tresore bleiben unberührt.
- Zwischenstände lassen sich auf der Startseite nach einer Verlustwarnung entfernen. **Browserdaten können auch außerhalb der Anwendung gelöscht werden**; eine Wiederherstellung ist daher nicht garantiert.

## ✨ Oberfläche und Einträge

- Kompaktes dunkles Design in Anlehnung an Version 2.0, mit optionalen **lokal erzeugten Website-Kürzeln** links am Eintrag (keine aus dem Internet geladenen Favicons).
- Getrennte Kopiersymbole für **Benutzername** und **Passwort**; das Passwort bleibt standardmäßig verborgen und wird über das **Augensymbol** ein- oder ausgeblendet.
- **Bearbeiten** und **Löschen** befinden sich im Drei-Punkte-Menü des jeweiligen Eintrags. Vor dem Löschen erfolgt eine Bestätigung.
- Suche, Sortierung und ein Eingabeformular, das erst bei Bedarf erscheint.
- Ein kompaktes Feld zeigt den Speicher- und Wiederherstellungsstatus an.

## 🌐 GitHub Pages: 2.0 und 3.0 parallel

Lege den **Inhalt** des 3.0-Pakets in einen eigenen Ordner `v3/`, sodass `v3/index.html`, `v3/app.js` und `v3/crypto_neu.js` direkt nebeneinanderliegen. Die Dateien von Version 2.0 im Hauptverzeichnis bleiben unverändert. Die Testversion ist dann unter deiner bestehenden Pages-Adresse **mit angehängtem `/v3/`** erreichbar. Relative Dateipfade müssen erhalten bleiben.

## ⚠️ Bekannte Grenzen der Testversion

- **Dateiformat:** Bisherige 2.0-Dateien können geöffnet werden. Neu exportierte 3.0-Dateien enthalten eine dauerhafte Tresor-ID und können **nicht mit Version 2.0 geöffnet werden**. Teste nur mit Kopien.
- **Browserabhängiges Speichern:** Direkter Dateizugriff steht nicht in jedem Browser zur Verfügung, insbesondere nicht verlässlich auf Smartphones. Ein Download ist keine bestätigte Aktualisierung der ursprünglichen Datei.
- **Kein garantierter Schutz vor Datenverlust:** Der Notfall-Zwischenstand kann durch gelöschte Browserdaten oder fehlgeschlagene Schreibvorgänge verloren gehen. Eine atomare Dateisicherung ist noch nicht implementiert.
- **Gleichzeitige Bearbeitung:** Für mehrere Tabs desselben Tresors gibt es noch keine transaktionssichere Konfliktbehandlung der Notfall-Zwischenstände. Dateianbieter und Cloud-Dienste können zusätzliche Synchronisationskonflikte verursachen.
- **Noch nicht aus 2.0 übernommen:** Tresor-Import und -Synchronisierung, Passwortgenerator, automatische Sperre und Master-Passwort-Wechsel. Android- und iOS-Apps sind noch nicht vorhanden.
- **Prüfstand:** Es liegen noch keine vollständigen automatisierten Browser- oder unabhängigen Sicherheitstests vor.

---

<a id="english"></a>

# 🔐 Password Manager 3.0

**Browser prototype · English / Deutsch**  
[🇬🇧 English](#english) · [🇩🇪 Deutsch](#deutsch)

> [!IMPORTANT]
> **Version 3.0 is a prototype, not yet suitable as the only place to keep important passwords.** Test with copies of your `.enc` files and retain the originals. Version 2.0 remains available separately.

A client-side password manager with a compact dark interface. The **`.enc` file is the authoritative vault**; encrypted browser drafts exist solely for **emergency recovery** of unsaved changes. Vault management does not require an account or a dedicated server.

## 🚀 Getting started

1. Open your **3.0 test deployment** at your project's GitHub Pages URL followed by `/v3/`, if you published the files there. Use a local HTTP server for local testing.
2. Select **“📂 .enc-Datei öffnen” (Open .enc file)** and unlock it with the master password, or choose **“＋ Neuen Tresor anlegen” (Create new vault)**. A new vault requires a master password of at least twelve characters.
3. Add or edit entries using the compact entry controls, search and sorting.
4. **Explicitly save your `.enc` file.** Where writable file access is supported, use **“💾 Tresor speichern” (Save vault)**. Otherwise choose **“⬇ Als .enc-Datei exportieren” (Export as .enc)** and store the downloaded file safely yourself.

## 💾 Save versus export

| Action | What it means |
| --- | --- |
| **Save vault** | Available only when the browser provides a writable file handle. The app checks whether the original file has changed before writing, then reads the result back to verify it. Only then is that write considered confirmed. |
| **Export as .enc** | Offers an encrypted file for download. The app **cannot confirm** that you stored it in the intended location or replaced the original file. The emergency draft is therefore retained. |
| **Lock vault** | Ends the open session. Unsaved changes trigger a warning; an emergency draft is not a substitute for a saved file. |
| **Close without saving** | Requires confirmation and removes the draft belonging to that vault. Unsaved changes are lost; existing `.enc` files are unaffected. |

**Important:** A newly created vault has no persistently stored `.enc` file yet. Export it and verify the file before relying on it. A failed write or an external change to the file must not silently count as a successful save.

## 🛟 Encrypted emergency recovery

- Version 3.0 stores **separate encrypted drafts per vault ID** in the browser profile's IndexedDB; there is no longer a single shared draft slot.
- After an interruption, select a draft on the start screen and unlock it with the corresponding master password. Recovered changes are still **not saved to the `.enc` file**.
- When opening a 3.0 file, the app may offer a matching draft. If the underlying file version differs, the draft is **not applied automatically**.
- After a confirmed direct save, only that vault's draft is removed; other vaults remain untouched.
- Drafts can be deleted from the start screen after a data-loss warning. **Browser data can also be removed outside the app**, so recovery is not guaranteed.

## ✨ Interface and entries

- Compact 2.0-inspired dark design, with optional **locally generated website initials** beside each entry (not internet-fetched favicons).
- Separate copy icons for **username** and **password**. Passwords are hidden by default and revealed or hidden with the **eye icon**.
- **Edit** and **Delete** live in each entry's three-dot menu. Deletion requires confirmation.
- Search, sorting and an entry editor shown only when needed.
- A compact panel displays save and recovery status.

## 🌐 Run 2.0 and 3.0 side by side on GitHub Pages

Place the **contents** of the 3.0 package in a separate `v3/` directory, with `v3/index.html`, `v3/app.js` and `v3/crypto_neu.js` next to one another. Leave the 2.0 files in the repository root unchanged. Your test version will be accessible at your existing Pages URL **with `/v3/` appended**. Preserve the relative file paths.

## ⚠️ Known prototype limitations

- **File compatibility:** Existing 2.0 files can be opened. Newly exported 3.0 files include a persistent vault ID and **cannot be opened by version 2.0**. Test using copies only.
- **Browser-dependent saving:** Writable file access is not available everywhere, especially not reliably on phones. A download does not confirm that the original file was updated.
- **No guaranteed protection from data loss:** Browser data can be deleted and writes can fail. Atomic file backup is not yet implemented.
- **Concurrent editing:** Drafts are not yet transaction-safe when the same vault is edited in multiple tabs. File providers and cloud services may introduce additional synchronization conflicts.
- **Not yet ported from 2.0:** Vault import/synchronization, password generator, auto-lock and master-password changes. Native Android and iOS apps do not exist yet.
- **Testing status:** Comprehensive automated browser tests and an independent security review have not yet been completed.
