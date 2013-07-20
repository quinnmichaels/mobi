mobi
====

A web development panel (or dashboard) that simplifies your workflow.  In addition to easily switching between user agent
layouts, it allows you to easily keep track of issues (tickets, to-do items, etc.), and track the amount of time you spend
on individual issues.


It is designed to replace or suplement to-do lists (such as Trello), and supplement your version control system (like
Redmine).

Version Control Integration
---------------------------

Integration with Redmine is currently underway.



Downloading and Installing mobi
-------------------------------

1. Clone the repository: `git clone https://github.com/quinnmichaels/mobi.git`
2. Install dependencies: `npm install`
3. Start mobi server: `cd app; node app.js`
4. Navigate to http://localhost:9300


Using mobi
----------

- When you first connect to mobi, you'll see a URL bar at the bottom of thte screen.  Enter the URL of the site or project you're working on (you must include the `http://`).
- To access mobi's features, click the menu button in the lower right-hand corner (it looks like three horizontal bars).
- To view your website as it would appear on a different device, click one of the user agent buttons (Desktop, iPad, iPhone4, etc.).
- To create a new to-do item, click on the large plus icon (+) on the right.  Enter information about your to-do item.
- Cards are stored in your browser's local storage, so if you use a different browser, your cards will not be avaiable.
- Once you've saved a card, you can start a work timer by clicking the plus button (+) next to the timer on the card.  Note that starting a timer will stop all other timers (only one timer can be running at once).
- You can associate checklists with a card; click on the second icon in the card's menu bar.
