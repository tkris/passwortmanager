# Passwort Manager 3.0 – Browser-Prototyp / Browser prototype

## Deutsch

**Erste, separat zu testende Browser-Version. Nicht als produktionsreifer Passwortmanager verwenden.** Die bestehende Version 2.0 wird nicht verändert. `index.html` über HTTPS (z. B. in einem separaten GitHub-Pages-Testzweig) bereitstellen; für lokalen Test einen lokalen HTTP-Server verwenden. `.enc`-Dateien vor Tests extern sichern.

- Nutzt `crypto_neu.js` und kann das bisherige verschlüsselte 2.0-Dateiformat (Array von Einträgen) öffnen. Beim nächsten Export wird ein neues verschlüsseltes 3.0-Nutzdatenformat mit einer dauerhaften Tresor-ID geschrieben. **Vor einem dauerhaften Wechsel Kompatibilität und Rückweg prüfen:** Die 2.0-App kann das neue 3.0-Nutzdatenformat nicht öffnen.
- Unterstützt mehrere voneinander getrennte, verschlüsselte Notfall-Zwischenstände in IndexedDB, jeweils pro Tresor-ID. Die App bietet keine gemeinsame Entschlüsselung verschiedener Tresore. Browserprofil-Daten können außerhalb der App gelöscht werden; Notfall-Wiederherstellung ist nicht garantiert.
- Bei unterstütztem `showOpenFilePicker` und beschreibbarem Dateihandle kann die geöffnete Datei direkt geschrieben werden. Vor dem Schreiben wird ein SHA-256-Fingerabdruck des ursprünglichen Dateistands verglichen; nach dem Schreiben wird der Inhalt erneut gelesen und geprüft. Ein erfolgreiches Schreiben wird erst danach als „Gespeichert“ angezeigt. **Dateianbieter können trotzdem eigene Synchronisations- und Konfliktregeln haben; eine atomare Sicherungskopie ist noch nicht implementiert.**
- Bei fehlendem direkten Dateizugriff bietet die App nur `.enc`-Export an. Das Download-Angebot ist kein Nachweis, dass die Datei abgelegt wurde; der Notfall-Zwischenstand bleibt bestehen.
- Beim Sperren mit ungespeicherten Änderungen erscheint eine Warnung; „Ohne Speichern schließen“ löscht nach Bestätigung nur den zugehörigen Notfall-Zwischenstand.
- Beim Wiederöffnen derselben 3.0-Datei kann ein passender Notfall-Zwischenstand angeboten werden. Bei abweichendem Dateistand wird er nicht automatisch übernommen.

**Bewusste Grenzen dieser ersten Version:** Die vollständige 2.0-Oberfläche und ihre Passwortgenerator-Funktion sind noch nicht portiert. Wiederhergestellte Zwischenstände ohne Dateihandle müssen als neue `.enc`-Datei exportiert werden. Für neue Tresore wird ein erster Export angeboten, dessen tatsächliches Ablegen der Browser nicht bestätigen kann. Es gibt noch keine automatisierten Browser- und Sicherheitstests, keine Android-App und keine iOS-App. Bei mehreren gleichzeitig geöffneten Tabs desselben Tresors fehlt noch eine transaktionssichere Konfliktbehandlung für Notfall-Zwischenstände.

## English

**First standalone browser prototype; not production-ready.** Version 2.0 remains unchanged. Host `index.html` over HTTPS in a separate test deployment and back up existing `.enc` files before testing.

The prototype uses the existing `crypto_neu.js` and opens legacy 2.0 encrypted files. New exports contain a version-3 encrypted payload with a persistent vault ID; the old 2.0 app cannot open that new payload. Separate encrypted emergency drafts are stored in IndexedDB per vault ID. A browser supporting writable file handles may write back to the selected file, with a pre-write fingerprint conflict check and post-write readback. Other browsers only offer an export; a download is not proof that the file was safely stored. A successful write clears only that vault's emergency draft. Browser data may be deleted independently of this application.

