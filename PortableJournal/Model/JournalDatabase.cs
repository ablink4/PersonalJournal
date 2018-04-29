using System.Collections.Generic;
using LiteDB;

namespace PortableJournal.Model
{
    public static class JournalDatabase
    {        
        /// <summary>
        /// Creates database if it doesn't exist
        /// Note: uses a hardcoded name because all journals reside 
        /// in a single local database
        /// </summary>
        /// <returns>the opened database</returns>
        private static LiteDatabase OpenDatabase()
        {
            return new LiteDatabase(@"JournalDatabase.db"); 
        }
        
        public static void AddJournal(Journal journalToAdd)
        {
            using (var database = OpenDatabase())
            {
                LiteCollection<Journal> journals = database.GetCollection<Journal>("journals");
                journals.Insert(journalToAdd);
            }
        }

        public static void UpdateJournal(Journal updatedJournal)
        {
            using (var database = OpenDatabase())
            {
                LiteCollection<Journal> journals = database.GetCollection<Journal>("journals");
                journals.Update(updatedJournal);
            }
        }

        public static List<Journal> GetExistingJournals()
        {
            List<Journal> existingJournals = new List<Journal>();

            using (var database = OpenDatabase())
            {
                foreach(Journal j in database.GetCollection<Journal>("journals").FindAll())
                {
                    existingJournals.Add(j);
                }
            }

            return existingJournals;
        }

        public static Journal GetOpenJournal()
        {
            using (var database = OpenDatabase())
            {
                return database.GetCollection<Journal>("journals").FindOne(x => x.IsOpen == true);
            }
        }

        public static void SetAsOpenJournal(string name)
        {
            using (var database = OpenDatabase())
            {
                MarkAllJournalsAsClosed();

                var journals = database.GetCollection<Journal>("journals");                
                Journal j = journals.FindOne(x => x.Name == name);
                j.IsOpen = true;
                journals.Update(j);
            }
        }

        private static void MarkAllJournalsAsClosed()
        {
            using (var database = OpenDatabase())
            {
                var journals = database.GetCollection<Journal>("journals");

                foreach (Journal journal in journals.FindAll())
                {
                    journal.IsOpen = false;
                    journals.Update(journal);
                }
            }
        }
    }
}
