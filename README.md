# quest-tracker
Quest Tracker enables individuals and Guides to track their progress on their writing/editing projects and Quests

# Getting started

1. Install [Lando](https://lando.dev/). The default Lando setup will install Docker Desktop & Docker Compose on your machine.
1. Start Lando with `lando start`. This will take a while, especially on the first time.
1. Access the site in your browser at `frontend.quest-tracker.lndo.site` (for a hot-reloading version of react) or `backend.quest-tracker.lndo.site` (to access symfony directly and a built version of the react app).
1. To build the frontend webapp, run `lando npm run build`

# FAQ

**How do I use composer/symfony-cli?**    
Run `lando composer` or `lando symfony`. These commands will execute in the appropriate docker container.

**Why does this use Lando?**    
Lando is set up to mimic the production environment. It includes Apache, PHP, and MySQL running on a Linux docker container.