**Prototype limitations:** Some advanced 2.0 features, atomic file backups, cross-tab draft conflict protection, automated browser/security testing, and native Android/iOS storage adapters remain future work. Recovered drafts without a file handle require export. Do not rely on this prototype as the sole copy of important passwords.

## Oberfläche / Interface (Design-Teststand)

Deutsch: Die Browser-Testversion verwendet jetzt das dunkle, kompakte Layout der 2.0-Version: optionale lokal erzeugte Website-Kürzel, Suche, Sortierung, getrennte Kopiersymbole für Benutzername und Passwort, Passwort-Auge und ein Drei-Punkte-Menü für Bearbeiten/Löschen. Der Editor wird erst auf Anforderung eingeblendet. Ein dezentes Statusfeld unterscheidet bestätigtes Schreiben der `.enc`-Datei vom bloßen Export und von der Notfall-Wiederherstellung. Die bestehende 3.0-Speicherlogik wurde für dieses Layout nicht neu entworfen; die bekannten Prototyp-Grenzen gelten weiter. Die Website-Kürzel sind keine aus dem Internet geladenen Favicons.

English: The browser test build now uses the compact dark 2.0-style layout with optional locally generated site initials, search, sorting, separate username/password copy icons, a password eye toggle, and a three-dot edit/delete menu. The editor opens on demand. A compact status panel distinguishes verified `.enc` writes from exports and emergency recovery. Existing prototype limitations still apply. Site initials are not remotely fetched favicons.


---

## Aktualisierung / Update: Wiederherstellung und Speicherstatus

**Deutsch:** Beim Öffnen einer `.enc`-Datei wird ein Wiederherstellungsdialog nur angeboten, wenn ein Zwischenstand mit derselben Tresor-ID und demselben Ausgangs-Dateistand vorhanden ist **und** dessen entschlüsselte Einträge vom Dateistand abweichen. Das bloße Öffnen einer älteren 2.0-Datei erzeugt keinen Notfall-Zwischenstand mehr. Ein vorhandener Zwischenstand wird beim Ablehnen nicht gelöscht. Ein abweichender Ausgangs-Dateistand wird nicht automatisch übernommen. Die orange Kennzeichnung **„Nicht gespeichert“** zeigt ungespeicherte Änderungen an; **„Gespeichert“** erscheint erst nach bestätigtem Schreiben und Prüfen der `.enc`-Datei. Bei unverändert geöffneten Dateien steht **„Dateistand geöffnet“**. Die Schaltflächen für direktes Speichern (sofern verfügbar) und Export befinden sich im kompakten Speicherstatus-Bereich. Ein Export ist kein bestätigtes Speichern.

**English:** Opening an `.enc` file offers recovery only when a draft matches the vault ID and original file fingerprint **and** its decrypted entries differ from the file contents. Opening a legacy 2.0 file no longer creates a draft by itself. Declining recovery leaves an existing draft intact; drafts based on a different file revision are never applied automatically. The orange **“Nicht gespeichert”** badge indicates unsaved changes. **“Gespeichert”** appears only after the `.enc` file has been written and verified; an unchanged opened file displays **“Dateistand geöffnet”**. Direct save (where supported) and export actions are grouped in the compact storage-status panel. Export alone is not a confirmed save.


---

## Import & Synchronisation mit Diff (Deutsch)

