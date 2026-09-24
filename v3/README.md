# Passwort Manager 3.0 – Browser-Prototyp / Browser prototype

## Deutsch

**Erste, separat zu testende Browser-Version. Nicht als produktionsreifer Passwortmanager verwenden.** Die bestehende Version 2.0 wird nicht verändert. `index.html` über HTTPS (z. B. in einem separaten GitHub-Pages-Testzweig) bereitstellen; für lokalen Test einen lokalen HTTP-Server verwenden. `.enc`-Dateien vor Tests extern sichern.

- Nutzt `crypto_neu.js` und kann das bisherige verschlüsselte 2.0-Dateiformat (Array von Einträgen) öffnen. Beim nächsten Export wird ein neues verschlüsseltes 3.0-Nutzdatenformat mit einer dauerhaften Tresor-ID geschrieben. **Vor einem dauerhaften Wechsel Kompatibilität und Rückweg prüfen:** Die 2.0-App kann das neue 3.0-Nutzdatenformat nicht öffnen.
- Unterstützt mehrere voneinander getrennte, verschlüsselte Notfall-Zwischenstände in IndexedDB, jeweils pro Tresor-ID. Die App bietet keine gemeinsame Entschlüsselung verschiedener Tresore. Browserprofil-Daten können außerhalb der App gelöscht werden; Notfall-Wiederherstellung ist nicht garantiert.
- Bei unterstütztem `showOpenFilePicker` und beschreibbarem Dateihandle kann die geöffnete Datei direkt geschrieben werden. Vor dem Schreiben wird ein SHA-256-Fingerabdruck des ursprünglichen Dateistands verglichen; nach dem Schreiben wird der Inhalt erneut gelesen und geprüft. Ein erfolgreiches Schreiben wird erst danach als „Gespeichert“ angezeigt. **Dateianbieter können trotzdem eigene Synchronisations- und Konfliktregeln haben; eine atomare Sicherungskopie ist noch nicht implementiert.**
- Bei fehlendem direkten Dateizugriff bietet die App nur `.enc`-Export an. Das Download-Angebot ist kein Nachweis, dass die Datei abgelegt wurde; der Notfall-Zwischenstand bleibt bestehen.
- Beim Sperren mit ungespeicherten Änderungen erscheint eine Warnung; „Ohne Speichern schließen“ löscht nach Bestätigung nur den zugehörigen Notfall-Zwischenstand.
- Beim Wiederöffnen derselben 3.0-Datei kann ein passender Notfall-Zwischenstand angeboten werden. Bei abweichendem Dateistand wird er nicht automatisch übernommen.

**Bewusste Grenzen dieser ersten Version:** Die vollständige 2.0-Oberfläche und ihre Import-/Synchronisierungs-, Passwortgenerator-, Auto-Sperr- und Master-Passwort-Wechsel-Funktionen sind noch nicht portiert. Wiederhergestellte Zwischenstände ohne Dateihandle müssen als neue `.enc`-Datei exportiert werden. Für neue Tresore wird ein erster Export angeboten, dessen tatsächliches Ablegen der Browser nicht bestätigen kann. Es gibt noch keine automatisierten Browser- und Sicherheitstests, keine Android-App und keine iOS-App. Bei mehreren gleichzeitig geöffneten Tabs desselben Tresors fehlt noch eine transaktionssichere Konfliktbehandlung für Notfall-Zwischenstände.

## English

**First standalone browser prototype; not production-ready.** Version 2.0 remains unchanged. Host `index.html` over HTTPS in a separate test deployment and back up existing `.enc` files before testing.

The prototype uses the existing `crypto_neu.js` and opens legacy 2.0 encrypted files. New exports contain a version-3 encrypted payload with a persistent vault ID; the old 2.0 app cannot open that new payload. Separate encrypted emergency drafts are stored in IndexedDB per vault ID. A browser supporting writable file handles may write back to the selected file, with a pre-write fingerprint conflict check and post-write readback. Other browsers only offer an export; a download is not proof that the file was safely stored. A successful write clears only that vault's emergency draft. Browser data may be deleted independently of this application.

**Prototype limitations:** Most advanced 2.0 features, atomic file backups, cross-tab draft conflict protection, automated browser/security testing, and native Android/iOS storage adapters remain future work. Recovered drafts without a file handle require export. Do not rely on this prototype as the sole copy of important passwords.

## Oberfläche / Interface (Design-Teststand)

Deutsch: Die Browser-Testversion verwendet jetzt das dunkle, kompakte Layout der 2.0-Version: optionale lokal erzeugte Website-Kürzel, Suche, Sortierung, getrennte Kopiersymbole für Benutzername und Passwort, Passwort-Auge und ein Drei-Punkte-Menü für Bearbeiten/Löschen. Der Editor wird erst auf Anforderung eingeblendet. Ein dezentes Statusfeld unterscheidet bestätigtes Schreiben der `.enc`-Datei vom bloßen Export und von der Notfall-Wiederherstellung. Die bestehende 3.0-Speicherlogik wurde für dieses Layout nicht neu entworfen; die bekannten Prototyp-Grenzen gelten weiter. Die Website-Kürzel sind keine aus dem Internet geladenen Favicons.

English: The browser test build now uses the compact dark 2.0-style layout with optional locally generated site initials, search, sorting, separate username/password copy icons, a password eye toggle, and a three-dot edit/delete menu. The editor opens on demand. A compact status panel distinguishes verified `.enc` writes from exports and emergency recovery. Existing prototype limitations still apply. Site initials are not remotely fetched favicons.


---

## Aktualisierung / Update: Wiederherstellung und Speicherstatus

**Deutsch:** Beim Öffnen einer `.enc`-Datei wird ein Wiederherstellungsdialog nur angeboten, wenn ein Zwischenstand mit derselben Tresor-ID und demselben Ausgangs-Dateistand vorhanden ist **und** dessen entschlüsselte Einträge vom Dateistand abweichen. Das bloße Öffnen einer älteren 2.0-Datei erzeugt keinen Notfall-Zwischenstand mehr. Ein vorhandener Zwischenstand wird beim Ablehnen nicht gelöscht. Ein abweichender Ausgangs-Dateistand wird nicht automatisch übernommen. Die orange Kennzeichnung **„Nicht gespeichert“** zeigt ungespeicherte Änderungen an; **„Gespeichert“** erscheint erst nach bestätigtem Schreiben und Prüfen der `.enc`-Datei. Bei unverändert geöffneten Dateien steht **„Dateistand geöffnet“**. Die Schaltflächen für direktes Speichern (sofern verfügbar) und Export befinden sich im kompakten Speicherstatus-Bereich. Ein Export ist kein bestätigtes Speichern.

**English:** Opening an `.enc` file offers recovery only when a draft matches the vault ID and original file fingerprint **and** its decrypted entries differ from the file contents. Opening a legacy 2.0 file no longer creates a draft by itself. Declining recovery leaves an existing draft intact; drafts based on a different file revision are never applied automatically. The orange **“Nicht gespeichert”** badge indicates unsaved changes. **“Gespeichert”** appears only after the `.enc` file has been written and verified; an unchanged opened file displays **“Dateistand geöffnet”**. Direct save (where supported) and export actions are grouped in the compact storage-status panel. Export alone is not a confirmed save.
