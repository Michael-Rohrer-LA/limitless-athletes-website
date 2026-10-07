# So sammeln wir Reels

## Nummerierung

Neue, eigenständige Beiträge fortlaufend in Eingangsreihenfolge nummerieren. Sam hat ausdrücklich gewünscht, versehentlich falsch genannte Nummern automatisch zu korrigieren, ohne Rückfrage oder Buchstabenzusatz. Nach Reel 9 folgt Reel 10. Ergänzende Aufnahmen desselben Beitrags beim bestehenden Eintrag belassen.

Die Nummerierung läuft auch bei einem Accountwechsel weiter. Quellenwechsel: nach Reel 9 zu Joe DeFranco (@defrancosgym), nach Reel 18 zu Overtime Athletes (@overtimeathletes). Aktuell angekündigte Quelle für folgende Beiträge: Overtime Athletes. Neue Einträge in der passenden Accountdatei verlinken; die tatsächliche Quelle anhand der Aufnahme prüfen.

## Was Sam bereitstellt

- Link zum Original.
- Bildschirmaufnahme mit Ton als lokale Videodatei.
- Screenshot der vollständigen Caption, falls sie im Video nicht lesbar ist.
- Ein kurzer Satz dazu, was gefällt oder welche eigene Idee daraus entsteht.

## Verarbeitung

Seit 21.09.2026 ist lokale Transkription eingerichtet und mit Reel 2 getestet. FFmpeg liest die Tonspur aus; whisper.cpp erzeugt englischen Text und SRT-Untertitel mit Zeitmarken. Die Aufnahme wird dabei nicht an einen Transkriptionsdienst hochgeladen. Es fallen keine API-Gebühren an.

Die Werkzeuge liegen unter `local/instagram-transcription` im Projekt, außerhalb des Website-Ordners. Das eingerichtete Modell ist für englische Sprache gedacht. Für andere Sprachen muss ein passendes mehrsprachiges Modell eingerichtet werden.

Beispiel für die Verwendung aus dem Projekt-Hauptordner:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File '.\local\instagram-transcription\Transcribe-Reel.ps1' -VideoPath 'C:\Pfad\zur\Aufnahme.mp4' -OutputBase '.\website\Instagram Content Research\Transkripte\004 - Original EN automatisch'
```

Die ExecutionPolicy-Option gilt nur für diesen PowerShell-Prozess, da die vorhandene Windows-Einstellung lokale Skripts standardmäßig blockiert; die Systemeinstellung wird nicht dauerhaft geändert. Vorhandene Transkriptdateien werden nicht überschrieben. Der Ablauf wird auf Anforderung ausgeführt; es gibt keine automatische Ordnerüberwachung.

## Aufnahmen und Speicherplatz

Nach abgeschlossener Verarbeitung bleiben TXT, SRT und Recherche-Notizen unabhängig von der ursprünglichen Videodatei erhalten. Ein lokaler Dateilink ist keine Sicherung der Aufnahme. Wer die Aufnahme löscht, kann Ton, Bewegungen und Schnitt daraus später nicht mehr erneut prüfen lassen; dafür müsste das Video erneut bereitgestellt werden. Die Originale werden nicht automatisch gelöscht. Für besonders relevante Vorlagen kann sich das Behalten lohnen.

## Gespeicherte Recherche je Reel

- Automatisches Originaltranskript als TXT und SRT.
- Deutsche Inhaltszusammenfassung mit markierten Unklarheiten.
- Hook, Argumentation und Erzählstruktur.
- Eigener Content-Winkel; Skript erst bei Ausarbeitung.

Automatische Transkripte sind keine geprüften wörtlichen Zitate. Insbesondere Namen, Zahlen, Fachbegriffe und abgeschnittene Sätze prüfen. Aussagen der Sprecher bleiben zunächst Quellenbehauptungen; fachliche Prüfung erfolgt vor Veröffentlichung.

## Technische Quellen

- whisper.cpp: https://github.com/ggml-org/whisper.cpp (Windows-Build b5130)
- Modelle: https://huggingface.co/ggerganov/whisper.cpp
- FFmpeg 9.0.2: https://www.gyan.dev/ffmpeg/builds/ (über https://ffmpeg.org/download.html verlinkt)

Downloads wurden vor Verwendung gegen die veröffentlichten Prüfsummen geprüft.
