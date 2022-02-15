# Deckt den nicht-automatisierten Teil der Test-Suite für die beschriebene Funktionalität
# In diesem Fall die korrekte Darstellung von verschiedenen Assoziationen auf dem Miro Board.

Funktionalität: Visuelle Unterscheidung verschiedener Assoziationen zwischen Items

    Die neun Assoziationstypen in codeBeamer sollen unterschiedlich visualisiert werden.

    Grundlage: 
        Angenommen ich bin Mitglied im "Toolchains@Temp" Projekt auf Retina-Test
		Und ich habe das Plugin auf das "Toolchains@Temp" Projekt auf Retina-Test konfiguriert und mich authentifiziert
        Und ich habe bin auf einem leeren Miro-Board
		Und ich habe das "Import Items from codeBeamer" Modal geöffnet
        Und ich habe "Miro Sync Tests by urecha" als Tracker ausgewählt

    Szenario: Korrekte Darstellung einer "<assoziationsTyp>" Assoziation
        Wenn ich die Items "<firstItem>" und "<secondItem>" für den Import auswähle
        Und den "Import" Button drücke
        Dann werden die beiden Items als Miro Cards generiert
        Und eine gestrichelte Verbindungslinie besteht zwischen den beiden Items
        Und die Verbindungslinie ist "<farbe>"
        Und ihr Pfeil geht von Item "<secondItem>" zu Item "<firstItem>"

        Beispiele: 
        | assoziationsTyp | farbe | firstItem | secondItem |
        | depends on | rot | 1599511 | 1599512 |
        | copy of | türkis | 1599514 | 1599513 |
        | subordinate to | hellgrün | 1599513 | 1599511 |