- **Einträge aus Tresor importieren:** Im geöffneten Tresor die zweite `.enc`-Datei wählen und mit deren Master-Passwort entschlüsseln. Die scrollbare Liste zeigt neue und abweichende Einträge. Einzelne Einträge markieren oder **„Alle übernehmen“** wählen; **„Auswahl aufheben“** setzt die Auswahl zurück.
- **Tresore synchronisieren (Diff):** Zeigt die Unterschiede zum zweiten Tresor nach Website/URL und Benutzername. Bei Abweichungen ersetzt die ausgewählte Fassung aus der zweiten Datei den entsprechenden Eintrag im geöffneten Tresor. Nicht ausgewählte Einträge bleiben unverändert. Unveränderte Einträge werden nicht angezeigt.
- Die zweite Datei wird **nur gelesen, niemals verändert**. Es erfolgt **keine automatische bidirektionale Synchronisation** und keine automatische Übernahme von Löschungen. Unterschiedliche Website-/Benutzernamen-Kombinationen gelten als separate Einträge; identische Kombinationen werden verglichen. Prüfe die Auswahl, insbesondere bei doppelten Einträgen.
- Übernommene Einträge gelten als **nicht gespeichert** und werden nach Möglichkeit im verschlüsselten Notfall-Zwischenstand gesichert. Erst das erfolgreiche direkte Schreiben und Prüfen der geöffneten `.enc`-Datei bestätigt „Gespeichert“. Ein Export allein bestätigt dies nicht.
- **Sicherheit:** Das Master-Passwort der zweiten Datei wird nur für den aktuellen Vergleich abgefragt; die entschlüsselten Einträge werden nicht als zusätzlicher Browser-Zwischenstand gespeichert. Vergleiche und importiere nur Dateien, deren Herkunft du vertraust.

## Import & diff synchronization (English)

- **Import entries from vault:** Select a second `.enc` file and unlock it with its master password. The scrollable list shows new and differing entries. Select individual entries or use **“Alle übernehmen” (Select all)**; **“Auswahl aufheben”** clears the selection.
- **Synchronize vaults (Diff):** Compare entries by website/URL and username. Selecting a differing entry replaces the corresponding entry in the currently open vault with the second file's version. Unselected entries remain unchanged; identical entries are omitted.
- The second file is **read-only**. This is **not automatic two-way synchronization** and deletions are not propagated. Different website/username combinations are treated as separate entries; review duplicates carefully.
- Applied changes are **unsaved** until the open `.enc` file is successfully written and verified. An encrypted emergency draft is attempted; exporting alone does not confirm a save. The second file's master password and decrypted contents are not stored as a separate emergency draft.


## Automatische Sperre / Automatic lock (3.0)

**Deutsch:** Unter „⚙️ Einstellungen“ im geöffneten Tresor lässt sich die automatische Sperre nach 1, 5, 10, 15 oder 30 Minuten Inaktivität einstellen oder mit „Niemals sperren“ deaktivieren (Standard: 5 Minuten). Die Auswahl bleibt in diesem Browser gespeichert. Nach einer manuellen oder automatischen Sperre kann der Tresor in derselben geöffneten Seite mit dem Master-Passwort wieder entsperrt werden, ohne die `.enc`-Datei erneut auszuwählen. Die App verwirft dabei die entschlüsselten Einträge und den Sitzungsschlüssel; nur ein verschlüsselter Sitzungsschnappschuss bleibt bis zum Entsperren oder Verlassen der Sperrseite im Arbeitsspeicher. Bei ungespeicherten Änderungen muss zuvor ein verschlüsselter Notfall-Zwischenstand erfolgreich im Browser gespeichert werden, andernfalls wird die Sperre nicht durchgeführt. Eine Sperre schreibt **nicht** in die `.enc`-Datei. Beim Schließen oder Neuladen der Seite ist die Entsperr-Sitzung weg; öffne dann die Datei erneut oder nutze bei ungespeicherten Änderungen die Notfall-Wiederherstellung. Die automatische Sperre ist kein Schutz gegen bereits kompromittierte Browser-Erweiterungen oder Geräte.

**English:** In the open vault, use “⚙️ Einstellungen” to choose automatic locking after 1, 5, 10, 15 or 30 minutes of inactivity, or disable it with “Niemals sperren” (default: 5 minutes). The preference is saved in this browser. After manual or automatic locking, unlock the vault on the same open page with its master password without selecting the `.enc` file again. Decrypted entries and the session key are discarded; only an encrypted session snapshot remains in memory until unlocking or leaving the lock screen. If changes are unsaved, an encrypted emergency draft must be stored successfully before locking; otherwise locking is cancelled. Locking does **not** write the `.enc` file. Reloading or closing the page discards the unlock session; reopen the file or use emergency recovery for unsaved changes. Automatic locking cannot protect against a compromised device or browser extensions.

