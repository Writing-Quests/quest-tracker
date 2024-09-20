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
