YOUR SITE
index.html, services.html, style.css, app.js  = the site (you rarely touch these)
data/*.json = all your text, prices, albums, Instagram handle
images/      = your photos
admin/       = your login-protected editor at yoursite.com/admin

SETUP (one time, about 30 minutes)
1. Make a free GitHub account and a new repository. Upload everything in this folder to it.
2. Open admin/config.yml and replace YOUR-GITHUB-USERNAME/YOUR-REPO-NAME with yours.
3. Make a free Netlify account, choose "Import from Git", and pick that repository.
4. Create a GitHub OAuth app (GitHub > Settings > Developer settings > OAuth Apps). Use your Netlify site address as the Homepage URL.
5. In Netlify: Project configuration > Access & security > OAuth > Authentication providers > Install provider (GitHub). Paste the client ID and secret.
6. Visit yoursite.netlify.app/admin and log in with GitHub.
Menu labels at Netlify and GitHub change now and then; Decap's GitHub backend guide (decapcms.org/docs) has the current steps.

USING /ADMIN
Drag photos into any photo field, edit text and prices, add albums or specials, press Publish. The site updates in a minute or two.
Resize photos to about 2000px wide first so pages stay fast.

NOTES
- The site loads its content from data/*.json, so it must be hosted. Opening index.html straight from your computer won't show content.
- Inquiry form: submit one test after going live, then click the FormSubmit activation link emailed to noa.caspi4@gmail.com.
- Set your Instagram handle in admin > Business info.
