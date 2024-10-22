# quest-tracker
Quest Tracker enables individuals and Guides to track their progress on their writing/editing projects and Quests

# Getting started

1. Install [Lando](https://lando.dev/). The default Lando setup will install Docker Desktop & Docker Compose on your machine.
1. Start Lando with `lando start`. This will take a while, especially on the first time.
1. Run the database migrations with `lando php bin/console doctrine:migrations:migrate`
1. Access the site in your browser at `frontend.quest-tracker.lndo.site` (for a hot-reloading version of react) or `backend.quest-tracker.lndo.site` (to access symfony directly and a built version of the react app).

# FAQ

**How do I use composer/symfony-cli?**    
Run `lando composer` or `lando symfony`. These commands will execute in the appropriate docker container.

**Why does this use Lando?**    
Lando is set up to mimic the production environment. It includes Apache, PHP, and MySQL running on a Linux docker container.

**Why isn't the backend URL displaying anything in the browser?**    
Symfony isn't connected to the Vite dev server. You can build the frontend webapp using `lando npm run build`, but it's not necessary for local development. The backend URL should be able to serve everything (i.e. the API) just fine without this.

**How do I access emails?**    
For development, a "Mail Catcher" SMTP server runs with Docker/Lando and is automatically configured in Symfony. It will catch all emails and output them at http://localhost:1080. You can configure your own SMTP server in your `.env.local` file.

# Deploy Instructions

## Locally:
1. Change to the `deploy` branch (`git checkout deploy`)
1. Merge `main` into `deploy` (`git merge main`)
1. If there were any changes in the frontend app:
  1. Change `frontend/src/CONSTS.js` to be the prod values (this is a temporary step until we build a real consts sytem)
  1. Run `lando npm run build` to build the frontend prod app
  1. Force add the built files to git (`git add -f backend/public/app`) and then commit (`git commit`). These are normally part of the gitignore, so *never merge deploy into main!*
1. Push the `deploy` branch (`git push`)

## On the server:
1. Pull the latest changes in the git repo *(note: this is NOT in the webroot!)*
1. If backend consts have changed, update `backend/.env.local`
1. If there are any database changes, migrate the db (`php bin/console doctrine:migrations:migrate`)
1. Clear the Symfony cache (`php bin/console cache:clear`)
