# Deckt den nicht-automatisierten Teil der Test-Suite für die beschriebene Funktionalität
# In diesem Fall den effektiven Import der Items und deren Darstellung der konfigurierten Eigenschaften.

@RETINA-1565413
Funktionalität: Konfigurieren der zu importierenden Item-Eigenschaften

    Importierte Items sollen die konfigurierten Eigenschaften als Tags anzeigen.

    Grundlage:
        Angenommen ich bin Mitglied im Toolchains Projekt auf Retina
		Und ich habe das Plugin auf das Toolchains Projekt auf Retina konfiguriert und mich authentifiziert
		Und ich habe das "Import Items from codeBeamer" Modal geöffnet
        Und ich habe "cALM Features" als Tracker ausgewählt
        Und ich habe das "Import Configuration" Modal geöffnet

    # Eine einzelne Eigenschaft mit einzelnem Wert
    Szenario: "StoryPoints" als zu importierende Eigenschaft auswählen
        Wenn ich nur die Checkbox für "StoryPoints" checke
        Und ich die Einstellung speichere
        Und ich das erste Item in der Restultate-Tabelle importiere
        Dann erscheint auf dem Miro Board das entsprechende Item mit einem Tag der "StoryPoints: {storyPoints}" anzeigt
        # Kann verifiziert werden durch Besuch der entsprechenden Item-Seite
        Und der StoryPoints stimmt mit dem aktuellen StoryPoints des zugrundeliegenden Items überein

    # Eine einzelne Eigenschaft mit potenziell mehreren Werten
    Szenario: "AssignedTo" als zu importierende Eigenschaft auswählen
        Wenn ich nur die Checkbox für "AssignedTo" checke
        Und ich die Einstellung speichere
        Und ich das erste Item in der Resultate-Tabelle importiere
        Dann erscheint auf dem Miro Board das entsprechende Item mit einem Tag der "AssignedTo: {name[,name]}" anzeigt
        # Kann verifiziert werden durch Besuch der entsprechenden Item-Seite
        Und die aufgeführten Namen stimmen mit denen des zugrundeliegenden Items überein

    # Mehrere Eigenschaften
    Szenario: "StartDate" und "EndDate" als zu importierende Eigenschaft auswählen
        Wenn ich nur die Checkboxen für "StartDate" und "EndDate" checke
        Und ich die Einstellung speichere
        Und ich das erste Item in der Resultate-Tabelle importiere
        Dann erscheint auf dem Miro Board das entsprechende Item mit einem Tag der "StartDate: {startDate}" anzeigt
        Und mit einem Tag der "EndDate: {endDate}" anzeigt
        # Kann verifiziert werden durch Besuch der entsprechenden Item-Seite
        Und die aufgeführten Daten stimmen mit denen des zugrundeliegenden Items überein
