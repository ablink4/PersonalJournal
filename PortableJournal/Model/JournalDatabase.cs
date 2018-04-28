using LiteDB;

namespace PortableJournal.Model
{
    public class JournalDatabase
    {        
        public JournalDatabase() { }

        /// <summary>
        /// Creates database if it doesn't exist
        /// Note: uses a hardcoded name because all journals reside 
        /// in a single local database
        /// </summary>
        /// <returns>the opened database</returns>
        private LiteDatabase OpenDatabase()
        {
            return new LiteDatabase(@"JournalDatabase.db"); 
        }
        
        public void AddJournal(Journal journalToAdd)
        {
            using (var database = OpenDatabase())
            {
                LiteCollection<Journal> journals = database.GetCollection<Journal>("journals");
                journals.Insert(journalToAdd);
            }
        }

        public void UpdateJournal(Journal updatedJournal)
        {
            using (var database = OpenDatabase())
            {
                LiteCollection<Journal> journals = database.GetCollection<Journal>("journals");
                journals.Update(updatedJournal);
            }
        }
    }
}
