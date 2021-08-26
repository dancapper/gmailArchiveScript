function gmailAutoarchive() {

  // gmailAutoArchive - A Google Script to find emails matching search criteria older than x days and trashes and/or archives them
  //
  // Example search terms:
  //
  // label:<label>                -- find emails with a specific label applied eg. "label:alderaan"
  // subject:<words in subject>   -- find emails with specific words in the subject header eg. "subject:hello there"
  // category:<category>          -- find emails in a specific inbox category eg. "category:social"
  // from:<sender>                -- find emails from the specified sender eg. "from:general kenobi" "from:kenobi@jedi.org"
  // is:<property>                -- find emails with specific properties eg. "is:read" "is:starred" "is:important"
  //
  // Multiple search terms can be seperated by spaces and will find emails which match all search terms.
  //   eg. "from:kenobi subject:hello there" will match only those emails from kenobi which also have "hello there" in the subject.
  // The OR operator or {} around a set of search terms will find emails which match ANY search terms. 
  //   eg. "from:artoo OR from:threepio" is equivalent to "{from:artoo from:threepio}"
  // The - operator before a search term excludes items which match the search term. 
  //   eg. "-subject:order 66" will exclude items with "order 66" in the subject.
  //
  // More information: https://support.google.com/mail/answer/7190?hl=en
  //

  const DEBUG = true;              // Debugging Output
  const BATCH_SIZE = 100;          // Batch Size, do not recommend changing this value

  const defaultactions = {         // Default actions for matches, suggest setting one or other of these to true
    archive : false,               // Archive will remove the items from your Inbox, they will still be available for searching
    trash :   false                // Trash will move the items to your Trash folder, they will be automatically deleted after 30 days
  };             
  
  const globalrule = '-is:starred' // Include in all search terms
    
  const rules = {                  // defined rules, examples as follows

//    "label:Beskar" : {           // Search terms
//      daystokeep : 14,           // Days to keep
//      archive : true,            // Override Default Actions
//      trash : false              // Override Default Actions
//    },
  
//    "from:Kenobi" : 14,          // Define Search temrs and days to keep only, use default actions
    
  }

  for (let search in rules) {
    
    var actions = Array();
    actions = defaultactions;

    var daystokeep = 0;
    
    if(DEBUG) Logger.log(`Search: [${search}]`);

    if (rules[search].hasOwnProperty('daystokeep'))  {
      if(DEBUG) Logger.log('Override Default Actions');
      daystokeep = rules[search].daystokeep;
      actions.archive = rules[search].archive;
      actions.trash = rules[search].trash;
    } else {
      daystokeep = rules[search]
    }

    if(DEBUG) Logger.log(`Find: [${search} ${globalrule}] older than [${daystokeep}] Days - Archive [${actions.archive}] Trash [${actions.trash}]`);

    var allthreads = GmailApp.search(`${search} ${globalrule}`);

    if(DEBUG) Logger.log(`Total of ${allthreads.length.toString()} threads matching ${search} ${globalrule}`);

    var threads = GmailApp.search(`${search} ${globalrule} older_than:${daystokeep}d`);

    if(DEBUG) Logger.log(`Identified ${threads.length.toString()} threads matching ${search} ${globalrule} older than ${daystokeep} Days`);
    
    while (threads.length) {
      var this_batch_size = Math.min(threads.length, BATCH_SIZE);
      var this_batch = threads.splice(0, this_batch_size);
      if(DEBUG) Logger.log(`Batched ${this_batch_size} threads for action`);
      if(actions.archive) {
        if(DEBUG) Logger.log(`Archiving ${this_batch_size} threads...`);
        GmailApp.moveThreadsToArchive(this_batch);
      } 
      if(actions.trash) {
        if(DEBUG) Logger.log(`Trashing ${this_batch_size} threads...`);
        GmailApp.moveThreadsToTrash(this_batch);
      }
    }
  }
}