### Layout und Master-Passwort (aktuelle Testversion)

- Die Tresorüberschrift zeigt die Eintragszahl; die orange Plakette „Nicht gespeichert“ erscheint nur bei ungespeicherten Änderungen. Der Speicherstatus ist einmalig und kompakt, die Export- und Speicherbuttons haben dieselbe Größe wie andere Aktionen.
- „Einstellungen“ ist zunächst eingeklappt. Darin befinden sich „Symbole anzeigen“, die automatische Sperre und „Master-Passwort ändern“.
- Der Master-Passwort-Wechsel ist **nur bei direktem, beschreibbarem Dateizugriff** möglich. Vorheriges Passwort wird geprüft, das neue darf nicht leer sein und muss zweimal identisch sein; bei weniger als 12 Zeichen erscheint ein bestätigbarer Sicherheitshinweis. Die Datei wird erst nach Verschlüsselungsprüfung und ausdrücklicher Bestätigung überschrieben und danach erneut gelesen und geprüft. Ohne Dateihandle bleibt die Aktion deaktiviert; ein Download gilt nicht als bestätigter Passwortwechsel.
- **Vor einem Master-Passwort-Wechsel unbedingt eine externe Sicherungskopie anlegen.** Bei einem Fehler während des Schreibens ist der Dateistand möglicherweise unklar; in diesem Fall die Datei nicht blind erneut überschreiben. Der Passwortwechsel betrifft ausschließlich den aktuell geöffneten Tresor, nicht andere Tresore oder deren Notfall-Zwischenstände.

### Layout and master password (current test version)

- The vault heading shows the entry count; the orange “Not saved” badge appears only for unsaved changes. Storage status is shown once in a compact panel with consistent action-button sizing.
- Settings are collapsed by default and contain icon visibility, automatic locking and the master-password change action.
- Changing the master password requires **direct writable file access**. The current password is checked, the new password must not be empty and must match its confirmation; passwords shorter than 12 characters trigger a confirmable security warning. The replacement ciphertext is verified before the user confirms the write; the written file is read back and checked. The action is disabled without a writable file handle; an export alone cannot confirm a password change.
- **Create an external backup before changing the master password.** A write failure can leave the file in an uncertain state; do not overwrite it blindly. The change affects only the currently opened vault, not other vaults or their emergency drafts.


## Exportprüfung / Export verification (3.0)

**Deutsch:** Nach einem Export mit ungespeicherten Änderungen zeigt die orange Plakette „Nicht bestätigt“. Neben „.enc exportieren“ erscheint „.enc prüfen“. Wähle die tatsächlich heruntergeladene `.enc`-Datei und gib das Master-Passwort ein. Die App entschlüsselt die ausgewählte Datei und vergleicht Tresor-ID und sämtliche Einträge mit dem aktuellen Stand. Nur bei vollständiger Übereinstimmung erscheint die grüne Plakette „Gespeichert“ und der zugehörige Notfall-Zwischenstand wird entfernt. Bei falscher Datei, falschem Passwort oder Änderungen seit dem Export bleibt der Stand unbestätigt; erneut exportieren und prüfen. Die Prüfung bestätigt **nur die ausgewählte Datei**, nicht das Ersetzen einer älteren Datei an einem anderen Speicherort. Nach erfolgreicher Exportprüfung wird eine eventuell zuvor geöffnete direkte Dateiverknüpfung getrennt, damit die ältere Datei nicht versehentlich überschrieben wird. Für das nächste Öffnen die geprüfte Datei auswählen.

**English:** Exporting a vault with unsaved changes shows the orange “Nicht bestätigt” (Not confirmed) badge and a “.enc prüfen” (Verify .enc) button next to Export. Select the downloaded file and enter its master password. The app decrypts the selected file and compares its vault ID and all entries with the current vault. Only an exact match shows the green “Gespeichert” (Saved) badge and removes the corresponding emergency draft. A wrong file, incorrect password or later edits leave the export unconfirmed; export and verify again. Verification confirms **the selected file only**; it does not replace an older file elsewhere. After verification, any previously opened direct file handle is detached to prevent overwriting an older copy. Open the verified file next time.

