# Nattitor Operations

[English](#english) · [Español](#español) · [Live demo / Demo](https://nattitor-dashboard.vercel.app/)

![Nattitor Operations dashboard](public/preview.png)

## English

A B2B dashboard for reviewing customer payments and collections. A portfolio project by **Freddy Guerra (Nattitor)**.

Built with Next.js, React, TypeScript, Tailwind CSS, Recharts and SQLite. The interface is read-only and uses sample data, not real customer or payment records.

### Run locally

You need **Node.js 24 LTS** and npm.

```sh
npm ci
npm run dev
```

Open the address printed in the terminal. No database account or environment variables are needed.

The first request creates `.data/nattitor.sqlite` if it is missing. The file stays on disk between restarts. Existing databases are not reset or reseeded, and nothing is imported from the previous remote database.

### What you can do

- Review collected revenue, successful payments, active customers and payment success rate.
- Switch between six and twelve months of revenue, or read the monthly values in a table.
- Search payments by ID, customer name or email; filter by status and sort by amount or date.
- Browse transactions in pages of ten, copy an ID or export the current page as CSV.
- Use the dashboard on desktop or mobile, with keyboard navigation.

Amounts are in USD and dates use UTC. Revenue includes paid transactions only; it is not MRR. The sample data uses a fixed snapshot: **October 30, 2026**.

### Hosting

Node.js 24 is required. On a local machine or a server, SQLite uses the persistent `.data/` directory. Initial setup needs same-directory hard-link support; local checks used NTFS.

On Vercel, the read-only demo uses SQLite in the function's temporary directory. A new instance can recreate its own copy from the sample dataset. These copies are not shared or permanent and must not be used to store real payments or user changes. No external database account is needed.

For a server with persistent storage:

```sh
npm run build
npm start
```

Keep `.data/` between deployments and include it in your backups. Neither the database nor local environment files belong in Git.

### Checks

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run format:check
```

`npm run db:status` reports the database location, snapshot date and record counts. It creates the database only if it is missing.

Browser tests use Google Chrome and a running app at `http://127.0.0.1:3100`. Set `PLAYWRIGHT_BASE_URL` for another address, then run `npm run test:e2e`. See [the audit notes](docs/AUDIT.md) for test results and limitations.

### Browser extensions

Hydration warnings mentioning `bis_skin_checked`, `bis_register` or `__processed_*` can come from an extension changing the page before React starts. Try a Guest profile with no extensions. If that removes the warning, restrict the responsible extension's access to the local site and reload with `Ctrl+Shift+R`. Do not hide unrelated hydration errors.

## Español

Un dashboard B2B para consultar los pagos de clientes y seguir los cobros. Un proyecto de portfolio de **Freddy Guerra (Nattitor)**.

Desarrollado con Next.js, React, TypeScript, Tailwind CSS, Recharts y SQLite. La interfaz es de solo lectura y usa datos de ejemplo, no registros de clientes ni pagos reales.

### Ejecutar en local

Necesitás **Node.js 24 LTS** y npm.

```sh
npm ci
npm run dev
```

Abrí la dirección que aparece en la terminal. No hace falta una cuenta de base de datos ni configurar variables de entorno.

La primera consulta crea `.data/nattitor.sqlite` si el archivo no existe. La base se conserva entre reinicios. No se reinician ni se vuelven a cargar bases existentes, y no se importa nada de la base remota anterior.

### Qué permite hacer

- Consultar lo cobrado, los pagos exitosos, los clientes activos y la tasa de pagos exitosos.
- Ver seis o doce meses de ingresos, o consultar los importes mensuales en una tabla.
- Buscar pagos por ID, nombre o correo del cliente; filtrar por estado y ordenar por importe o fecha.
- Recorrer las transacciones de a diez, copiar un ID o exportar la página actual como CSV.
- Usar el dashboard en escritorio o móvil, también con el teclado.

Los importes están en USD y las fechas usan UTC. Los ingresos incluyen solo transacciones pagadas; no son MRR. Los datos de ejemplo tienen una fecha fija de corte: **30 de octubre de 2026**.

### Publicación

Hace falta Node.js 24. En una máquina local o un servidor, SQLite usa el directorio persistente `.data/`. La creación inicial requiere enlaces duros dentro del mismo directorio; las comprobaciones locales se hicieron en NTFS.

En Vercel, la demo de solo lectura usa SQLite en el directorio temporal de la función. Cada instancia nueva puede recrear su propia copia a partir de los datos de ejemplo. Las copias no se comparten ni son permanentes, por lo que no sirven para guardar pagos reales o cambios de usuarios. No hace falta una cuenta de base de datos externa.

En un servidor con almacenamiento persistente:

```sh
npm run build
npm start
```

Conservá `.data/` entre despliegues e incluila en las copias de seguridad. Ni la base ni los archivos de entorno locales deben subirse a Git.

### Comprobaciones

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run format:check
```

`npm run db:status` muestra la ubicación de la base, la fecha de corte y la cantidad de registros. Solo crea la base cuando no existe.

Las pruebas de navegador usan Google Chrome y la aplicación en `http://127.0.0.1:3100`. Para otra dirección, configurá `PLAYWRIGHT_BASE_URL` y ejecutá `npm run test:e2e`. Los resultados y las limitaciones están en [las notas de revisión](docs/AUDIT.md).

### Extensiones del navegador

Los avisos de hidratación que mencionan `bis_skin_checked`, `bis_register` o `__processed_*` pueden venir de una extensión que modifica la página antes de que arranque React. Probá un perfil de Invitado sin extensiones. Si así desaparecen, restringí el acceso de la extensión responsable al sitio local y recargá con `Ctrl+Shift+R`. No ocultes otros errores de hidratación.

---

© Freddy Guerra (Nattitor). All rights reserved / Todos los derechos reservados.
