# 🔐 Web Passwort Manager

**Sprache wählen / Choose your language:** [🇩🇪 Deutsch](#deutsch) · [🇬🇧 English](#english)

---

<a id="deutsch"></a>
# 🇩🇪 Deutsch

## Überblick

Der **Web Passwort Manager** ist eine browserbasierte Anwendung zum Verwalten verschlüsselter Passwort-Tresore (`.enc`). Ein Tresor kann mehrere Einträge enthalten; die Anwendung bietet Suche, Sortierung, Passwortgenerator, Import und einen Vergleich zweier Tresore. Die Oberfläche orientiert sich am kompakten, dunklen Design der früheren Version 2.0.

> **Wichtig:** Diese Anwendung ist ein Entwicklungsstand und wurde nicht unabhängig sicherheitsgeprüft. Bewahre zusätzliche, extern gesicherte Kopien deiner `.enc`-Dateien auf. Verlasse dich nicht ausschließlich auf die Notfall-Wiederherstellung im Browser.

**Tresor schließen:** Bei grünem Status „Gespeichert“ erscheint der neutrale Button „Tresor schließen“. Bei ungespeicherten oder noch nicht bestätigten Änderungen bleibt der rote Button „Ohne Speichern schließen“ mit Sicherheitsabfrage erhalten.

## Starten

1. Die Dateien `index.html`, `app.js` und `crypto_neu.js` **gemeinsam** auf einem HTTPS-Webserver bereitstellen, beispielsweise über GitHub Pages. Für lokale Tests einen lokalen HTTP-Server verwenden.
2. Die Seite öffnen und entweder eine bestehende `.enc`-Datei auswählen oder einen neuen Tresor erstellen.
3. Das Master-Passwort eingeben. Passwortfelder sind standardmäßig verdeckt; über das Augen-Symbol kann die Eingabe angezeigt werden.
4. Bei einem neuen Tresor die angebotene `.enc`-Datei herunterladen und an einem sicheren Ort aufbewahren. Einen Export anschließend über **„.enc prüfen“** bestätigen.

Die App besteht aus statischen Dateien; es ist kein eigener Anwendungsserver vorgesehen. Browserfunktionen für direkten Dateizugriff können je nach Browser und Bereitstellung fehlen.

## Tresor und Einträge

- **Startseite:** „.enc-Datei öffnen“ und „Neuen Tresor anlegen“ zeigen ihre Passwortformulare direkt auf der Startseite an. Jeweils nur ein Startseitenformular ist geöffnet.
- **Einträge:** Websites/URLs, Benutzernamen und Passwörter hinzufügen, bearbeiten, löschen, suchen und kopieren. Passwörter lassen sich bei Bedarf über das Auge einblenden.
- **Passwortgenerator:** 8–64 Zeichen (Vorgabe: 20); Klein- und Großbuchstaben, Zahlen und Sonderzeichen können ausgewählt werden.
- **Sortierung:** Website A–Z/Z–A, „Zuletzt hinzugefügt“ und „Zuletzt geändert“. Bei älteren Einträgen ohne gespeicherte Zeitstempel lässt sich das ursprüngliche Datum nicht nachträglich bestimmen.
- **Scrollbare Liste:** Die Passwortkarten haben einen eigenen Scrollbereich; Suche, Sortierung, Aktionen und Speicherstatus bleiben außerhalb der Liste. Die maximale Listenhöhe beträgt 420 px, auf schmalen Bildschirmen 440 px. Abweichende Kartenhöhen können früheres Scrollen erfordern.

## Speichern, Exportieren und Prüfen

**Die `.enc`-Datei ist der maßgebliche gespeicherte Tresor.** Änderungen im geöffneten Tresor sind nicht automatisch dauerhaft in dieser Datei gespeichert.

| Anzeige / Aktion | Bedeutung |
| --- | --- |
| **Nicht gespeichert** (orange) | Änderungen sind noch nicht bestätigt in einer `.enc`-Datei gesichert. |
| **Datei speichern** | Bei unterstütztem, beschreibbarem Dateizugriff wird die geöffnete Datei geschrieben und danach erneut gelesen und geprüft. |
| **.enc exportieren** | Bietet eine verschlüsselte Datei zum Download an; der Download allein bestätigt kein erfolgreiches Ablegen. |
| **Nicht bestätigt** (orange) | Ein exportierter Stand wartet noch auf Prüfung. |
| **.enc prüfen** | Die tatsächlich gespeicherte/heruntergeladene Datei auswählen und mit dem passenden Master-Passwort prüfen. Tresor-ID und Einträge müssen zum aktuellen Stand passen. |
| **Gespeichert** (grün) | Der aktuelle Stand wurde durch direktes Schreiben mit Prüfung oder durch erfolgreiche Prüfung der ausgewählten Exportdatei bestätigt. |

Die Prüfung eines Exports bestätigt **nur die ausgewählte Datei**. Sie ersetzt keine ältere Datei an einem anderen Speicherort. Bewahre die bestätigte Datei auf und öffne beim nächsten Mal diese Fassung.

## Notfall-Wiederherstellung

Bei ungespeicherten Änderungen versucht die Anwendung, einen **verschlüsselten Notfall-Zwischenstand** im Browser (IndexedDB) anzulegen. Mehrere Tresore können getrennte Zwischenstände besitzen. Auf der Startseite erscheint die Notfall-Wiederherstellung nur, wenn entsprechende Zwischenstände vorhanden sind. Jeder Zwischenstand hat eine eigene, direkt darunter aufklappbare Master-Passwortabfrage; beim Wechsel wird die vorherige Eingabe geleert. **„Abbrechen“ löscht keinen Zwischenstand.**

Ein Zwischenstand wird nur nach erfolgreicher Entschlüsselung und den vorgesehenen Tresor-/Dateistandsprüfungen übernommen. Browserdaten können unabhängig von der App gelöscht werden. Ein Zwischenstand ersetzt deshalb **keine externe Sicherung** und ist nicht gleichbedeutend mit einer bestätigten Speicherung in der `.enc`-Datei.

## Import und Tresorvergleich

Über **„Einträge aus Tresor importieren“** oder **„Tresore synchronisieren (Diff)“** eine zweite `.enc`-Datei auswählen und mit deren Master-Passwort entschlüsseln. Die angezeigten neuen bzw. abweichenden Einträge einzeln oder über **„Alle übernehmen“** auswählen. Die zweite Datei wird dabei nur gelesen; es findet **keine automatische bidirektionale Synchronisation** und keine automatische Übernahme von Löschungen statt. Übernommene Änderungen im geöffneten Tresor müssen anschließend gespeichert oder exportiert **und geprüft** werden. Die entsprechende Benachrichtigung ist orange, weil die Übernahme gelungen, aber noch nicht gespeichert ist.

## Sperre, Einstellungen und Master-Passwort

- **Automatische Sperre:** Nach 1, 5, 10, 15 oder 30 Minuten Inaktivität; standardmäßig 5 Minuten. „Niemals sperren“ ist ebenfalls wählbar. Nach dem Sperren kann der Tresor auf derselben Seite mit dem Master-Passwort entsperrt werden. Ein Neuladen oder Schließen beendet diese Sitzung.
- **Einstellungen:** Website-Kürzel ein-/ausblenden, Sperrzeit einstellen und Master-Passwort ändern.
- **Master-Passwort ändern:** Bisheriges Passwort eingeben, neues Passwort zweimal eingeben. Ein leeres neues Passwort ist nicht erlaubt; bei kurzen Passwörtern erscheint ein Sicherheitshinweis. Bei direktem Schreibzugriff wird die Datei geschrieben und geprüft; andernfalls muss die neu exportierte `.enc`-Datei mit dem **neuen** Master-Passwort über „.enc prüfen“ bestätigt werden. Die ursprüngliche Datei bleibt bis dahin erhalten. Vorher eine externe Sicherungskopie erstellen.
- **Passwortdialoge:** Master-Passwörter beim Import, Vergleich und bei der `.enc`-Prüfung werden in eigenen Dialogen standardmäßig verdeckt eingegeben. Das Auge schaltet die Sichtbarkeit um; beim Schließen wird die Eingabe geleert.

## Hinweise und Grenzen

- Die ältere **Version 2.0 bleibt ein separates Projekt**. Bestehende 2.0-Dateien können geöffnet werden; ein neu exportiertes Tresorformat mit Tresor-ID ist jedoch nicht automatisch mit der alten 2.0-Anwendung kompatibel. Vor dem Umstieg Sicherung und Rückweg prüfen.
- Direkter Dateizugriff ist browserabhängig. Ein Export und seine anschließende Prüfung bestätigen die ausgewählte Datei, nicht die Synchronisation durch einen externen Cloud-Anbieter.
- Die Anwendung bietet keine garantierte Wiederherstellung bei gelöschten Browserdaten, beschädigten Dateien oder verlorenem Master-Passwort.
- Es liegen keine vollständigen automatisierten Browser- oder unabhängigen Sicherheitstests vor. Mehrere gleichzeitig geöffnete Tabs desselben Tresors können Konflikte verursachen.

## Projektdateien

| Datei | Zweck |
| --- | --- |
| `index.html` | Oberfläche und Gestaltung |
| `app.js` | Tresor-, Datei- und Bedienlogik |
| `crypto_neu.js` | Verschlüsselungs-/Entschlüsselungsfunktionen |
| `README.md` | Diese Anleitung |

[↑ Zur Sprachauswahl](#-web-passwort-manager)

---

<a id="english"></a>
# 🇬🇧 English

**Closing a vault:** When the status is green (“Gespeichert” / saved), a neutral “Tresor schließen” (close vault) button appears. For unsaved or unverified changes, the red “Ohne Speichern schließen” (close without saving) button and its confirmation remain.

## Overview

**Web Passwort Manager** is a browser-based application for managing encrypted password vaults (`.enc`). A vault can contain multiple entries; the application provides search, sorting, a password generator, importing, and comparison between two vaults. Its compact dark interface follows the earlier version 2.0 design.

> **Important:** This is a development build and has not undergone an independent security audit. Keep additional external backups of your `.enc` files. Do not rely on browser emergency recovery as your only backup.

## Getting started

1. Serve `index.html`, `app.js`, and `crypto_neu.js` **together** over HTTPS, for example using GitHub Pages. Use a local HTTP server for local testing.
2. Open the page and select an existing `.enc` file or create a new vault.
3. Enter the master password. Password fields are masked by default; use the eye icon to reveal the input when needed.
4. For a new vault, download the offered `.enc` file and keep it somewhere safe. Confirm an export using **“.enc prüfen” (Verify .enc)**.

The app uses static files and does not require a dedicated application server. Direct file access may be unavailable in some browsers or deployment environments.

## Vaults and entries

- **Home screen:** Opening an `.enc` file and creating a vault display their password forms inline on the home screen. Only one home-screen form is open at a time.
- **Entries:** Add, edit, delete, search, and copy websites/URLs, usernames, and passwords. The eye icon can reveal a password when needed.
- **Password generator:** 8–64 characters (default: 20); choose lowercase and uppercase letters, digits, and special characters.
- **Sorting:** Website A–Z/Z–A, Recently added, and Recently changed. Original timestamps cannot be reconstructed for older entries that lack them.
- **Scrollable list:** Password cards scroll independently; search, sorting, actions, and save status stay outside the list. Maximum list height is 420 px, or 440 px on narrow screens. Taller cards may require scrolling sooner.

## Saving, exporting, and verifying

**The `.enc` file is the authoritative saved vault.** Changes in an open vault are not automatically saved permanently to that file.

| Status / action | Meaning |
| --- | --- |
| **Nicht gespeichert** (Not saved; orange) | Changes have not yet been confirmed in an `.enc` file. |
| **Datei speichern** (Save file) | Where writable file access is supported, writes the open file and reads it back for verification. |
| **.enc exportieren** (Export .enc) | Offers an encrypted download; the download alone does not prove that the file was saved. |
| **Nicht bestätigt** (Not confirmed; orange) | An exported version is awaiting verification. |
| **.enc prüfen** (Verify .enc) | Select the actual downloaded/saved file and enter its master password. Vault ID and entries must match the current vault. |
| **Gespeichert** (Saved; green) | The current state has been confirmed by a verified direct write or successful verification of the selected export. |

Export verification confirms **only the selected file**. It does not replace an older copy elsewhere. Keep the verified file and open that copy next time.

## Emergency recovery

When there are unsaved changes, the application attempts to store an **encrypted emergency draft** in the browser (IndexedDB). Multiple vaults can have separate drafts. The home screen displays recovery only when drafts are present. Each draft has its own expandable master-password form directly below it; switching forms clears the previous input. **Cancel does not delete a draft.**

A draft is applied only after successful decryption and the relevant vault/file-state checks. Browser data can be deleted independently of the app. Emergency drafts are **not external backups** and do not mean that the `.enc` file has been saved.

## Importing and comparing vaults

Use **“Einträge aus Tresor importieren” (Import entries from vault)** or **“Tresore synchronisieren (Diff)” (Compare vaults)** to select a second `.enc` file and decrypt it using its master password. Select individual new or differing entries, or choose **“Alle übernehmen” (Select all)**. The second file is read-only: there is **no automatic two-way synchronization** and deletions are not propagated automatically. Applied changes to the open vault must subsequently be saved or exported **and verified**. The import notification is orange because applying entries succeeded but saving is still pending.

## Locking, settings, and master password

- **Automatic lock:** After 1, 5, 10, 15, or 30 minutes of inactivity; default is 5 minutes. “Never lock” is also available. Unlock on the same page with the master password. Reloading or closing the page ends that session.
- **Settings:** Toggle website initials, choose the lock interval, and change the master password.
- **Change master password:** Enter the current password and the new password twice. An empty new password is not allowed; short passwords trigger a security warning. With direct writable file access, the file is written and verified; otherwise the newly exported `.enc` file must be confirmed with the **new** master password via “.enc prüfen”. The original file remains in place until then. Make an external backup first.
- **Password dialogs:** Master-password prompts for import, comparison, and `.enc` verification use in-app dialogs with masked input by default. The eye icon toggles visibility, and closing the dialog clears its input.

## Notes and limitations

- The older **version 2.0 remains a separate project**. Existing 2.0 files can be opened, but a newly exported vault format with a vault ID is not automatically compatible with the old 2.0 app. Back up files and verify your rollback path before migrating.
- Direct file access depends on the browser. Export verification confirms the selected file, not synchronization performed by an external cloud provider.
- Recovery is not guaranteed if browser data is cleared, files are damaged, or the master password is lost.
- Full automated browser testing and independent security auditing have not been completed. Opening the same vault in multiple tabs may lead to conflicts.

## Project files

| File | Purpose |
| --- | --- |
| `index.html` | Interface and styling |
| `app.js` | Vault, file, and interaction logic |
| `crypto_neu.js` | Encryption/decryption functions |
| `README.md` | This guide |

[↑ Back to language selection](#-web-passwort-manager)

### Smartphone: Kopiersymbole / Mobile: copy icons

DE: Auf schmalen Bildschirmen (bis 680 px) stehen die Kopiersymbole für Benutzername und Passwort rechts unter dem Drei-Punkte-Menü, jeweils auf Höhe ihres Feldes. Das Augen-Symbol bleibt in der Passwortzeile. Die Desktop-Ansicht und die Kopierfunktionen bleiben unverändert.

EN: On narrow screens (up to 680 px), the username and password copy icons align at the right below the three-dot menu, each alongside its respective field. The eye icon stays in the password row. Desktop layout and copy behavior remain unchanged.

### Smartphone: Passwort-Auge / Mobile: password visibility icon

- DE: Auf schmalen Bildschirmen steht das Auge direkt rechts neben dem Passwort. Das Kopiersymbol bleibt rechts am Kartenrand unter dem Drei-Punkte-Menü. Die Desktop-Anordnung und die Funktionen bleiben unverändert.
- EN: On narrow screens, the visibility icon sits immediately to the right of the password. The copy icon stays at the right edge beneath the three-dot menu. Desktop layout and functionality are unchanged.

### Aktionsbuttons bei schmalem Fenster / Action buttons in narrow windows

DE: Aktionsbuttons in derselben Zeile (insbesondere „Neues Passwort“ und „Einträge aus Tresor importieren“) sind gleich hoch, auch wenn eine Beschriftung umbricht. Die bisherige Anordnung und die Funktionen bleiben unverändert.

EN: Action buttons sharing a row (particularly “New password” and “Import entries from vault”) have equal heights even when a label wraps. Existing layout and functionality remain unchanged.
