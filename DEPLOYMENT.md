# ServiceDesk online nutzen

So bekommst du ServiceDesk auf eine echte URL, die auf Handy und PC von überall funktioniert.

## 1. Supabase vorbereiten

In Supabase im SQL Editor den Inhalt von `supabase-schema.sql` ausführen.

Danach unter Authentication einmal deinen Account erstellen oder in der App registrieren.
Wenn dein Account steht, kannst du Signups in Supabase deaktivieren.

## 2. Vercel Projekt erstellen

Am einfachsten:

1. Code auf GitHub hochladen.
2. Auf https://vercel.com einloggen.
3. `Add New Project` klicken.
4. GitHub-Repository auswählen.
5. Framework wird automatisch als Next.js erkannt.

## 3. Environment Variables in Vercel setzen

In Vercel beim Projekt unter Settings -> Environment Variables eintragen:

```env
NEXT_PUBLIC_SUPABASE_URL=https://dein-projekt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dein_publishable_key
```

Danach Redeploy klicken.

## 4. Handy nutzen

Nach dem Deploy bekommst du eine URL wie:

```text
https://dein-projekt.vercel.app
```

Diese URL kannst du auf dem Handy öffnen und zum Homescreen hinzufügen.

## Wichtig

`localhost` funktioniert nur auf deinem PC.
Die Vercel-URL funktioniert von überall.