## Passwortgenerator und Dateiprüfung / Password generator and file verification

**DE:** Beim Erstellen und Bearbeiten eines Eintrags kann das Passwort mit dem Auge angezeigt oder verborgen werden. Der Generator erstellt Passwörter mit 8–64 Zeichen (Vorgabe: 20). Kleinbuchstaben, Großbuchstaben, Zahlen und Sonderzeichen lassen sich einzeln wählen; jede aktivierte Gruppe kommt mindestens einmal vor. Die Erzeugung nutzt `crypto.getRandomValues()` und ersetzt den aktuellen Inhalt des Passwortfelds. Erst das Übernehmen des Eintrags ändert den Tresor. „.enc prüfen“ ist dauerhaft sichtbar: Die ausgewählte Datei muss zur Tresor-ID passen und exakt die aktuellen Einträge enthalten. Eine erfolgreiche Prüfung bestätigt ausschließlich die ausgewählte Datei, nicht das Ersetzen einer anderen Datei.

**EN:** When creating or editing an entry, the eye button shows or hides the password. The generator creates passwords of 8–64 characters (default: 20). Lowercase, uppercase, digits and special characters can be selected individually; every selected group appears at least once. Generation uses `crypto.getRandomValues()` and replaces the current password field. The vault changes only when the entry is applied. “Verify .enc” remains visible at all times: the selected file must match the vault ID and contain exactly the current entries. Successful verification confirms only the selected file, not replacement of any other file.


## Optische Anpassung / Visual refinement (3.0)

**Deutsch:** „Symbole anzeigen“ ist im eingeklappten Einstellungsbereich als vollbreite Zeile mit einem Schalter rechts gestaltet; die bestehende Funktion zum Ein- und Ausblenden der Website-Kürzel bleibt erhalten. Der Button „Passwort generieren“ verwendet nun die gleiche sekundäre Button-Gestaltung (Farbe, Höhe, Ecken und Schrift) wie Import und Diff. Suchfeld und Texteingaben im Formular „Neues Passwort“ nutzen dieselbe Hintergrund- und Rahmenfarbe. Der äußere Formularbereich bleibt zur optischen Trennung etwas dunkler. Die Verschlüsselungs-, Export- und Prüfregeln wurden nicht verändert.

**English:** “Show icons” now appears as a full-width settings row with a switch on the right; the existing site-initials visibility behavior is unchanged. The “Generate password” button now shares the secondary action styling (color, height, corners and typography) used by Import and Diff. The search field and text inputs in the “New password” editor use the same background and border colors. The surrounding editor panel remains slightly darker for visual separation. Encryption, export and verification behavior is unchanged.


## Formularanpassung / Entry form update

**DE:** Beim Anlegen und Bearbeiten eines Eintrags werden nur noch „Website / URL“, „Benutzername / E-Mail“ und „Passwort“ angezeigt. Das Auge zum Anzeigen des Passworts befindet sich innerhalb des Passwortfelds. Der Generator bleibt darunter. Die eingegebene Website wird in den vorhandenen Datenfeldern `title` und `url` abgelegt; beim Bearbeiten eines älteren Eintrags mit unterschiedlicher Bezeichnung und URL wird die Bezeichnung durch den eingegebenen Website-/URL-Wert ersetzt. Die Verschlüsselung und das Tresorformat wurden nicht geändert. Die Kompatibilität mit Version 2.0 ist dadurch nicht hergestellt.

**EN:** Creating and editing an entry now shows only “Website / URL”, “Username / email”, and “Password”. The visibility button sits inside the password field; the generator remains below. The website value is stored in the existing `title` and `url` fields. Editing an older entry with a separate title and URL replaces its title with the entered website/URL value. Encryption and the vault format are unchanged; this does not add compatibility with version 2.0.


### Formular und Master-Passwort / Entry form and master password

