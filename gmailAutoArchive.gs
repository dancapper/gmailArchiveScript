function gmailAutoarchive() {

  // gmailAutoArchive - A Google Script to find emails matching search criteria older than x days and trashes or archives them
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

  // This rule will be added to all rules
  var globalrule = '-is:important -is:starred'
  
  // Specify each search and the number of days to keep here
  var rules = { 
    "label:dontkeepthese" : 2,
    "category:Social" : 14
  }
  
  // If both false, will not take any action and only log output.
  // Recommend setting one of these to true as you prefer.
  
  var trash = false; // if True, send mail to trash. if False, do not.
  var archive = false; // if True, send mail to Archive. if False do not.
  
  // Should be no need to touch anything below this line
  
  if(trash) Logger.log('Sending matching threads to trash');
  if(archive) Logger.log('Sending matching threads to archive');
  if(!(trash || archive)) Logger.log('Not taking any action on matching threads');

  var batch_size = 100;

  for (let search in rules) {
    var keepdays = rules[search];
    Logger.log(`Processing all threads matching ${search} ${globalrule} older than ${keepdays} Days`);
    var allthreads = GmailApp.search(`${search} ${globalrule}`);
    Logger.log(`Identified total of ${allthreads.length.toString()} threads matching ${search} ${globalrule}`);
    var threads = GmailApp.search(`${search} ${globalrule} older_than:${keepdays}d`);
    Logger.log(`Identified ${threads.length.toString()} threads for processing matching ${search} ${globalrule}`);
    while (threads.length) {
      var this_batch_size = Math.min(threads.length, batch_size);
      var this_batch = threads.splice(0, this_batch_size);
      if(trash) GmailApp.moveThreadsToTrash(this_batch);
      if(archive) GmailApp.moveThreadsToArchive(this_batch);
    }
  }
}
