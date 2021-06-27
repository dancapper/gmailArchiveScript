function gmailAutoarchive() {

//
//Example searches:
//
// label:<label>
// subject:<words in subject>
// category:<special category eg. Social>
// from:<sender>
// is:<starred, important, read, unread, etc>
//
// More information: https://support.google.com/mail/answer/7190?hl=en
//

  var globalrule = '-is:important -is:starred' // Include this search in all rules
  
  var rules = { // searches along with number of days to keep
    "label:dontkeepthese" : 2,
    "category:Social" : 14
  }

  var batch_size = 100;

  for (let search in rules) {
    var keepdays = rules[search];
    Logger.log(`Deleting all threads matching ${search} ${globalrule} older than ${keepdays} Days`);
    var allthreads = GmailApp.search(`${search} ${globalrule}`);
    Logger.log(`Identified total of ${allthreads.length.toString()} threads matching ${search} ${globalrule}`);
    var threads = GmailApp.search(`${search} ${globalrule} older_than:${keepdays}d`);
    Logger.log(`Identified ${threads.length.toString()} threads for deletion matching ${search} ${globalrule}`);
    while (threads.length) {
      var this_batch_size = Math.min(threads.length, batch_size);
      var this_batch = threads.splice(0, this_batch_size);
      GmailApp.moveThreadsToTrash(this_batch);
    }
  }
}