DE: Das Augensymbol sitzt ohne sichtbaren Button-Hintergrund im Passwortfeld beim Erstellen und Bearbeiten. Unter Einstellungen öffnet „Master-Passwort ändern“ ein aufklappbares Formular mit drei Passwortfeldern und jeweils eigener Sichtbarkeitsfunktion; „Abbrechen“ verwirft die Eingaben. Ohne direkten Schreibzugriff wird das Formular angezeigt, aber die Änderung kann nicht abgeschlossen werden; es erscheint eine erklärende Meldung. Eine bestätigte Passwortänderung setzt weiterhin das Schreiben und Prüfen der .enc-Datei voraus.

EN: The eye icon appears inside the password field without a separate visible button background in create/edit forms. Under Settings, “Change master password” expands a form with three password fields, each with its own visibility toggle; Cancel clears the inputs. Without direct file-write access, the form opens but the change cannot be completed and an explanation is displayed. A confirmed password change still requires writing and verifying the .enc file.


### Sichtbarkeitssymbol korrigiert / Visibility icon fix

**DE:** Das Auge im Passwortfeld für neue und bearbeitete Einträge wird nun als SVG mit sichtbarer Pupille dargestellt (statt als Kreis). Beim Einblenden wechselt es zum durchgestrichenen Auge; die Master-Passwortfelder behalten dieselbe Symbolfamilie. Die Änderung betrifft nur die Anzeige, nicht die Verschlüsselung oder das Tresorformat.

**EN:** The eye in the create/edit password field is now rendered as an SVG with a visible pupil (rather than a circle). When the password is shown, the icon changes to an eye with a slash; master-password fields use the same icon family. This is a display-only change and does not alter encryption or the vault format.


DE (Korrektur): Der Button „Master-Passwort ändern“ bleibt auch ohne direkten Dateizugriff anklickbar und öffnet das Formular. Erst das Abschließen erfordert einen beschreibbaren Dateihandle; andernfalls erscheint eine Erklärung.

EN (fix): The “Change master password” button remains clickable without direct file access and opens the form. Completing the change requires a writable file handle; otherwise an explanation is shown.


## Master-Passwort ändern ohne direkten Dateizugriff / Change master password without direct file access

**DE:** Unter Einstellungen → Master-Passwort ändern das bisherige und zweimal das neue Master-Passwort eingeben. Bei direktem Dateizugriff wird die geöffnete Datei wie bisher geschrieben und geprüft. Ohne direkten Dateizugriff bietet die App stattdessen eine mit dem neuen Passwort verschlüsselte `.enc`-Datei zum Download an. Der Status bleibt orange „Nicht bestätigt“; die alte Datei wird nicht überschrieben. Die heruntergeladene Datei mit „.enc prüfen“ auswählen und das **neue** Master-Passwort eingeben. Die App vergleicht die exakten exportierten Dateibytes und den Tresorinhalt. Erst bei erfolgreicher Prüfung wechselt der Sitzungs-Schlüssel zum neuen Passwort, der Status wird grün „Gespeichert“ und der alte Notfall-Zwischenstand wird entfernt. Vorher gilt in der laufenden Sitzung weiterhin das bisherige Passwort. Die neue Datei beim nächsten Öffnen verwenden; die alte Datei erst nach erfolgreicher Prüfung selbst ersetzen oder sicher aufbewahren. Sperren, Änderungen am Tresor oder ein erneuter Master-Passwortwechsel vor der Prüfung verwerfen die ausstehende Umstellung; gegebenenfalls erneut exportieren. Falls der Download abgebrochen wurde oder die Prüfung scheitert, bleibt die alte Datei unverändert. Bitte zuerst ausschließlich mit Testtresoren ausprobieren.

**EN:** In Settings → Change master password, enter the current password and the new password twice. With direct file access the app writes and verifies the opened file as before. Without direct access, it offers a newly encrypted `.enc` download; the old file is not overwritten and the status stays orange “Not confirmed”. Select the downloaded file via “Verify .enc” and enter the **new** master password. The app checks the exact exported file bytes and vault contents. Only successful verification switches the in-memory session key to the new password, shows green “Saved”, and removes the old emergency draft. Until then, the current session still uses the old password. Open the verified new file next time; only replace the old file yourself after verification. Locking, editing, or starting another password change before verification cancels the pending rotation; export again if needed. Test with disposable vaults first.

### Master-Passwort-Länge / Master password length

DE: Für neue Tresore und beim Ändern des Master-Passworts gilt keine feste Mindestlänge von 12 Zeichen mehr. Ein leeres Passwort ist weiterhin nicht zulässig, und die Wiederholung muss übereinstimmen. Beim Ändern erscheint für Passwörter unter 12 Zeichen ein bestätigbarer Sicherheitshinweis. Kürzere Master-Passwörter können leichter erraten werden.

EN: Creating a vault and changing its master password no longer enforce a 12-character minimum. Empty passwords remain invalid and the confirmation must match. Changing to a password shorter than 12 characters displays a security warning that can be confirmed. Short master passwords may be easier to guess.


## Temporäre Benachrichtigungen / Temporary notifications

**DE:** Allgemeine Statusmeldungen werden nicht mehr unter dem Logo angezeigt, sondern als kurzzeitige Benachrichtigungen unten rechts (auf schmalen Bildschirmen unten mittig). Erfolge erscheinen grün für etwa 3 Sekunden, Hinweise neutral für etwa 4 Sekunden und Fehler/Warnungen rot für etwa 7 Sekunden. Meldungen können über × sofort geschlossen werden. Der dauerhafte Speicherstatus im Tresor bleibt unverändert und ist unabhängig von diesen Benachrichtigungen.

**EN:** General messages no longer occupy a line below the logo. They appear as temporary notifications at the bottom right (bottom center on narrow screens). Success messages are green for about 3 seconds, informational messages neutral for about 4 seconds, and errors/warnings red for about 7 seconds. The × button dismisses a message immediately. The persistent vault storage status remains unchanged and independent of notifications.


## Einheitliche Ansichten und Passwortfelder / Unified views and password fields

DE: Tresorauswahl, Tresor öffnen, gesperrter Tresor und geöffneter Tresor verwenden dieselbe responsive Fensterbreite. Die Master-Passwortfelder zum Öffnen, Anlegen und Entsperren besitzen nun ebenso wie die Passwortfelder im Eintragsformular und bei der Master-Passwortänderung ein Auge innerhalb des Felds. Beim Aufrufen sind Passwörter verborgen. Beim Generieren eines Eintragspassworts wird das neu erzeugte Passwort ausnahmsweise sofort angezeigt; über das Auge kann es wieder verborgen werden. Die Tresor- und Speicherlogik bleibt unverändert.

EN: Vault selection, opening, locked and open vault views share the same responsive panel width. Master password inputs for opening, creating and unlocking a vault now have an in-field visibility toggle, like entry and master password change inputs. Passwords start hidden. Generating an entry password automatically reveals the new password; the eye control can hide it again. Vault and storage logic remain unchanged.


## Kompakte Startseite / Compact home screen

**DE:** Die Tresorauswahl ist wieder ein schmales, mittig ausgerichtetes Fenster im bestehenden 3.0-Design. Die Buttons „.enc-Datei öffnen“ und „Neuen Tresor anlegen“ stehen gleich breit untereinander. Die Notfall-Wiederherstellung erscheint nur, wenn im Browser strukturell verwendbare verschlüsselte Zwischenstände vorliegen; sie ist durch eine Linie von den Hauptaktionen getrennt. Ob ein Zwischenstand mit dem Master-Passwort entschlüsselt werden kann und zu einem geöffneten Tresor passt, wird weiterhin beim Öffnen geprüft. Ohne Zwischenstände wird auch keine Leerstandsmeldung angezeigt. Die Ansichten des geöffneten und gesperrten Tresors bleiben unverändert.

**EN:** Vault selection is a narrow, centered panel using the existing 3.0 theme. The Open .enc and Create vault buttons are equally wide and stacked. Emergency recovery is separated from the main actions and shown only when structurally usable encrypted drafts exist in the browser. Decryption and vault matching are still checked when opening a draft or vault. No empty-state recovery message is shown. Open and locked vault views are unchanged.
